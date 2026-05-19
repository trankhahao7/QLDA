package com.qlda.aiservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "ketquaai")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiResultEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "vanbanid")
    private Long vanBanID;

    @Column(name = "nguoiyeucauid")
    private Long nguoiYeuCauID;

    @Enumerated(EnumType.STRING)
    @Column(name = "loaixulyai")
    private AiProcessType loaiXuLyAI;

    @Column(name = "noidungdauvao")
    private String noiDungDauVao;

    @Column(name = "ketquatrave")
    private String ketQuaTraVe;

    @Column(name = "dotincay")
    private Double doTinCay;

    @Column(name = "modelsudung")
    private String modelSuDung;

    @Column(name = "thoigianxuly")
    private LocalDateTime thoiGianXuLy;

    @Column(name = "ghichu")
    private String ghiChu;
}

