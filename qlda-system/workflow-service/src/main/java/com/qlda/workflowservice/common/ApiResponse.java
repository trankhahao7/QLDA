package com.qlda.workflowservice.common;

public record ApiResponse<T>(
    boolean success,
    String message,
    T data,
    String errorCode
) {
    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, message, data, null);
    }

    public static ApiResponse<Void> ok(String message) {
        return new ApiResponse<>(true, message, null, null);
    }

    public static ApiResponse<Void> fail(String message, String errorCode) {
        return new ApiResponse<>(false, message, null, errorCode);
    }
}
