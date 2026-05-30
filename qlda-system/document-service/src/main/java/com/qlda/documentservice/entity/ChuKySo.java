package com.qlda.documentservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "ChuKySo")
@Getter
@Setter
@NoArgsConstructor
public class ChuKySo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "VanBanID", nullable = false)
    private Long vanBanId;

    @Column(name = "NguoiKyID")
    private Long nguoiKyId;

    @Column(name = "NgayKy", nullable = false)
    private LocalDateTime ngayKy;

    @Column(name = "LoaiKy", length = 50)
    private String loaiKy;

    @Column(name = "GhiChu", columnDefinition = "TEXT")
    private String ghiChu;

    /** SHA-256 hex digest of the signed file content. */
    @Column(name = "HashFile", length = 64)
    private String hashFile;

    /** CA certificate info or "LOCAL_HASH_SHA256" when no CA is configured. */
    @Column(name = "CertInfo", columnDefinition = "TEXT")
    private String certInfo;
}
