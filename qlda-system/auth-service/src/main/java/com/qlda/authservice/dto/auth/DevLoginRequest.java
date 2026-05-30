package com.qlda.authservice.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record DevLoginRequest(
        @NotBlank String username,
        @NotBlank String password
) {}
