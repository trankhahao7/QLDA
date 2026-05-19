package com.qlda.authservice.dto.nhomquyen;

public record NhomQuyenUpdateRequest(
    String maNhomQuyen,
    String tenNhomQuyen,
    String moTa,
    Boolean suDung
) {
}
