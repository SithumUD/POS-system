package com.sithumud.pos_backend.setting;

import com.sithumud.pos_backend.common.dto.ApiResponse;
import com.sithumud.pos_backend.setting.dto.StoreSettingDto;
import com.sithumud.pos_backend.setting.dto.UpdateStoreSettingRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
@Tag(name = "Store Settings", description = "Endpoints for managing global POS business configuration, tax rules, cash rounding, receipt footers, and alert sensitivity")
public class SettingController {

    private final SettingService settingService;

    @GetMapping
    @Operation(summary = "Get store configuration settings", description = "Retrieves store configuration, tax rates, cash rounding, receipt footers, discount approval thresholds, and security sensitivity settings.")
    public ResponseEntity<ApiResponse<StoreSettingDto>> getSettings() {
        StoreSettingDto settings = settingService.getSettings();
        return ResponseEntity.ok(ApiResponse.success(settings, "Store settings retrieved successfully"));
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update store configuration settings", description = "Updates store configuration, tax rates, cash rounding, receipt footers, and security settings.")
    public ResponseEntity<ApiResponse<StoreSettingDto>> updateSettings(@Valid @RequestBody UpdateStoreSettingRequest request) {
        StoreSettingDto settings = settingService.updateSettings(request);
        return ResponseEntity.ok(ApiResponse.success(settings, "Store settings updated successfully"));
    }
}
