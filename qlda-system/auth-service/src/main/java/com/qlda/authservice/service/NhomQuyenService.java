package com.qlda.authservice.service;

import com.qlda.authservice.common.ErrorCode;
import com.qlda.authservice.dto.common.IdResponse;
import com.qlda.authservice.dto.common.PageData;
import com.qlda.authservice.dto.nhomquyen.NhomQuyenCreateRequest;
import com.qlda.authservice.dto.nhomquyen.NhomQuyenResponse;
import com.qlda.authservice.dto.nhomquyen.NhomQuyenUpdateRequest;
import com.qlda.authservice.entity.NhomQuyen;
import com.qlda.authservice.exception.ApiException;
import com.qlda.authservice.repository.NhomQuyenRepository;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@Transactional(readOnly = true)
public class NhomQuyenService {

    private final NhomQuyenRepository nhomQuyenRepository;

    public NhomQuyenService(NhomQuyenRepository nhomQuyenRepository) {
        this.nhomQuyenRepository = nhomQuyenRepository;
    }

    public PageData<NhomQuyenResponse> getNhomQuyens(PageRequest pageRequest, String keyword, Boolean suDung) {
        Specification<NhomQuyen> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (StringUtils.hasText(keyword)) {
                String pattern = "%" + keyword.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("tenNhomQuyen")), pattern),
                    cb.like(cb.lower(root.get("maNhomQuyen")), pattern)
                ));
            }
            if (suDung != null) {
                predicates.add(cb.equal(root.get("suDung"), suDung));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<NhomQuyen> page = nhomQuyenRepository.findAll(spec, pageRequest);
        List<NhomQuyenResponse> content = page.getContent().stream()
                .map(this::toResponse)
                .toList();

        return new PageData<>(content, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }

    public NhomQuyenResponse getNhomQuyen(Integer id) {
        NhomQuyen nq = nhomQuyenRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorCode.ROLE_NOT_FOUND, "Role not found"));
        return toResponse(nq);
    }

    @Transactional
    public IdResponse createNhomQuyen(NhomQuyenCreateRequest request) {
        if (nhomQuyenRepository.existsByMaNhomQuyen(request.maNhomQuyen().trim())) {
            throw new ApiException(HttpStatus.CONFLICT, ErrorCode.DUPLICATE_USERNAME, "MaNhomQuyen already exists");
        }

        NhomQuyen nq = new NhomQuyen();
        nq.setMaNhomQuyen(request.maNhomQuyen().trim());
        nq.setTenNhomQuyen(request.tenNhomQuyen().trim());
        nq.setMoTa(request.moTa());
        nq.setSuDung(true);

        NhomQuyen saved = nhomQuyenRepository.save(nq);
        return new IdResponse(Long.valueOf(saved.getId()));
    }

    @Transactional
    public IdResponse updateNhomQuyen(Integer id, NhomQuyenUpdateRequest request) {
        NhomQuyen nq = nhomQuyenRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorCode.ROLE_NOT_FOUND, "Role not found"));

        if (StringUtils.hasText(request.maNhomQuyen())) {
            String newCode = request.maNhomQuyen().trim();
            if (!nq.getMaNhomQuyen().equals(newCode) && nhomQuyenRepository.existsByMaNhomQuyen(newCode)) {
                throw new ApiException(HttpStatus.CONFLICT, ErrorCode.DUPLICATE_USERNAME, "MaNhomQuyen already exists");
            }
            nq.setMaNhomQuyen(newCode);
        }
        if (StringUtils.hasText(request.tenNhomQuyen())) {
            nq.setTenNhomQuyen(request.tenNhomQuyen().trim());
        }
        if (request.moTa() != null) {
            nq.setMoTa(request.moTa());
        }
        if (request.suDung() != null) {
            nq.setSuDung(request.suDung());
        }

        nhomQuyenRepository.save(nq);
        return new IdResponse(Long.valueOf(nq.getId()));
    }

    @Transactional
    public IdResponse deleteNhomQuyen(Integer id) {
        NhomQuyen nq = nhomQuyenRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorCode.ROLE_NOT_FOUND, "Role not found"));
        nq.setSuDung(false);
        nhomQuyenRepository.save(nq);
        return new IdResponse(Long.valueOf(nq.getId()));
    }

    private NhomQuyenResponse toResponse(NhomQuyen nq) {
        return new NhomQuyenResponse(
                nq.getId(),
                nq.getMaNhomQuyen(),
                nq.getTenNhomQuyen(),
                nq.getMoTa(),
                nq.getSuDung()
        );
    }
}
