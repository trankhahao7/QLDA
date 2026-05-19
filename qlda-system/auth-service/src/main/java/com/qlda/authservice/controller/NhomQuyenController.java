package com.qlda.authservice.controller;

import com.qlda.authservice.common.ApiResponse;
import com.qlda.authservice.dto.common.IdResponse;
import com.qlda.authservice.dto.common.PageData;
import com.qlda.authservice.dto.nhomquyen.NhomQuyenCreateRequest;
import com.qlda.authservice.dto.nhomquyen.NhomQuyenResponse;
import com.qlda.authservice.dto.nhomquyen.NhomQuyenUpdateRequest;
import com.qlda.authservice.dto.nhomquyen.PhanQuyenBatchUpdateRequest;
import com.qlda.authservice.dto.nhomquyen.RolePermissionsResponse;
import com.qlda.authservice.service.NhomQuyenService;
import com.qlda.authservice.service.PhanQuyenService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/auth/roles")
public class NhomQuyenController {

    private final NhomQuyenService nhomQuyenService;
    private final PhanQuyenService phanQuyenService;

    public NhomQuyenController(NhomQuyenService nhomQuyenService, PhanQuyenService phanQuyenService) {
        this.nhomQuyenService = nhomQuyenService;
        this.phanQuyenService = phanQuyenService;
    }

    @GetMapping
    public ApiResponse<PageData<NhomQuyenResponse>> getNhomQuyens(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean suDung
    ) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        return ApiResponse.success("Get roles successfully", nhomQuyenService.getNhomQuyens(pageRequest, keyword, suDung));
    }

    @GetMapping("/{id}")
    public ApiResponse<NhomQuyenResponse> getNhomQuyen(@PathVariable Integer id) {
        return ApiResponse.success("Get role detail successfully", nhomQuyenService.getNhomQuyen(id));
    }

    @PostMapping
    public ApiResponse<IdResponse> createNhomQuyen(@Valid @RequestBody NhomQuyenCreateRequest request) {
        return ApiResponse.success("Create role successfully", nhomQuyenService.createNhomQuyen(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<IdResponse> updateNhomQuyen(@PathVariable Integer id, @Valid @RequestBody NhomQuyenUpdateRequest request) {
        return ApiResponse.success("Update role successfully", nhomQuyenService.updateNhomQuyen(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<IdResponse> deleteNhomQuyen(@PathVariable Integer id) {
        return ApiResponse.success("Delete role successfully", nhomQuyenService.deleteNhomQuyen(id));
    }

    @GetMapping("/{roleId}/permissions")
    public ApiResponse<RolePermissionsResponse> getRolePermissions(@PathVariable Integer roleId) {
        return ApiResponse.success("Get role permissions successfully", phanQuyenService.getRolePermissions(roleId));
    }

    @PutMapping("/{roleId}/permissions")
    public ApiResponse<PhanQuyenService.RolePermissionsUpdateResponse> updateRolePermissions(
            @PathVariable Integer roleId,
            @Valid @RequestBody PhanQuyenBatchUpdateRequest request
    ) {
        return ApiResponse.success("Update role permissions successfully", phanQuyenService.updateRolePermissions(roleId, request));
    }
}
