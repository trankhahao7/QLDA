package com.qlda.authservice.dto.nhomquyen;

public record PhanQuyenResponse(
    Integer id,
    Integer chucNangId,
    String maChucNang,
    String tenChucNang,
    Boolean isView,
    Boolean isCreate,
    Boolean isEdit,
    Boolean isDelete,
    Boolean isApprove
) {
}
