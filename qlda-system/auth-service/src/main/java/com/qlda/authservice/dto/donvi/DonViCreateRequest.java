package com.qlda.authservice.dto.donvi;

import jakarta.validation.constraints.NotBlank;

public record DonViCreateRequest(
    @NotBlank String maDonVi,
    @NotBlank String tenDonVi,
    Integer donViChaId,
    String dienThoai,
    String email,
    String diaChi
) {
}
