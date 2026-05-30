package com.qlda.authservice.service;

import com.qlda.authservice.config.AuthProperties;
import com.qlda.authservice.dto.office365.Office365AuthUrlResponse;
import com.qlda.authservice.dto.office365.Office365ConfigStatusResponse;
import com.qlda.authservice.dto.office365.Office365ConnectionCheckResponse;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class Office365Service {

    private final AuthProperties authProperties;

    public Office365Service(AuthProperties authProperties) {
        this.authProperties = authProperties;
    }

    public Office365ConfigStatusResponse getConfigStatus() {
        AuthProperties.Office365 office365 = authProperties.getOffice365();
        return new Office365ConfigStatusResponse(
                hasText(office365.getTenantId()),
                hasText(office365.getClientId()),
                hasText(office365.getClientSecret()),
                hasText(office365.getSharePoint()),
                hasText(office365.getTeams()),
                hasText(office365.getOutlook())
        );
    }

    public Office365ConnectionCheckResponse checkConnection() {
        Office365ConfigStatusResponse status = getConfigStatus();
        // TODO: integrate Microsoft Graph API ping/health checks for each workload.
        boolean azureAd = status.tenantIdConfigured() && status.clientIdConfigured() && status.clientSecretConfigured();
        boolean sharePoint = azureAd && status.sharePointConfigured();
        boolean oneDrive = azureAd && status.sharePointConfigured();
        boolean teams = azureAd && status.teamsConfigured();
        boolean outlook = azureAd && status.outlookConfigured();
        return new Office365ConnectionCheckResponse(azureAd, sharePoint, oneDrive, teams, outlook);
    }

    public Office365AuthUrlResponse getAuthUrl() {
        AuthProperties.Azure azure = authProperties.getAzure();
        if (!StringUtils.hasText(azure.getTenantId()) || !StringUtils.hasText(azure.getClientId())) {
            return new Office365AuthUrlResponse(null, false);
        }
        String redirectUri = StringUtils.hasText(azure.getRedirectUri())
                ? azure.getRedirectUri()
                : "http://localhost:5173/auth/callback";
        String encodedRedirect = URLEncoder.encode(redirectUri, StandardCharsets.UTF_8);
        String authUrl = "https://login.microsoftonline.com/" + azure.getTenantId()
                + "/oauth2/v2.0/authorize"
                + "?client_id=" + azure.getClientId()
                + "&response_type=code"
                + "&redirect_uri=" + encodedRedirect
                + "&scope=openid profile email User.Read"
                + "&response_mode=query";
        return new Office365AuthUrlResponse(authUrl, true);
    }

    private boolean hasText(String value) {
        return StringUtils.hasText(value);
    }
}
