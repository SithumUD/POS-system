package com.sithumud.pos_backend.pos;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sithumud.pos_backend.common.exception.GlobalExceptionHandler;
import com.sithumud.pos_backend.sales.HeldSaleService;
import com.sithumud.pos_backend.sales.SaleService;
import com.sithumud.pos_backend.sales.dto.BatchSyncRequest;
import com.sithumud.pos_backend.sales.dto.BatchSyncResultDto;
import com.sithumud.pos_backend.sales.dto.CheckoutItemRequest;
import com.sithumud.pos_backend.sales.dto.CheckoutRequest;
import com.sithumud.pos_backend.sales.dto.CheckoutResponse;
import com.sithumud.pos_backend.sales.dto.HeldSaleDto;
import com.sithumud.pos_backend.sales.dto.HeldSaleItemRequest;
import com.sithumud.pos_backend.sales.dto.HeldSaleRequest;
import com.sithumud.pos_backend.sales.dto.PaymentTenderDto;
import com.sithumud.pos_backend.sales.entity.PaymentMethod;
import com.sithumud.pos_backend.sales.entity.SaleStatus;
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
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class PosControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private SaleService saleService;

    @Mock
    private HeldSaleService heldSaleService;

    @InjectMocks
    private PosController posController;

    private CheckoutResponse mockCheckoutResponse;
    private HeldSaleDto mockHeldSaleDto;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        mockMvc = MockMvcBuilders.standaloneSetup(posController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        mockCheckoutResponse = CheckoutResponse.builder()
                .saleId(UUID.randomUUID())
                .receiptNumber("SALE-1001-123")
                .idempotencyKey("idem-uuid-001")
                .soldAt(Instant.now())
                .status(SaleStatus.COMPLETED)
                .branchSlug("colombo")
                .cashierName("Ruwan Silva")
                .subtotal(new BigDecimal("360.00"))
                .discount(BigDecimal.ZERO)
                .tax(new BigDecimal("36.00"))
                .total(new BigDecimal("396.00"))
                .tendered(new BigDecimal("400.00"))
                .changeDue(new BigDecimal("4.00"))
                .build();

        mockHeldSaleDto = HeldSaleDto.builder()
                .id(UUID.randomUUID())
                .label("Table 3")
                .branchSlug("colombo")
                .cashierName("Ruwan Silva")
                .discount(BigDecimal.ZERO)
                .heldAt(Instant.now())
                .build();
    }

    @Test
    void testCheckoutSuccess() throws Exception {
        given(saleService.processCheckout(any(CheckoutRequest.class), any())).willReturn(mockCheckoutResponse);

        CheckoutRequest request = CheckoutRequest.builder()
                .idempotencyKey("idem-uuid-001")
                .branchSlug("colombo")
                .terminalId("1")
                .items(List.of(CheckoutItemRequest.builder()
                        .productId(UUID.randomUUID())
                        .quantity(2)
                        .unitPrice(new BigDecimal("180.00"))
                        .build()))
                .payments(List.of(PaymentTenderDto.builder()
                        .method(PaymentMethod.CASH)
                        .amount(new BigDecimal("396.00"))
                        .tenderedAmount(new BigDecimal("400.00"))
                        .build()))
                .build();

        mockMvc.perform(post("/api/v1/pos/checkout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.receiptNumber").value("SALE-1001-123"))
                .andExpect(jsonPath("$.data.changeDue").value(4.00));
    }

    @Test
    void testBatchSyncSuccess() throws Exception {
        BatchSyncResultDto result = BatchSyncResultDto.builder()
                .idempotencyKey("idem-uuid-001")
                .receiptNumber("SALE-1001-123")
                .status("SYNCED")
                .build();

        given(saleService.processBatchSync(any(BatchSyncRequest.class), any())).willReturn(List.of(result));

        CheckoutRequest checkoutItem = CheckoutRequest.builder()
                .idempotencyKey("idem-uuid-001")
                .branchSlug("colombo")
                .items(List.of(CheckoutItemRequest.builder()
                        .productId(UUID.randomUUID())
                        .quantity(1)
                        .unitPrice(new BigDecimal("180.00"))
                        .build()))
                .payments(List.of(PaymentTenderDto.builder()
                        .method(PaymentMethod.CASH)
                        .amount(new BigDecimal("180.00"))
                        .build()))
                .build();

        BatchSyncRequest batchRequest = BatchSyncRequest.builder()
                .sales(List.of(checkoutItem))
                .build();

        mockMvc.perform(post("/api/v1/pos/sync-batch")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(batchRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].status").value("SYNCED"));
    }

    @Test
    void testParkCartSuccess() throws Exception {
        given(heldSaleService.parkCart(any(HeldSaleRequest.class), any())).willReturn(mockHeldSaleDto);

        HeldSaleRequest request = HeldSaleRequest.builder()
                .branchSlug("colombo")
                .label("Table 3")
                .items(List.of(HeldSaleItemRequest.builder()
                        .productId(UUID.randomUUID())
                        .quantity(2)
                        .unitPrice(new BigDecimal("180.00"))
                        .build()))
                .build();

        mockMvc.perform(post("/api/v1/pos/held-sales")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.label").value("Table 3"));
    }

    @Test
    void testGetHeldSalesSuccess() throws Exception {
        given(heldSaleService.getHeldSales("colombo")).willReturn(List.of(mockHeldSaleDto));

        mockMvc.perform(get("/api/v1/pos/held-sales").param("branchSlug", "colombo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].label").value("Table 3"));
    }

    @Test
    void testDiscardHeldSaleSuccess() throws Exception {
        UUID id = mockHeldSaleDto.getId();
        doNothing().when(heldSaleService).discardHeldSale(id);

        mockMvc.perform(delete("/api/v1/pos/held-sales/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
