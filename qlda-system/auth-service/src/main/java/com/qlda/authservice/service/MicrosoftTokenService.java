package com.qlda.authservice.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.qlda.authservice.config.AuthProperties;
import com.qlda.authservice.entity.NguoiDung;
import com.qlda.authservice.repository.NguoiDungRepository;
import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * Manages Microsoft OAuth2 access tokens for delegated Graph API calls.
 * Tokens are persisted on NguoiDung after Azure SSO login.
 */
@Service
public class MicrosoftTokenService {

    private static final Logger log = LoggerFactory.getLogger(MicrosoftTokenService.class);
    private static final int EXPIRY_MARGIN_MINUTES = 5;

    private final AuthProperties authProperties;
    private final NguoiDungRepository nguoiDungRepository;
    private final RestClient restClient;

    public MicrosoftTokenService(AuthProperties authProperties, NguoiDungRepository nguoiDungRepository) {
        this.authProperties = authProperties;
        this.nguoiDungRepository = nguoiDungRepository;
        this.restClient = RestClient.create();
    }

    /**
     * Returns a valid Microsoft access token for the given user.
     * Uses the stored refresh token to obtain a new access token.
     * Returns null if the user has no stored refresh token.
     */
    public String getAccessToken(NguoiDung user) {
        if (!StringUtils.hasText(user.getMicrosoftRefreshToken())) {
            log.debug("No Microsoft refresh token for userId={}, skipping Graph API call", user.getId());
            return null;
        }

        if (user.getMicrosoftTokenExpiry() != null
                && user.getMicrosoftTokenExpiry().isBefore(LocalDateTime.now())) {
            log.warn("Microsoft refresh token expired for userId={}", user.getId());
            return null;
        }

        return refreshAccessToken(user);
    }

    private String refreshAccessToken(NguoiDung user) {
        AuthProperties.Azure azure = authProperties.getAzure();
        if (!StringUtils.hasText(azure.getTenantId()) || !StringUtils.hasText(azure.getClientId())) {
            return null;
        }

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("client_id", azure.getClientId().trim());
        if (StringUtils.hasText(azure.getClientSecret())) {
            form.add("client_secret", azure.getClientSecret().trim());
        }
        form.add("grant_type", "refresh_token");
        form.add("refresh_token", user.getMicrosoftRefreshToken());
        form.add("scope", "https://graph.microsoft.com/.default offline_access");

        try {
            TokenRefreshResponse response = restClient.post()
                    .uri("https://login.microsoftonline.com/" + azure.getTenantId().trim() + "/oauth2/v2.0/token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(form)
                    .retrieve()
                    .body(TokenRefreshResponse.class);

            if (response == null || !StringUtils.hasText(response.accessToken())) {
                return null;
            }

            if (StringUtils.hasText(response.refreshToken())) {
                user.setMicrosoftRefreshToken(response.refreshToken());
                user.setMicrosoftTokenExpiry(LocalDateTime.now().plusDays(60));
                nguoiDungRepository.save(user);
            }

            return response.accessToken();
        } catch (RestClientException ex) {
            log.error("Microsoft token refresh failed for userId={}: {}", user.getId(), ex.getMessage(), ex);
            return null;
        }
    }

    private record TokenRefreshResponse(
            @JsonProperty("access_token") String accessToken,
            @JsonProperty("refresh_token") String refreshToken
    ) {
    }
}
