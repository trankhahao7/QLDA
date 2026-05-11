package com.qlda.authservice.dto.auth;

import jakarta.validation.constraints.AssertTrue;

public record AzureLoginRequest(
        String authorizationCode,
        String redirectUri,
        String accessToken
) {
        @AssertTrue(message = "Either authorizationCode+redirectUri or accessToken must be provided")
        public boolean isValidCredentials() {
                boolean hasCodeFlow = authorizationCode != null && !authorizationCode.trim().isEmpty()
                        && redirectUri != null && !redirectUri.trim().isEmpty();
                boolean hasTokenFlow = accessToken != null && !accessToken.trim().isEmpty();
                return hasCodeFlow || hasTokenFlow;
        }
}
