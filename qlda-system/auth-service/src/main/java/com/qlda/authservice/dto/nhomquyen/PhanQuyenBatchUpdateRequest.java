package com.qlda.authservice.dto.nhomquyen;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record PhanQuyenBatchUpdateRequest(
    @Valid
    @NotNull(message = "permissions is required")
    List<PermissionEntry> permissions
) {

    public record PermissionEntry(
        @NotNull Integer chucNangId,
        @NotNull Boolean isView,
        @NotNull Boolean isCreate,
        @NotNull Boolean isEdit,
        @NotNull Boolean isDelete,
        @NotNull Boolean isApprove
    ) {
    }
}
