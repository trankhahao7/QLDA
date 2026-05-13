package com.qlda.authservice.service;

import com.qlda.authservice.common.ErrorCode;
import com.qlda.authservice.dto.nhomquyen.PhanQuyenBatchUpdateRequest;
import com.qlda.authservice.dto.nhomquyen.PhanQuyenResponse;
import com.qlda.authservice.dto.nhomquyen.RolePermissionsResponse;
import com.qlda.authservice.entity.ChucNang;
import com.qlda.authservice.entity.NhomQuyen;
import com.qlda.authservice.entity.PhanQuyen;
import com.qlda.authservice.exception.ApiException;
import com.qlda.authservice.repository.ChucNangRepository;
import com.qlda.authservice.repository.NhomQuyenRepository;
import com.qlda.authservice.repository.PhanQuyenRepository;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PhanQuyenService {

    private final PhanQuyenRepository phanQuyenRepository;
    private final NhomQuyenRepository nhomQuyenRepository;
    private final ChucNangRepository chucNangRepository;

    public PhanQuyenService(
            PhanQuyenRepository phanQuyenRepository,
            NhomQuyenRepository nhomQuyenRepository,
            ChucNangRepository chucNangRepository
    ) {
        this.phanQuyenRepository = phanQuyenRepository;
        this.nhomQuyenRepository = nhomQuyenRepository;
        this.chucNangRepository = chucNangRepository;
    }

    public RolePermissionsResponse getRolePermissions(Integer roleId) {
        NhomQuyen role = nhomQuyenRepository.findById(roleId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorCode.ROLE_NOT_FOUND, "Role not found"));

        List<PhanQuyen> existing = phanQuyenRepository.findByNhomQuyen_Id(roleId);
        Map<Integer, PhanQuyen> permissionByChucNangId = existing.stream()
                .collect(Collectors.toMap(pq -> pq.getChucNang().getId(), pq -> pq));

        List<ChucNang> allFunctions = chucNangRepository.findAll().stream()
                .sorted(Comparator.comparing(ChucNang::getId))
                .toList();

        List<PhanQuyenResponse> responses = new ArrayList<>();
        for (ChucNang fn : allFunctions) {
            PhanQuyen existingPq = permissionByChucNangId.get(fn.getId());
            if (existingPq != null) {
                responses.add(toPermissionResponse(existingPq));
            } else {
                responses.add(new PhanQuyenResponse(
                        null, fn.getId(), fn.getMaChucNang(), fn.getTenChucNang(),
                        false, false, false, false, false
                ));
            }
        }

        return new RolePermissionsResponse(role.getId(), role.getMaNhomQuyen(), role.getTenNhomQuyen(), responses);
    }

    @Transactional
    public RolePermissionsUpdateResponse updateRolePermissions(Integer roleId, PhanQuyenBatchUpdateRequest request) {
        NhomQuyen role = nhomQuyenRepository.findById(roleId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorCode.ROLE_NOT_FOUND, "Role not found"));

        int updated = 0;
        for (PhanQuyenBatchUpdateRequest.PermissionEntry entry : request.permissions()) {
            ChucNang fn = chucNangRepository.findById(entry.chucNangId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorCode.PERMISSION_NOT_FOUND,
                            "Function not found: " + entry.chucNangId()));

            PhanQuyen pq = phanQuyenRepository
                    .findByNhomQuyen_IdAndChucNang_Id(roleId, entry.chucNangId())
                    .orElseGet(() -> {
                        PhanQuyen newPq = new PhanQuyen();
                        newPq.setNhomQuyen(role);
                        newPq.setChucNang(fn);
                        return newPq;
                    });

            pq.setIsView(entry.isView());
            pq.setIsCreate(entry.isCreate());
            pq.setIsEdit(entry.isEdit());
            pq.setIsDelete(entry.isDelete());
            pq.setIsApprove(entry.isApprove());

            phanQuyenRepository.save(pq);
            updated++;
        }

        return new RolePermissionsUpdateResponse(roleId, updated);
    }

    public record RolePermissionsUpdateResponse(Integer roleId, int totalUpdated) {
    }

    private PhanQuyenResponse toPermissionResponse(PhanQuyen pq) {
        return new PhanQuyenResponse(
                pq.getId(),
                pq.getChucNang().getId(),
                pq.getChucNang().getMaChucNang(),
                pq.getChucNang().getTenChucNang(),
                Boolean.TRUE.equals(pq.getIsView()),
                Boolean.TRUE.equals(pq.getIsCreate()),
                Boolean.TRUE.equals(pq.getIsEdit()),
                Boolean.TRUE.equals(pq.getIsDelete()),
                Boolean.TRUE.equals(pq.getIsApprove())
        );
    }
}
