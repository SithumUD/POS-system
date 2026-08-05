package com.sithumud.pos_backend.sales;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sithumud.pos_backend.common.exception.GlobalExceptionHandler;
import com.sithumud.pos_backend.sales.dto.ReceiptDto;
import com.sithumud.pos_backend.sales.dto.RefundSaleRequest;
import com.sithumud.pos_backend.sales.dto.SaleDto;
import com.sithumud.pos_backend.sales.dto.VoidSaleRequest;
import com.sithumud.pos_backend.sales.entity.PaymentMethod;
import com.sithumud.pos_backend.sales.entity.SaleStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class SaleControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private SaleService saleService;

    @InjectMocks
    private SaleController saleController;

    private SaleDto mockSaleDto;
    private ReceiptDto mockReceiptDto;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        mockMvc = MockMvcBuilders.standaloneSetup(saleController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        mockSaleDto = SaleDto.builder()
                .id(UUID.randomUUID())
                .receiptNumber("SALE-1001-123")
                .branchSlug("colombo")
                .cashierName("Ruwan Silva")
                .status(SaleStatus.COMPLETED)
                .soldAt(Instant.now())
                .subtotal(new BigDecimal("360.00"))
                .discount(BigDecimal.ZERO)
                .tax(new BigDecimal("36.00"))
                .total(new BigDecimal("396.00"))
                .paymentMethod(PaymentMethod.CASH)
                .build();

        mockReceiptDto = ReceiptDto.builder()
                .storeName("RetailOS POS")
                .receiptNumber("SALE-1001-123")
                .total(new BigDecimal("396.00"))
                .formattedThermalText("========== RetailOS POS ==========")
                .build();
    }

    @Test
    void testGetSalesHistorySuccess() throws Exception {
        given(saleService.getSalesHistory(any(), any(Pageable.class)))
                .willReturn(new PageImpl<>(List.of(mockSaleDto), PageRequest.of(0, 20), 1));

        mockMvc.perform(get("/api/v1/sales")
                        .param("branchSlug", "colombo")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].receiptNumber").value("SALE-1001-123"));
    }

    @Test
    void testGetSaleByIdSuccess() throws Exception {
        UUID id = mockSaleDto.getId();
        given(saleService.getSaleById(id)).willReturn(mockSaleDto);

        mockMvc.perform(get("/api/v1/sales/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(id.toString()));
    }

    @Test
    void testVoidSaleSuccess() throws Exception {
        UUID id = mockSaleDto.getId();
        mockSaleDto.setStatus(SaleStatus.VOIDED);
        given(saleService.voidSale(eq(id), any(VoidSaleRequest.class), any())).willReturn(mockSaleDto);

        VoidSaleRequest request = VoidSaleRequest.builder()
                .reason("Accidental double scan")
                .build();

        mockMvc.perform(post("/api/v1/sales/{id}/void", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("VOIDED"));
    }

    @Test
    void testRefundSaleSuccess() throws Exception {
        UUID id = mockSaleDto.getId();
        mockSaleDto.setStatus(SaleStatus.REFUNDED);
        given(saleService.refundSale(eq(id), any(RefundSaleRequest.class), any())).willReturn(mockSaleDto);

        RefundSaleRequest request = RefundSaleRequest.builder()
                .reason("Damaged product returned")
                .refundAmount(new BigDecimal("396.00"))
                .build();

        mockMvc.perform(post("/api/v1/sales/{id}/refund", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("REFUNDED"));
    }

    @Test
    void testGetReceiptSuccess() throws Exception {
        UUID id = mockSaleDto.getId();
        given(saleService.getReceipt(id)).willReturn(mockReceiptDto);

        mockMvc.perform(get("/api/v1/sales/{id}/receipt", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.formattedThermalText").exists());
    }
}
