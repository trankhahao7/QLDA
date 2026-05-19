package com.qlda.documentservice.client;

import com.qlda.documentservice.client.dto.AuthClientDtos;
import com.qlda.documentservice.common.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "auth-service-client", url = "${services.auth-service.base-url:http://localhost:8081}")
public interface AuthServiceClient {

    @GetMapping("/internal/auth/users/{id}")
    ApiResponse<AuthClientDtos.UserInfoResponse> getUserById(@PathVariable("id") Long id);

    @PostMapping("/internal/auth/users/validate")
    ApiResponse<AuthClientDtos.ValidateUsersResponse> validateUsers(@RequestBody AuthClientDtos.ValidateUsersRequest request);

    @GetMapping("/internal/auth/units/{id}")
    ApiResponse<AuthClientDtos.UnitInfoResponse> getUnitById(@PathVariable("id") Integer id);

    @PostMapping("/internal/auth/units/validate")
    ApiResponse<AuthClientDtos.ValidateUnitsResponse> validateUnits(@RequestBody AuthClientDtos.ValidateUnitsRequest request);

    @GetMapping("/internal/auth/users/{id}/roles")
    ApiResponse<AuthClientDtos.UserRolesResponse> getUserRoles(@PathVariable("id") Long id);

    @PostMapping("/internal/auth/permissions/check")
    ApiResponse<AuthClientDtos.CheckPermissionResponse> checkPermission(@RequestBody AuthClientDtos.CheckPermissionRequest request);
}
