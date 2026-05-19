package com.qlda.authservice.service;

import com.qlda.authservice.common.ErrorCode;
import com.qlda.authservice.dto.common.IdResponse;
import com.qlda.authservice.dto.common.PageData;
import com.qlda.authservice.dto.donvi.DonViCreateRequest;
import com.qlda.authservice.dto.donvi.DonViResponse;
import com.qlda.authservice.dto.donvi.DonViUpdateRequest;
import com.qlda.authservice.entity.DonVi;
import com.qlda.authservice.exception.ApiException;
import com.qlda.authservice.repository.DonViRepository;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
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
public class DonViService {

    private final DonViRepository donViRepository;

    public DonViService(DonViRepository donViRepository) {
        this.donViRepository = donViRepository;
    }

    public PageData<DonViResponse> getDonVis(PageRequest pageRequest, String keyword, Boolean suDung) {
        Specification<DonVi> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (StringUtils.hasText(keyword)) {
                String pattern = "%" + keyword.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("tenDonVi")), pattern),
                    cb.like(cb.lower(root.get("maDonVi")), pattern)
                ));
            }
            if (suDung != null) {
                predicates.add(cb.equal(root.get("suDung"), suDung));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<DonVi> page = donViRepository.findAll(spec, pageRequest);
        List<DonViResponse> content = page.getContent().stream()
                .map(this::toResponse)
                .toList();

        return new PageData<>(content, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }

    public List<DonViResponse> getDonViTree() {
        List<DonVi> all = donViRepository.findAll(Sort.by(Sort.Direction.ASC, "tenDonVi"));
        return all.stream().map(this::toResponse).toList();
    }

    public DonViResponse getDonVi(Integer id) {
        DonVi dv = donViRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorCode.UNIT_NOT_FOUND, "Unit not found"));
        return toResponse(dv);
    }

    @Transactional
    public IdResponse createDonVi(DonViCreateRequest request) {
        if (donViRepository.existsByMaDonVi(request.maDonVi().trim())) {
            throw new ApiException(HttpStatus.CONFLICT, ErrorCode.DUPLICATE_UNIT_CODE, "MaDonVi already exists");
        }

        DonVi dv = new DonVi();
        dv.setMaDonVi(request.maDonVi().trim());
        dv.setTenDonVi(request.tenDonVi().trim());
        dv.setDienThoai(request.dienThoai());
        dv.setEmail(request.email());
        dv.setDiaChi(request.diaChi());
        dv.setSuDung(true);
        dv.setNgayTao(LocalDateTime.now());
        dv.setNgayCapNhat(LocalDateTime.now());

        if (request.donViChaId() != null) {
            DonVi parent = donViRepository.findById(request.donViChaId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorCode.UNIT_NOT_FOUND, "Parent unit not found"));
            dv.setDonViCha(parent);
        }

        DonVi saved = donViRepository.save(dv);
        return new IdResponse(Long.valueOf(saved.getId()));
    }

    @Transactional
    public IdResponse updateDonVi(Integer id, DonViUpdateRequest request) {
        DonVi dv = donViRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorCode.UNIT_NOT_FOUND, "Unit not found"));

        if (StringUtils.hasText(request.maDonVi())) {
            String newCode = request.maDonVi().trim();
            if (!dv.getMaDonVi().equals(newCode) && donViRepository.existsByMaDonVi(newCode)) {
                throw new ApiException(HttpStatus.CONFLICT, ErrorCode.DUPLICATE_UNIT_CODE, "MaDonVi already exists");
            }
            dv.setMaDonVi(newCode);
        }
        if (StringUtils.hasText(request.tenDonVi())) {
            dv.setTenDonVi(request.tenDonVi().trim());
        }
        if (request.donViChaId() != null) {
            DonVi parent = donViRepository.findById(request.donViChaId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorCode.UNIT_NOT_FOUND, "Parent unit not found"));
            dv.setDonViCha(parent);
        } else if (request.donViChaId() == null && request.maDonVi() != null) {
            dv.setDonViCha(null);
        }
        if (request.dienThoai() != null) {
            dv.setDienThoai(request.dienThoai());
        }
        if (request.email() != null) {
            dv.setEmail(request.email());
        }
        if (request.diaChi() != null) {
            dv.setDiaChi(request.diaChi());
        }
        if (request.suDung() != null) {
            dv.setSuDung(request.suDung());
        }
        dv.setNgayCapNhat(LocalDateTime.now());

        donViRepository.save(dv);
        return new IdResponse(Long.valueOf(dv.getId()));
    }

    @Transactional
    public IdResponse deleteDonVi(Integer id) {
        DonVi dv = donViRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, ErrorCode.UNIT_NOT_FOUND, "Unit not found"));
        dv.setSuDung(false);
        dv.setNgayCapNhat(LocalDateTime.now());
        donViRepository.save(dv);
        return new IdResponse(Long.valueOf(dv.getId()));
    }

    private DonViResponse toResponse(DonVi dv) {
        return new DonViResponse(
                dv.getId(),
                dv.getMaDonVi(),
                dv.getTenDonVi(),
                dv.getDonViCha() == null ? null : dv.getDonViCha().getId(),
                dv.getDonViCha() == null ? null : dv.getDonViCha().getTenDonVi(),
                dv.getDienThoai(),
                dv.getEmail(),
                dv.getDiaChi(),
                dv.getSuDung()
        );
    }
}
