package com.qlda.documentservice.service;

import com.qlda.documentservice.config.AppProperties;
import com.qlda.documentservice.dto.request.DocumentRequests;
import com.qlda.documentservice.dto.response.DocumentResponses;
import com.qlda.documentservice.entity.ChuKySo;
import com.qlda.documentservice.entity.TepDinhKem;
import com.qlda.documentservice.entity.VanBan;
import com.qlda.documentservice.repository.ChuKySoRepository;
import com.qlda.documentservice.repository.TepDinhKemRepository;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * Records digital signature metadata for published documents.
 * Uses SHA-256 of the primary attachment as the file integrity hash.
 * When a CA provider (VNPT/Viettel) is configured, plug in via certInfo field.
 */
@Service
public class DigitalSignatureService {

    private static final Logger log = LoggerFactory.getLogger(DigitalSignatureService.class);
    private static final String LOCAL_CERT = "LOCAL_HASH_SHA256";

    private final ChuKySoRepository chuKySoRepository;
    private final TepDinhKemRepository tepDinhKemRepository;
    private final String localUploadDir;

    public DigitalSignatureService(
            ChuKySoRepository chuKySoRepository,
            TepDinhKemRepository tepDinhKemRepository,
            AppProperties appProperties) {
        this.chuKySoRepository = chuKySoRepository;
        this.tepDinhKemRepository = tepDinhKemRepository;
        this.localUploadDir = appProperties.getUploadDir();
    }

    /**
     * Records a digital signature event for the given document.
     * Computes SHA-256 of the primary attachment (if available) as the integrity hash.
     */
    @Transactional
    public void sign(VanBan vanBan, DocumentRequests.DigitalSignRequest request) {
        String fileHash = computeFileHash(vanBan.getId());

        ChuKySo chuKySo = new ChuKySo();
        chuKySo.setVanBanId(vanBan.getId());
        chuKySo.setNguoiKyId(request.nguoiKyId());
        chuKySo.setNgayKy(LocalDateTime.now());
        chuKySo.setLoaiKy(StringUtils.hasText(request.signatureType()) ? request.signatureType() : LOCAL_CERT);
        chuKySo.setGhiChu(request.ghiChu());
        chuKySo.setHashFile(fileHash);
        chuKySo.setCertInfo(LOCAL_CERT);

        chuKySoRepository.save(chuKySo);
        log.info("Recorded digital signature for documentId={}, signer={}, hash={}",
                vanBan.getId(), request.nguoiKyId(), fileHash);
    }

    /** Returns the most recent signature record for a document, if any. */
    public Optional<DocumentResponses.SignatureInfoResponse> getSignatureInfo(Long documentId) {
        return chuKySoRepository.findFirstByVanBanIdOrderByNgayKyDesc(documentId)
                .map(c -> new DocumentResponses.SignatureInfoResponse(
                        c.getVanBanId(),
                        c.getNguoiKyId(),
                        c.getNgayKy(),
                        c.getLoaiKy(),
                        c.getGhiChu(),
                        c.getHashFile(),
                        c.getCertInfo()));
    }

    private String computeFileHash(Long documentId) {
        List<TepDinhKem> attachments = tepDinhKemRepository.findByVanBan_Id(documentId);
        if (attachments.isEmpty()) {
            log.debug("No attachments for documentId={}, signature recorded without file hash", documentId);
            return null;
        }
        Path localFile = resolveLocalPath(attachments.get(0).getDuongDanTep());
        if (!Files.exists(localFile)) {
            log.warn("Attachment file not found on disk: {}", localFile);
            return null;
        }
        try {
            byte[] content = Files.readAllBytes(localFile);
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(content);
            return HexFormat.of().formatHex(hash);
        } catch (IOException | NoSuchAlgorithmException ex) {
            log.error("Failed to compute file hash for documentId={}: {}", documentId, ex.getMessage(), ex);
            return null;
        }
    }

    private Path resolveLocalPath(String storedPath) {
        if (storedPath == null) return Paths.get("");
        Path p = Paths.get(storedPath);
        return p.isAbsolute() ? p : Paths.get(localUploadDir).resolve(storedPath);
    }
}
