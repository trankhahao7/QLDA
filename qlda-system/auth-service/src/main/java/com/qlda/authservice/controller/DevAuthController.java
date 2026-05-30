package com.qlda.authservice.controller;

import com.qlda.authservice.common.ApiResponse;
import com.qlda.authservice.dto.auth.AuthTokenResponse;
import com.qlda.authservice.dto.auth.DevLoginRequest;
import com.qlda.authservice.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Profile("!prod")
@RestController
@RequestMapping("/api/auth")
public class DevAuthController {

    private final AuthService authService;

    public DevAuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login/dev")
    public ApiResponse<AuthTokenResponse> loginDev(
            @Valid @RequestBody DevLoginRequest request,
            HttpServletRequest httpServletRequest
    ) {
        return ApiResponse.success("Dev login successfully",
                authService.loginDev(request, httpServletRequest.getRemoteAddr()));
    }
}
