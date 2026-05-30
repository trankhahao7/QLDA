package com.qlda.workflowservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "UyQuyen")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UyQuyen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "NguoiUyQuyenID", nullable = false)
    private Long nguoiUyQuyenId;

    @Column(name = "NguoiDuocUyQuyenID", nullable = false)
    private Long nguoiDuocUyQuyenId;

    @Column(name = "TuNgay", nullable = false)
    private LocalDate tuNgay;

    @Column(name = "DenNgay", nullable = false)
    private LocalDate denNgay;

    @Column(name = "PhamViUyQuyen", length = 100)
    private String phamViUyQuyen;

    @Column(name = "GhiChu", columnDefinition = "TEXT")
    private String ghiChu;

    @Column(name = "Active", nullable = false)
    private Boolean active;
}
