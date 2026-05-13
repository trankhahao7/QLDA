package com.qlda.authservice.controller;

import com.qlda.authservice.common.ApiResponse;
import com.qlda.authservice.dto.common.IdResponse;
import com.qlda.authservice.dto.common.PageData;
import com.qlda.authservice.dto.donvi.DonViCreateRequest;
import com.qlda.authservice.dto.donvi.DonViResponse;
import com.qlda.authservice.dto.donvi.DonViUpdateRequest;
import com.qlda.authservice.service.DonViService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import java.util.List;
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
@RequestMapping("/api/auth/don-vi")
public class DonViController {

    private final DonViService donViService;

    public DonViController(DonViService donViService) {
        this.donViService = donViService;
    }

    @GetMapping
    public ApiResponse<PageData<DonViResponse>> getDonVis(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean suDung
    ) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        return ApiResponse.success("Get units successfully", donViService.getDonVis(pageRequest, keyword, suDung));
    }

    @GetMapping("/tree")
    public ApiResponse<List<DonViResponse>> getDonViTree() {
        return ApiResponse.success("Get unit tree successfully", donViService.getDonViTree());
    }

    @GetMapping("/{id}")
    public ApiResponse<DonViResponse> getDonVi(@PathVariable Integer id) {
        return ApiResponse.success("Get unit detail successfully", donViService.getDonVi(id));
    }

    @PostMapping
    public ApiResponse<IdResponse> createDonVi(@Valid @RequestBody DonViCreateRequest request) {
        return ApiResponse.success("Create unit successfully", donViService.createDonVi(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<IdResponse> updateDonVi(@PathVariable Integer id, @Valid @RequestBody DonViUpdateRequest request) {
        return ApiResponse.success("Update unit successfully", donViService.updateDonVi(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<IdResponse> deleteDonVi(@PathVariable Integer id) {
        return ApiResponse.success("Delete unit successfully", donViService.deleteDonVi(id));
    }
}
