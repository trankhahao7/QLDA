package com.qlda.workflowservice.client.internal;

import com.qlda.workflowservice.client.dto.AuthPermissionCheckRequest;
import com.qlda.workflowservice.client.dto.AuthPermissionCheckResponse;
import com.qlda.workflowservice.client.dto.AuthUnitDto;
import com.qlda.workflowservice.client.dto.AuthUserDto;
import com.qlda.workflowservice.client.dto.AuthUserRolesDto;
import com.qlda.workflowservice.client.dto.ValidateUnitsInternalRequest;
import com.qlda.workflowservice.client.dto.ValidateUsersInternalRequest;
import com.qlda.workflowservice.client.dto.ValidationResponse;
import com.qlda.workflowservice.common.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "authServiceInternalClient", url = "${services.auth-service.base-url}")
public interface AuthServiceHttpClient {
    @GetMapping("/internal/auth/users/{id}")
    ApiResponse<AuthUserDto> getUserById(@PathVariable("id") Long id);

    @PostMapping("/internal/auth/users/validate")
    ApiResponse<ValidationResponse> validateUsers(@RequestBody ValidateUsersInternalRequest request);

    @GetMapping("/internal/auth/units/{id}")
    ApiResponse<AuthUnitDto> getUnitById(@PathVariable("id") Integer id);

    @PostMapping("/internal/auth/units/validate")
    ApiResponse<ValidationResponse> validateUnits(@RequestBody ValidateUnitsInternalRequest request);

    @GetMapping("/internal/auth/users/{id}/roles")
    ApiResponse<AuthUserRolesDto> getUserRoles(@PathVariable("id") Long id);

    @PostMapping("/internal/auth/permissions/check")
    ApiResponse<AuthPermissionCheckResponse> checkPermission(@RequestBody AuthPermissionCheckRequest request);
}
