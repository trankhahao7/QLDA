package com.qlda.authservice.dto.nhomquyen;

import java.util.List;

public record RolePermissionsResponse(
    Integer roleId,
    String maNhomQuyen,
    String tenNhomQuyen,
    List<PhanQuyenResponse> permissions
) {
}
