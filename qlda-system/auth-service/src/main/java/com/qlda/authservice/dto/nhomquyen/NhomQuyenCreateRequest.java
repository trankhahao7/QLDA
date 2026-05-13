package com.qlda.authservice.dto.nhomquyen;

import jakarta.validation.constraints.NotBlank;

public record NhomQuyenCreateRequest(
    @NotBlank String maNhomQuyen,
    @NotBlank String tenNhomQuyen,
    String moTa
) {
}
