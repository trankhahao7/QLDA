import { useState } from "react";
import { ApiError } from "../../services/core/apiClient";
import { searchIncomingDocuments } from "../../services/documents/documentSearchApi";
import { semanticSearch, type SemanticSearchItem } from "../../services/ai/searchApi";
import type { DocumentListItem } from "../../services/documents/documentsApi";
import { getCurrentUser } from "../../services/auth/authApi";
import { Link } from "react-router-dom";

const TRANG_THAI_MAP: Record<number, { label: string; className: string }> = {
  0: { label: "Nháp", className: "badge badge--ghost" },
  1: { label: "Đang xử lý", className: "badge badge--info" },
  2: { label: "Đã chuyển xử lý", className: "badge badge--warning" },
  3: { label: "Trình ký", className: "badge badge--primary" },
  4: { label: "Đã ký", className: "badge badge--success" },
  5: { label: "Đã phát hành", className: "badge badge--success" },
};

interface VanBanTimKiem {
  id: number;
  soKyHieu: string;
  trichYeu: string;
  tenLoaiVanBan?: string;
  donViBanHanh: string;
  ngayTiepNhan: string;
  trangThai: number;
  score?: number;
  matchedText?: string;
}

export default function Search() {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [useSemanticSearch, setUseSemanticSearch] = useState(false);
  const [results, setResults] = useState<VanBanTimKiem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    setError(null);
    try {
      if (useSemanticSearch) {
        let userId: number | undefined;
        try {
          const me = await getCurrentUser();
          userId = me.id;
        } catch { /* ignore, userId optional */ }

        const response = await semanticSearch({
          keyword,
          userId: userId ?? 0,
          page: 0,
          size: 20,
        });
        const items: SemanticSearchItem[] = response.content || [];
        setResults(
          items.map((item) => ({
            id: item.documentId,
            soKyHieu: item.soKyHieu ?? "-",
            trichYeu: item.trichYeu,
            ngayTiepNhan: "",
            donViBanHanh: "-",
            trangThai: -1,
            score: item.score,
            matchedText: item.matchedText,
          }))
        );
      } else {
        const response = await searchIncomingDocuments({
          page: 0, size: 20,
          keyword: keyword || undefined,
          trangThai: status ? Number(status) : undefined,
        });
        setResults(
          (response.content || []).map((item: DocumentListItem) => ({
            id: item.id, soKyHieu: item.soKyHieu || "-", trichYeu: item.trichYeu,
            tenLoaiVanBan: item.tenLoaiVanBan, donViBanHanh: item.donViBanHanh || "-",
            ngayTiepNhan: item.ngayTiepNhan || "", trangThai: item.trangThai ?? -1,
          }))
        );
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không thể tìm kiếm");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="topbar">
        <div className="topbar__title">
          <h1>Tìm kiếm văn bản</h1>
          <p>Tìm theo từ khóa thông thường hoặc tìm kiếm ngữ nghĩa AI.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <form onSubmit={handleSearch}>
          <div className="filter-bar" style={{ marginBottom: 12 }}>
            <input
              type="text"
              className="form-control"
              placeholder={useSemanticSearch ? "🔍  Nhập câu hỏi hoặc từ khóa (AI tìm nghĩa)..." : "🔍  Nhập từ khóa văn bản..."}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ flex: 1, minWidth: 240 }}
            />
            {!useSemanticSearch && (
              <select className="form-control" style={{ minWidth: 160 }} value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">Tất cả trạng thái</option>
                <option value="1">Đang xử lý</option>
                <option value="2">Đã chuyển xử lý</option>
                <option value="4">Đã ký</option>
                <option value="5">Đã phát hành</option>
              </select>
            )}
            <button className="button" type="submit" disabled={loading}>
              {loading ? "Đang tìm..." : "Tìm kiếm"}
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}>
              <input
                type="checkbox"
                checked={useSemanticSearch}
                onChange={(e) => { setUseSemanticSearch(e.target.checked); setResults([]); setSearched(false); }}
              />
              <span>🤖 Tìm kiếm thông minh (AI ngữ nghĩa)</span>
            </label>
            {useSemanticSearch && (
              <span className="badge badge--info" style={{ fontSize: 11 }}>
                Powered by Gemini Embeddings
              </span>
            )}
          </div>
        </form>
      </div>

      {error && <div className="alert alert--error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="card">
        {!searched && (
          <div className="empty-state">
            <div className="empty-state__icon">{useSemanticSearch ? "🧠" : "🔍"}</div>
            <h3>{useSemanticSearch ? "Tìm kiếm ngữ nghĩa AI" : "Nhập từ khóa để tìm kiếm"}</h3>
            <p>
              {useSemanticSearch
                ? "Đặt câu hỏi tự nhiên. AI sẽ tìm văn bản có nội dung liên quan nhất."
                : "Tìm văn bản theo trích yếu, số ký hiệu hoặc đơn vị ban hành."}
            </p>
          </div>
        )}

        {searched && loading && (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Đang tìm kiếm{useSemanticSearch ? " (AI đang phân tích ngữ nghĩa)..." : "..."}</p>
          </div>
        )}

        {searched && !loading && !error && results.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__icon">📭</div>
            <h3>Không tìm thấy kết quả</h3>
            <p>Thử tìm kiếm với từ khóa khác{useSemanticSearch ? " hoặc chuyển sang tìm kiếm thông thường." : " hoặc bỏ bộ lọc trạng thái."}</p>
          </div>
        )}

        {results.length > 0 && (
          <>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
              Tìm thấy <strong>{results.length}</strong> kết quả
              {useSemanticSearch && <span className="badge badge--info" style={{ marginLeft: 8, fontSize: 11 }}>AI ngữ nghĩa</span>}
            </p>
            <table className="table">
              <thead>
                <tr>
                  <th>Mã</th>
                  {!useSemanticSearch && <th>Loại</th>}
                  <th>Nội dung</th>
                  {!useSemanticSearch && <th>Đơn vị</th>}
                  {!useSemanticSearch && <th>Ngày</th>}
                  {!useSemanticSearch && <th>Trạng thái</th>}
                  {useSemanticSearch && <th>Độ liên quan</th>}
                  {useSemanticSearch && <th>Đoạn phù hợp</th>}
                </tr>
              </thead>
              <tbody>
                {results.map((item) => {
                  const stt = TRANG_THAI_MAP[item.trangThai] ?? { label: "Không xác định", className: "badge badge--ghost" };
                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{item.soKyHieu}</td>
                      {!useSemanticSearch && (
                        <td style={{ fontSize: 13, whiteSpace: "nowrap" }}>{item.tenLoaiVanBan || "-"}</td>
                      )}
                      <td>
                        <Link to={`/documents/${item.id}`} style={{ color: "var(--accent-strong)", fontWeight: 500 }}>
                          {item.trichYeu}
                        </Link>
                      </td>
                      {!useSemanticSearch && (
                        <td style={{ fontSize: 13 }}>{item.donViBanHanh}</td>
                      )}
                      {!useSemanticSearch && (
                        <td style={{ whiteSpace: "nowrap", fontSize: 13 }}>
                          {item.ngayTiepNhan ? new Date(item.ngayTiepNhan).toLocaleDateString("vi-VN") : "-"}
                        </td>
                      )}
                      {!useSemanticSearch && (
                        <td><span className={stt.className}>{stt.label}</span></td>
                      )}
                      {useSemanticSearch && (
                        <td style={{ whiteSpace: "nowrap", fontSize: 13 }}>
                          {item.score != null ? (
                            <span style={{ fontWeight: 600, color: item.score > 0.7 ? "#22c55e" : "#f59e0b" }}>
                              {Math.round(item.score * 100)}%
                            </span>
                          ) : "-"}
                        </td>
                      )}
                      {useSemanticSearch && (
                        <td style={{ fontSize: 12, color: "var(--text-muted)", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.matchedText || "-"}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </div>
    </section>
  );
}
