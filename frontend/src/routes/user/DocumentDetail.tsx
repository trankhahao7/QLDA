import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ApiError } from "../../services/core/apiClient";
import { fetchIncomingDetail } from "../../services/documents/documentsApi";
import { fetchWorkflowTimeline } from "../../services/workflows/workflowTrackingApi";

export default function DocumentDetail() {
  const { id } = useParams();
  const [doc, setDoc] = useState({
    soKyHieu: "",
    trichYeu: "",
    nguoiGui: "",
    noiDung: "",
  });
  const [lichSu, setLichSu] = useState<Array<{ date: string; action: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const [detail, timeline] = await Promise.all([
          fetchIncomingDetail(Number(id)),
          fetchWorkflowTimeline(Number(id)),
        ]);

        setDoc({
          soKyHieu: detail.soKyHieu || `VB-${id}`,
          trichYeu: detail.trichYeu,
          nguoiGui: detail.donViBanHanh || detail.nguoiKy || "-",
          noiDung: detail.trichYeu,
        });
        setLichSu(
          (timeline || []).map((item) => ({
            date: item.ngayNhan ? new Date(item.ngayNhan).toLocaleDateString("vi-VN") : "-",
            action: item.hanhDongXuLy || item.tenBuoc || "-",
          }))
        );
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Không thể tải chi tiết văn bản";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [id]);

  return (
    <section>
      <div className="topbar">
        <div className="topbar__title">
          <h1>Chi tiết văn bản</h1>
          <p>Thông tin đầy đủ, luồng xử lý và lịch sử hành động.</p>
        </div>
      </div>

      {loading && <div className="card">Đang tải...</div>}
      {error && <div className="card">{error}</div>}
      {!loading && !error && (
        <div className="grid-2">
        <div className="card">
          <h3>{doc.soKyHieu} - {doc.trichYeu}</h3>
          <p><strong>Nơi gửi:</strong> {doc.nguoiGui}</p>
          <p>{doc.noiDung}</p>
        </div>
        <div className="card">
          <h3>Lịch sử xử lý</h3>
          <ul>
            {lichSu.map((h, idx) => (
              <li key={idx}>{h.date} - {h.action}</li>
            ))}
          </ul>
        </div>
        </div>
      )}
    </section>
  );
}
