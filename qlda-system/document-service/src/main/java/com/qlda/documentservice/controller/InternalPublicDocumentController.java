package com.qlda.documentservice.controller;

import com.qlda.documentservice.common.ApiResponse;
import com.qlda.documentservice.common.PageResponse;
import com.qlda.documentservice.dto.request.DocumentRequests;
import com.qlda.documentservice.dto.response.DocumentResponses;
import com.qlda.documentservice.service.DocumentWorkflowService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/documents/internal")
@PreAuthorize("hasAnyRole('ADMIN','CHUYEN_VIEN','LANH_DAO')")
public class InternalPublicDocumentController {

    private final DocumentWorkflowService documentWorkflowService;

    public InternalPublicDocumentController(DocumentWorkflowService documentWorkflowService) {
        this.documentWorkflowService = documentWorkflowService;
    }

    @PostMapping
    public ApiResponse<DocumentResponses.DocumentSimpleResponse> create(
        @Valid @RequestBody DocumentRequests.IncomingDocumentRequest request
    ) {
        return ApiResponse.success("Create internal document successfully", documentWorkflowService.createInternal(request));
    }

    @GetMapping
    public ApiResponse<PageResponse<DocumentResponses.DocumentListItemResponse>> list(
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) Integer loaiVanBanId,
        @RequestParam(required = false) Integer trangThai,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
        @PageableDefault(page = 0, size = 20) Pageable pageable
    ) {
        return ApiResponse.success(
            "Get internal documents successfully",
            documentWorkflowService.listInternal(keyword, loaiVanBanId, trangThai, fromDate, toDate, pageable)
        );
    }
}
