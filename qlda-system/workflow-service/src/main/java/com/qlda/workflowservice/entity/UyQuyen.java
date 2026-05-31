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
@Table(name = "uyquyen")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UyQuyen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "nguoiuyquyenid", nullable = false)
    private Long nguoiUyQuyenId;

    @Column(name = "nguoiduocuyquyenid", nullable = false)
    private Long nguoiDuocUyQuyenId;

    @Column(name = "tungay", nullable = false)
    private LocalDate tuNgay;

    @Column(name = "denngay", nullable = false)
    private LocalDate denNgay;

    @Column(name = "phamviuyquyen", length = 100)
    private String phamViUyQuyen;

    @Column(name = "ghichu", columnDefinition = "TEXT")
    private String ghiChu;

    @Column(name = "active", nullable = false)
    private Boolean active;
}
