package com.qlda.aiservice.service;

import com.qlda.aiservice.entity.AiDocumentChunkEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;

import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.sql.Types;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VectorSearchService {

    private final JdbcTemplate jdbcTemplate;

    private static final String SELECT_COLS = """
        id, van_ban_id, tep_dinh_kem_id, chunk_index, noi_dung,
        embedding::text AS embedding, metadata::text AS metadata, ngay_tao
        """;

    /**
     * Tìm top-K chunks gần nhất với queryEmbedding, có thể lọc theo vanBanId.
     * Dùng operator <=> của pgvector (cosine distance, nhỏ hơn = gần hơn).
     */
    public List<AiDocumentChunkEntity> findTopKBySimilarity(
            List<Double> queryEmbedding, Long vanBanId, int topK) {

        if (queryEmbedding == null || queryEmbedding.isEmpty()) {
            log.warn("Empty query embedding, returning empty results");
            return List.of();
        }

        String vectorStr = toVectorString(queryEmbedding);

        if (vanBanId != null) {
            return jdbcTemplate.query(
                "SELECT " + SELECT_COLS + """
                FROM ai_document_chunk
                WHERE van_ban_id = ?
                ORDER BY embedding <=> ?::vector
                LIMIT ?
                """,
                chunkRowMapper(),
                vanBanId, vectorStr, topK
            );
        }

        return jdbcTemplate.query(
            "SELECT " + SELECT_COLS + """
            FROM ai_document_chunk
            ORDER BY embedding <=> ?::vector
            LIMIT ?
            """,
            chunkRowMapper(),
            vectorStr, topK
        );
    }

    /**
     * Tìm top-K chunks loại hướng dẫn (metadata.type = 'huong_dan').
     */
    public List<AiDocumentChunkEntity> findTopKUserGuide(
            List<Double> queryEmbedding, int topK) {

        if (queryEmbedding == null || queryEmbedding.isEmpty()) {
            return List.of();
        }

        String vectorStr = toVectorString(queryEmbedding);

        return jdbcTemplate.query(
            "SELECT " + SELECT_COLS + """
            FROM ai_document_chunk
            WHERE metadata::jsonb ->> 'type' = 'huong_dan'
            ORDER BY embedding <=> ?::vector
            LIMIT ?
            """,
            chunkRowMapper(),
            vectorStr, topK
        );
    }

    /**
     * Insert batch chunks với embedding dạng vector và metadata dạng jsonb.
     * Dùng explicit cast để tránh type mismatch với cột vector(768) và jsonb.
     */
    public void insertChunks(List<AiDocumentChunkEntity> entities) {
        if (entities == null || entities.isEmpty()) return;

        jdbcTemplate.batchUpdate(
            """
            INSERT INTO ai_document_chunk
                (van_ban_id, tep_dinh_kem_id, chunk_index, noi_dung, embedding, metadata, ngay_tao)
            VALUES (?, ?, ?, ?, ?::vector, ?::jsonb, ?)
            """,
            entities,
            entities.size(),
            (PreparedStatement ps, AiDocumentChunkEntity e) -> {
                ps.setLong(1, e.getVanBanId());
                if (e.getTepDinhKemId() != null) ps.setLong(2, e.getTepDinhKemId());
                else ps.setNull(2, Types.BIGINT);
                ps.setInt(3, e.getChunkIndex());
                ps.setString(4, e.getNoiDung());
                ps.setString(5, e.getEmbedding());
                ps.setString(6, e.getMetadata() != null ? e.getMetadata() : "{}");
                ps.setTimestamp(7, e.getNgayTao() != null
                    ? Timestamp.valueOf(e.getNgayTao())
                    : new Timestamp(System.currentTimeMillis()));
            }
        );

        log.debug("Inserted {} chunks", entities.size());
    }

    public long countGuideChunks() {
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM ai_document_chunk WHERE metadata::jsonb ->> 'type' = 'huong_dan'",
            Integer.class
        );
        return count != null ? count : 0L;
    }

    /**
     * Chuyển List<Double> sang chuỗi pgvector: [x,y,z,...]
     */
    public String toVectorString(List<Double> embedding) {
        return "[" + embedding.stream()
            .map(d -> String.format("%.8f", d))
            .collect(Collectors.joining(",")) + "]";
    }

    private RowMapper<AiDocumentChunkEntity> chunkRowMapper() {
        return (rs, rowNum) -> {
            AiDocumentChunkEntity e = new AiDocumentChunkEntity();
            e.setId(rs.getLong("id"));
            e.setVanBanId(rs.getLong("van_ban_id"));
            long tepId = rs.getLong("tep_dinh_kem_id");
            e.setTepDinhKemId(rs.wasNull() ? null : tepId);
            e.setChunkIndex(rs.getInt("chunk_index"));
            e.setNoiDung(rs.getString("noi_dung"));
            e.setEmbedding(rs.getString("embedding"));
            e.setMetadata(rs.getString("metadata"));
            Timestamp ts = rs.getTimestamp("ngay_tao");
            e.setNgayTao(ts != null ? ts.toLocalDateTime() : null);
            return e;
        };
    }
}
