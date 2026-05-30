package com.qlda.documentservice.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.qlda.documentservice.config.AppProperties;
import com.qlda.documentservice.entity.TepDinhKem;
import com.qlda.documentservice.entity.VanBan;
import com.qlda.documentservice.repository.TepDinhKemRepository;
import com.qlda.documentservice.repository.VanBanRepository;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * Uploads published documents to SharePoint via Microsoft Graph API (application permissions).
 *
 * Prerequisites (all required before enabling):
 *  1. Admin consent granted for Sites.ReadWrite.All
 *  2. Set SHAREPOINT_ENABLED=true, SHAREPOINT_SITE_ID, OFFICE365_TENANT_ID,
 *     OFFICE365_CLIENT_ID, OFFICE365_CLIENT_SECRET in environment
 */
@Service
@ConditionalOnProperty(name = "office365.sharepoint.enabled", havingValue = "true")
public class SharePointService {

    private static final Logger log = LoggerFactory.getLogger(SharePointService.class);
    private static final String GRAPH_BASE = "https://graph.microsoft.com/v1.0";

    private final String tenantId;
    private final String clientId;
    private final String clientSecret;
    private final String siteId;
    private final String uploadPath;
    private final String localUploadDir;
    private final TepDinhKemRepository tepDinhKemRepository;
    private final VanBanRepository vanBanRepository;
    private final RestClient restClient;

    public SharePointService(
            @Value("${office365.tenant-id:}") String tenantId,
            @Value("${office365.client-id:}") String clientId,
            @Value("${office365.client-secret:}") String clientSecret,
            @Value("${office365.sharepoint.site-id:}") String siteId,
            @Value("${office365.sharepoint.upload-path:eOIS/VanBan}") String uploadPath,
            AppProperties appProperties,
            TepDinhKemRepository tepDinhKemRepository,
            VanBanRepository vanBanRepository) {
        this.tenantId = tenantId;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.siteId = siteId;
        this.uploadPath = uploadPath;
        this.localUploadDir = appProperties.getUploadDir();
        this.tepDinhKemRepository = tepDinhKemRepository;
        this.vanBanRepository = vanBanRepository;
        this.restClient = RestClient.create();
    }

    /**
     * Called after document is published. Finds the first attachment and uploads it to SharePoint.
     * Updates DuongDanSharePoint (view link) and DuongDanOneDrive (edit link) on VanBan on success.
     */
    public void uploadOnPublish(VanBan vanBan) {
        if (!isConfigured()) {
            log.warn("SharePoint not fully configured, skipping upload for documentId={}", vanBan.getId());
            return;
        }

        List<TepDinhKem> attachments = tepDinhKemRepository.findByVanBan_Id(vanBan.getId());
        if (attachments.isEmpty()) {
            log.debug("No attachments for documentId={}, skipping SharePoint upload", vanBan.getId());
            return;
        }

        String token = getAppAccessToken();
        if (token == null) {
            log.error("Failed to obtain SharePoint token for documentId={}", vanBan.getId());
            return;
        }

        TepDinhKem primaryFile = attachments.get(0);
        Path localFile = resolveLocalPath(primaryFile.getDuongDanTep());

        if (!Files.exists(localFile)) {
            log.warn("Local file not found for SharePoint upload: {}", localFile);
            return;
        }

        try {
            String fileName = buildFileName(vanBan, localFile);
            String itemId = uploadFile(token, fileName, localFile);
            if (itemId == null) return;

            String viewLink = createSharingLink(token, itemId, "view");
            String editLink = createSharingLink(token, itemId, "edit");

            vanBan.setNgayCapNhat(LocalDateTime.now());
            if (StringUtils.hasText(viewLink)) {
                vanBan.setDuongDanSharePoint(viewLink);
            }
            if (StringUtils.hasText(editLink)) {
                vanBan.setDuongDanOneDrive(editLink);
            }
            vanBanRepository.save(vanBan);
            log.info("Uploaded documentId={} to SharePoint (view={}, edit={})",
                    vanBan.getId(), viewLink, editLink);
        } catch (IOException ex) {
            log.error("SharePoint upload I/O error for documentId={}: {}", vanBan.getId(), ex.getMessage(), ex);
        }
    }

    /** Returns the stored SharePoint view link for a document, or null if not yet uploaded. */
    public String getSharingLink(VanBan vanBan) {
        return vanBan.getDuongDanSharePoint();
    }

    /** Returns the stored OneDrive edit link (Word Online) for a document, or null if not yet uploaded. */
    public String getEditLink(VanBan vanBan) {
        return vanBan.getDuongDanOneDrive();
    }

    private String uploadFile(String token, String fileName, Path localFile) throws IOException {
        byte[] content = Files.readAllBytes(localFile);
        String uri = GRAPH_BASE + "/sites/" + siteId + "/drive/root:/" + uploadPath + "/" + fileName + ":/content";

        try {
            GraphUploadResponse response = restClient.put()
                    .uri(uri)
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(content)
                    .retrieve()
                    .body(GraphUploadResponse.class);
            return response != null ? response.id() : null;
        } catch (RestClientException ex) {
            log.error("Graph file upload failed for {}: {}", fileName, ex.getMessage(), ex);
            return null;
        }
    }

    private String createSharingLink(String token, String itemId, String type) {
        String uri = GRAPH_BASE + "/sites/" + siteId + "/drive/items/" + itemId + "/createLink";
        Map<String, String> body = Map.of("type", type, "scope", "organization");

        try {
            GraphShareLinkResponse response = restClient.post()
                    .uri(uri)
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(GraphShareLinkResponse.class);
            return (response != null && response.link() != null) ? response.link().webUrl() : null;
        } catch (RestClientException ex) {
            log.error("Create {} sharing link failed for itemId={}: {}", type, itemId, ex.getMessage(), ex);
            return null;
        }
    }

    private String getAppAccessToken() {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("grant_type", "client_credentials");
        form.add("scope", "https://graph.microsoft.com/.default");

        try {
            AppTokenResponse response = restClient.post()
                    .uri("https://login.microsoftonline.com/" + tenantId + "/oauth2/v2.0/token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(AppTokenResponse.class);
            return response != null ? response.accessToken() : null;
        } catch (RestClientException ex) {
            log.error("SharePoint app token request failed: {}", ex.getMessage(), ex);
            return null;
        }
    }

    private boolean isConfigured() {
        return StringUtils.hasText(tenantId)
                && StringUtils.hasText(clientId)
                && StringUtils.hasText(clientSecret)
                && StringUtils.hasText(siteId);
    }

    private Path resolveLocalPath(String storedPath) {
        if (storedPath == null) return Paths.get("");
        Path p = Paths.get(storedPath);
        return p.isAbsolute() ? p : Paths.get(localUploadDir).resolve(storedPath);
    }

    private String buildFileName(VanBan vanBan, Path localFile) {
        String name = localFile.getFileName().toString();
        int dot = name.lastIndexOf('.');
        String ext = dot > 0 ? name.substring(dot) : "";
        String soKyHieu = StringUtils.hasText(vanBan.getSoKyHieu())
                ? vanBan.getSoKyHieu().replaceAll("[/\\\\:*?\"<>|]", "_")
                : "document_" + vanBan.getId();
        return soKyHieu + ext;
    }

    private record AppTokenResponse(@JsonProperty("access_token") String accessToken) {
    }

    private record GraphUploadResponse(String id, String name, String webUrl) {
    }

    private record GraphShareLinkResponse(GraphLink link) {
        record GraphLink(String webUrl) {
        }
    }
}
