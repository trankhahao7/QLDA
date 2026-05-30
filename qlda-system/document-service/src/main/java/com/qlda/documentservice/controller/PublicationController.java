package com.qlda.documentservice.controller;

import com.qlda.documentservice.common.ApiResponse;
import com.qlda.documentservice.dto.request.DocumentRequests;
import com.qlda.documentservice.dto.response.DocumentResponses;
import com.qlda.documentservice.entity.VanBan;
import com.qlda.documentservice.repository.VanBanRepository;
import com.qlda.documentservice.service.DigitalSignatureService;
import com.qlda.documentservice.service.DocumentWorkflowService;
import com.qlda.documentservice.service.SharePointService;
import jakarta.validation.Valid;
import java.util.Optional;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/documents")
@PreAuthorize("hasAnyRole('ADMIN','CHUYEN_VIEN','LANH_DAO')")
public class PublicationController {
    private final DocumentWorkflowService documentWorkflowService;
    private final VanBanRepository vanBanRepository;
    private final Optional<SharePointService> sharePointService;
    private final DigitalSignatureService digitalSignatureService;

    public PublicationController(
            DocumentWorkflowService documentWorkflowService,
            VanBanRepository vanBanRepository,
            Optional<SharePointService> sharePointService,
            DigitalSignatureService digitalSignatureService) {
        this.documentWorkflowService = documentWorkflowService;
        this.vanBanRepository = vanBanRepository;
        this.sharePointService = sharePointService;
        this.digitalSignatureService = digitalSignatureService;
    }

    @PostMapping("/{id}/digital-sign")
    public ApiResponse<DocumentResponses.DigitalSignResponse> digitalSign(
        @PathVariable Long id,
        @RequestBody DocumentRequests.DigitalSignRequest request
    ) {
        return ApiResponse.success("Digital sign document successfully", documentWorkflowService.digitalSign(id, request));
    }

    @PostMapping("/{id}/publish")
    public ApiResponse<DocumentResponses.PublishResponse> publish(
        @PathVariable Long id,
        @Valid @RequestBody DocumentRequests.PublishRequest request
    ) {
        return ApiResponse.success("Publish document successfully", documentWorkflowService.publish(id, request));
    }

    @PostMapping("/{id}/send")
    public ApiResponse<DocumentResponses.SendDocumentResponse> send(
        @PathVariable Long id,
        @RequestBody DocumentRequests.SendDocumentRequest request
    ) {
        return ApiResponse.success("Send document successfully", documentWorkflowService.send(id, request));
    }

    @GetMapping("/{id}/sharepoint-link")
    public ApiResponse<String> getSharePointLink(@PathVariable Long id) {
        VanBan vanBan = vanBanRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));
        String link = sharePointService.map(sp -> sp.getSharingLink(vanBan)).orElse(null);
        if (link == null) {
            return ApiResponse.success("SharePoint integration not enabled or document not yet uploaded", null);
        }
        return ApiResponse.success("SharePoint link retrieved", link);
    }

    @GetMapping("/{id}/onedrive-edit-url")
    public ApiResponse<String> getOneDriveEditUrl(@PathVariable Long id) {
        VanBan vanBan = vanBanRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));
        String editUrl = sharePointService.map(sp -> sp.getEditLink(vanBan)).orElse(null);
        if (editUrl == null) {
            return ApiResponse.success("OneDrive edit URL not available (SharePoint not enabled or document not yet uploaded)", null);
        }
        return ApiResponse.success("OneDrive edit URL retrieved", editUrl);
    }

    @GetMapping("/{id}/signature-info")
    public ApiResponse<DocumentResponses.SignatureInfoResponse> getSignatureInfo(@PathVariable Long id) {
        return digitalSignatureService.getSignatureInfo(id)
                .map(info -> ApiResponse.success("Signature info retrieved", info))
                .orElseGet(() -> ApiResponse.success("Document has not been digitally signed", null));
    }
}

