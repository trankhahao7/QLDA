package com.qlda.authservice.dto.donvi;

public record DonViResponse(
    Integer id,
    String maDonVi,
    String tenDonVi,
    Integer donViChaId,
    String tenDonViCha,
    String dienThoai,
    String email,
    String diaChi,
    Boolean suDung
) {
}
