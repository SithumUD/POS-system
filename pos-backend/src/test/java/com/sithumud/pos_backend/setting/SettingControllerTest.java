package com.sithumud.pos_backend.setting;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sithumud.pos_backend.common.exception.GlobalExceptionHandler;
import com.sithumud.pos_backend.setting.dto.StoreSettingDto;
import com.sithumud.pos_backend.setting.dto.UpdateStoreSettingRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class SettingControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private SettingService settingService;

    @InjectMocks
    private SettingController settingController;

    private StoreSettingDto mockSettingDto;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        mockMvc = MockMvcBuilders.standaloneSetup(settingController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        mockSettingDto = StoreSettingDto.builder()
                .id(UUID.randomUUID())
                .storeName("RetailOS POS")
                .legalName("Sathosa Group (Pvt) Ltd")
                .currency("LKR")
                .taxRate(new BigDecimal("10.00"))
                .taxLabel("VAT")
                .receiptFooter("Thank you for shopping!")
                .timezone("Asia/Colombo")
                .lowStockThreshold(12)
                .maxDiscountPercent(new BigDecimal("10.00"))
                .requireManagerApproval(true)
                .allowNegativeStock(false)
                .autoPrintReceipt(true)
                .roundCashTo(new BigDecimal("1.00"))
                .emailAlerts(true)
                .alertSensitivity("BALANCED")
                .sessionTimeoutMinutes(30)
                .twoFactor(false)
                .build();
    }

    @Test
    void testGetSettingsSuccess() throws Exception {
        given(settingService.getSettings()).willReturn(mockSettingDto);

        mockMvc.perform(get("/api/v1/settings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.storeName").value("RetailOS POS"));
    }

    @Test
    void testUpdateSettingsSuccess() throws Exception {
        given(settingService.updateSettings(any(UpdateStoreSettingRequest.class))).willReturn(mockSettingDto);

        UpdateStoreSettingRequest request = UpdateStoreSettingRequest.builder()
                .storeName("RetailOS Enterprise POS")
                .taxRate(new BigDecimal("12.00"))
                .build();

        mockMvc.perform(put("/api/v1/settings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.currency").value("LKR"));
    }
}
