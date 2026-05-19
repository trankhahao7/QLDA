package com.qlda.workflowservice.client.impl;

import com.qlda.workflowservice.client.AuthServiceClient;
import com.qlda.workflowservice.client.dto.AuthPermissionCheckRequest;
import com.qlda.workflowservice.client.dto.AuthPermissionCheckResponse;
import com.qlda.workflowservice.client.dto.AuthUnitDto;
import com.qlda.workflowservice.client.dto.AuthUserDto;
import com.qlda.workflowservice.client.dto.AuthUserRolesDto;
import com.qlda.workflowservice.client.dto.ValidateUnitsInternalRequest;
import com.qlda.workflowservice.client.dto.ValidateUsersInternalRequest;
import com.qlda.workflowservice.client.dto.ValidationResponse;
import com.qlda.workflowservice.client.internal.AuthServiceHttpClient;
import com.qlda.workflowservice.common.ApiResponse;
import com.qlda.workflowservice.exception.ApiException;
import com.qlda.workflowservice.exception.ErrorCode;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Supplier;

@Service
@RequiredArgsConstructor
public class AuthServiceClientImpl implements AuthServiceClient {
    private final AuthServiceHttpClient authServiceHttpClient;

    @Override
    public AuthUserDto getUserById(Long id) {
        ApiResponse<AuthUserDto> apiResponse = execute(() -> authServiceHttpClient.getUserById(id));
        return apiResponse != null ? apiResponse.data() : null;
    }

    @Override
    public void validateUsers(List<Long> userIds) {
        ApiResponse<ValidationResponse> apiResponse = execute(() -> authServiceHttpClient.validateUsers(new ValidateUsersInternalRequest(userIds)));
        ValidationResponse result = apiResponse != null ? apiResponse.data() : null;
        if (result == null || !result.valid()) {
            throw new ApiException(ErrorCode.USER_NOT_FOUND, HttpStatus.BAD_REQUEST, "Invalid users");
        }
    }

    @Override
    public AuthUnitDto getUnitById(Integer id) {
        ApiResponse<AuthUnitDto> apiResponse = execute(() -> authServiceHttpClient.getUnitById(id));
        return apiResponse != null ? apiResponse.data() : null;
    }

    @Override
    public void validateUnits(List<Integer> unitIds) {
        ApiResponse<ValidationResponse> apiResponse = execute(() -> authServiceHttpClient.validateUnits(new ValidateUnitsInternalRequest(unitIds)));
        ValidationResponse result = apiResponse != null ? apiResponse.data() : null;
        if (result == null || !result.valid()) {
            throw new ApiException(ErrorCode.INVALID_REQUEST, HttpStatus.BAD_REQUEST, "Invalid units");
        }
    }

    @Override
    public AuthUserRolesDto getUserRoles(Long id) {
        ApiResponse<AuthUserRolesDto> apiResponse = execute(() -> authServiceHttpClient.getUserRoles(id));
        return apiResponse != null ? apiResponse.data() : null;
    }

    @Override
    public AuthPermissionCheckResponse checkPermission(Long userId, String maChucNang, String permission) {
        ApiResponse<AuthPermissionCheckResponse> apiResponse = execute(() -> authServiceHttpClient.checkPermission(new AuthPermissionCheckRequest(userId, maChucNang, permission)));
        return apiResponse != null ? apiResponse.data() : null;
    }

    private <T> T execute(Supplier<T> supplier) {
        try {
            return supplier.get();
        } catch (FeignException exception) {
            if (exception.status() == 404) {
                throw new ApiException(ErrorCode.USER_NOT_FOUND, HttpStatus.NOT_FOUND, "Auth resource not found");
            }
            throw new ApiException(ErrorCode.INTERNAL_SERVER_ERROR, HttpStatus.BAD_GATEWAY, "Auth service request failed");
        }
    }
}
