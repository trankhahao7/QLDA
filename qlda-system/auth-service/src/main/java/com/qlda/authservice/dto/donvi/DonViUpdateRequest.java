package com.qlda.authservice.dto.donvi;

public record DonViUpdateRequest(
    String maDonVi,
    String tenDonVi,
    Integer donViChaId,
    String dienThoai,
    String email,
    String diaChi,
    Boolean suDung
) {
}
