package com.sithumud.pos_backend.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    private ErrorDetail error;

    @Builder.Default
    private Instant timestamp = Instant.now();

    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(Instant.now())
                .build();
    }

    public static <T> ApiResponse<T> success(T data) {
        return success(data, "Success");
    }

    public static <T> ApiResponse<T> error(String code, String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .error(ErrorDetail.builder()
                        .code(code)
                        .message(message)
                        .build())
                .timestamp(Instant.now())
                .build();
    }

    public static <T> ApiResponse<T> error(String code, String message, ErrorDetail errorDetail) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .error(errorDetail)
                .timestamp(Instant.now())
                .build();
    }
}
