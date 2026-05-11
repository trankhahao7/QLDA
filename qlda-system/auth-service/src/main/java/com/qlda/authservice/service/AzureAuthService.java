package com.qlda.authservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.microsoft.aad.msal4j.AuthorizationCodeParameters;
import com.microsoft.aad.msal4j.ClientCredentialFactory;
import com.microsoft.aad.msal4j.ConfidentialClientApplication;
import com.microsoft.aad.msal4j.IAuthenticationResult;
import com.qlda.authservice.config.AuthProperties;
import com.qlda.authservice.dto.auth.AzureLoginRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.Base64;
import java.util.Collections;
import java.util.Set;

@Service
public class AzureAuthService {

    private static final Logger log = LoggerFactory.getLogger(AzureAuthService.class);

    private final AuthProperties authProperties;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public AzureAuthService(AuthProperties authProperties) {
        this.authProperties = authProperties;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public AzureUserInfo exchangeCodeForUser(AzureLoginRequest request) {
        System.out.println("[DEBUG] AzureAuthService.exchangeCodeForUser() - Start");
        System.out.println("[DEBUG] AzureAuthService - Request: " + request);

        AuthProperties.Azure azure = authProperties.getAzure();
        System.out.println("[DEBUG] AzureAuthService - Azure config - TenantId present: " + StringUtils.hasText(azure.getTenantId()));
        System.out.println("[DEBUG] AzureAuthService - Azure config - ClientId present: " + StringUtils.hasText(azure.getClientId()));

        if (!StringUtils.hasText(azure.getTenantId())
                || !StringUtils.hasText(azure.getClientId())) {
            log.warn("Azure AD credentials not configured");
            System.out.println("[DEBUG] AzureAuthService - Azure credentials NOT configured, returning null");
            return null;
        }

        String accessToken = request.accessToken();
        System.out.println("[DEBUG] AzureAuthService - Access token present: " + StringUtils.hasText(accessToken));

        if (StringUtils.hasText(accessToken)) {
            log.info("Processing Azure login with access token (Implicit Flow)");
            System.out.println("[DEBUG] AzureAuthService - Using Implicit Flow (access token)");
            System.out.println("[DEBUG] AzureAuthService - Token (first 50): " + accessToken.substring(0, Math.min(50, accessToken.length())) + "...");
            return getUserInfoFromAccessToken(accessToken);
        }

        if (StringUtils.hasText(request.authorizationCode())) {
            log.info("Processing Azure login with authorization code (Auth Code Flow)");
            System.out.println("[DEBUG] AzureAuthService - Using Auth Code Flow");
            System.out.println("[DEBUG] AzureAuthService - Auth code (first 20): " + request.authorizationCode().substring(0, Math.min(20, request.authorizationCode().length())) + "...");
            System.out.println("[DEBUG] AzureAuthService - Redirect URI: " + request.redirectUri());
            return getUserInfoFromAuthorizationCode(request, azure);
        }

        log.warn("No valid Azure credential provided");
        System.out.println("[DEBUG] AzureAuthService - No valid credentials, returning null");
        return null;
    }

    private AzureUserInfo getUserInfoFromAccessToken(String accessToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);

            ResponseEntity<String> response = restTemplate.exchange(
                    "https://graph.microsoft.com/v1.0/me",
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    String.class
            );

            if (response.getBody() != null) {
                JsonNode json = objectMapper.readTree(response.getBody());
                return new AzureUserInfo(
                        json.has("id") ? json.get("id").asText() : "",
                        json.has("mail") && !json.get("mail").isNull() ? json.get("mail").asText()
                                : (json.has("userPrincipalName") ? json.get("userPrincipalName").asText() : ""),
                        json.has("mail") && !json.get("mail").isNull() ? json.get("mail").asText().split("@")[0]
                                : (json.has("userPrincipalName") ? json.get("userPrincipalName").asText().split("@")[0] : "azureuser"),
                        json.has("displayName") ? json.get("displayName").asText() : "Azure User",
                        true
                );
            }
        } catch (Exception e) {
            log.info("Graph API call failed, falling back to JWT decode: {}", e.getMessage());
            return decodeJwtToken(accessToken);
        }
        return null;
    }

    private AzureUserInfo getUserInfoFromAuthorizationCode(AzureLoginRequest request, AuthProperties.Azure azure) {
        if (!StringUtils.hasText(azure.getClientSecret())) {
            log.warn("Azure client secret is required for authorization code flow");
            return null;
        }

        try {
            String authority = "https://login.microsoftonline.com/" + azure.getTenantId();
            ConfidentialClientApplication clientApp = ConfidentialClientApplication.builder(
                    azure.getClientId(),
                    ClientCredentialFactory.createFromSecret(azure.getClientSecret())
            ).authority(authority).build();

            Set<String> scopes = Collections.singleton("https://graph.microsoft.com/.default");
            IAuthenticationResult result = clientApp.acquireToken(
                    AuthorizationCodeParameters.builder(
                            request.authorizationCode(),
                            URI.create(request.redirectUri())
                    ).scopes(scopes).build()
            ).get();

            return getUserInfoFromAccessToken(result.accessToken());
        } catch (Exception e) {
            log.error("Authorization code exchange failed: {}", e.getMessage());
            return null;
        }
    }

    private AzureUserInfo decodeJwtToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length >= 2) {
                String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
                JsonNode json = objectMapper.readTree(payload);

                String email = json.has("mail") ? json.get("mail").asText()
                        : json.has("unique_name") ? json.get("unique_name").asText()
                        : json.has("upn") ? json.get("upn").asText() : "";
                String name = json.has("name") ? json.get("name").asText() : "Azure User";
                String oid = json.has("oid") ? json.get("oid").asText() : "";

                return new AzureUserInfo(
                        oid,
                        email,
                        email.contains("@") ? email.split("@")[0] : "azureuser",
                        name,
                        false
                );
            }
        } catch (Exception e) {
            log.error("JWT decode failed: {}", e.getMessage());
            return null;
        }
        return null;
    }

    public record AzureUserInfo(
            String azureAdId,
            String email,
            String username,
            String displayName,
            boolean graphConfigured
    ) {
    }
}
