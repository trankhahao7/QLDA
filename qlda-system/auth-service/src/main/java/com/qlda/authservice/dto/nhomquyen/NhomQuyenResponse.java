package com.qlda.authservice.dto.nhomquyen;

public record NhomQuyenResponse(
    Integer id,
    String maNhomQuyen,
    String tenNhomQuyen,
    String moTa,
    Boolean suDung
) {
}
