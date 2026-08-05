package com.sithumud.pos_backend.setting;

import com.sithumud.pos_backend.setting.dto.StoreSettingDto;
import com.sithumud.pos_backend.setting.dto.UpdateStoreSettingRequest;
import com.sithumud.pos_backend.setting.entity.StoreSetting;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SettingService {

    private final StoreSettingRepository settingRepository;

    @Transactional(readOnly = true)
    public StoreSettingDto getSettings() {
        StoreSetting setting = getOrCreateSetting();
        return StoreSettingDto.fromEntity(setting);
    }

    @Transactional
    public StoreSettingDto updateSettings(UpdateStoreSettingRequest request) {
        StoreSetting setting = getOrCreateSetting();

        if (StringUtils.hasText(request.getStoreName())) {
            setting.setStoreName(request.getStoreName().trim());
        }
        if (StringUtils.hasText(request.getLegalName())) {
            setting.setLegalName(request.getLegalName().trim());
        }
        if (StringUtils.hasText(request.getCurrency())) {
            setting.setCurrency(request.getCurrency().trim());
        }
        if (request.getTaxRate() != null) {
            setting.setTaxRate(request.getTaxRate());
        }
        if (StringUtils.hasText(request.getTaxLabel())) {
            setting.setTaxLabel(request.getTaxLabel().trim());
        }
        if (StringUtils.hasText(request.getReceiptFooter())) {
            setting.setReceiptFooter(request.getReceiptFooter().trim());
        }
        if (StringUtils.hasText(request.getTimezone())) {
            setting.setTimezone(request.getTimezone().trim());
        }
        if (request.getLowStockThreshold() != null) {
            setting.setLowStockThreshold(request.getLowStockThreshold());
        }
        if (request.getMaxDiscountPercent() != null) {
            setting.setMaxDiscountPercent(request.getMaxDiscountPercent());
        }
        if (request.getRequireManagerApproval() != null) {
            setting.setRequireManagerApproval(request.getRequireManagerApproval());
        }
        if (request.getAllowNegativeStock() != null) {
            setting.setAllowNegativeStock(request.getAllowNegativeStock());
        }
        if (request.getAutoPrintReceipt() != null) {
            setting.setAutoPrintReceipt(request.getAutoPrintReceipt());
        }
        if (request.getRoundCashTo() != null) {
            setting.setRoundCashTo(request.getRoundCashTo());
        }
        if (request.getEmailAlerts() != null) {
            setting.setEmailAlerts(request.getEmailAlerts());
        }
        if (StringUtils.hasText(request.getAlertSensitivity())) {
            setting.setAlertSensitivity(request.getAlertSensitivity().trim());
        }
        if (request.getSessionTimeoutMinutes() != null) {
            setting.setSessionTimeoutMinutes(request.getSessionTimeoutMinutes());
        }
        if (request.getTwoFactor() != null) {
            setting.setTwoFactor(request.getTwoFactor());
        }

        StoreSetting saved = settingRepository.save(setting);
        return StoreSettingDto.fromEntity(saved);
    }

    private StoreSetting getOrCreateSetting() {
        List<StoreSetting> settings = settingRepository.findAll();
        if (settings.isEmpty()) {
            StoreSetting defaultSetting = StoreSetting.builder().build();
            return settingRepository.save(defaultSetting);
        }
        return settings.get(0);
    }
}
