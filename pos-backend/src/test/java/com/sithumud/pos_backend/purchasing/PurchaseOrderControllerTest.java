package com.sithumud.pos_backend.purchasing;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sithumud.pos_backend.common.exception.GlobalExceptionHandler;
import com.sithumud.pos_backend.purchasing.dto.CreatePurchaseOrderRequest;
import com.sithumud.pos_backend.purchasing.dto.PurchaseOrderDto;
import com.sithumud.pos_backend.purchasing.dto.PurchaseOrderItemDto;
import com.sithumud.pos_backend.purchasing.dto.PurchaseOrderItemRequest;
import com.sithumud.pos_backend.purchasing.dto.ReceivePurchaseOrderRequest;
import com.sithumud.pos_backend.purchasing.dto.UpdatePurchaseOrderRequest;
import com.sithumud.pos_backend.purchasing.entity.PurchaseOrderStatus;
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
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class PurchaseOrderControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private PurchaseOrderService purchaseOrderService;

    @InjectMocks
    private PurchaseOrderController purchaseOrderController;

    private PurchaseOrderDto mockPoDto;
    private UUID productId;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        mockMvc = MockMvcBuilders.standaloneSetup(purchaseOrderController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setConversionService(new org.springframework.format.support.DefaultFormattingConversionService())
                .build();

        productId = UUID.randomUUID();

        PurchaseOrderItemDto mockItem = PurchaseOrderItemDto.builder()
                .id(UUID.randomUUID())
                .productId(productId)
                .name("Anchor Milk Powder 400g")
                .sku("DRY-AN-400")
                .quantityOrdered(50)
                .quantityReceived(0)
                .unitCost(new BigDecimal("550.00"))
                .lineTotal(new BigDecimal("27500.00"))
                .build();

        mockPoDto = PurchaseOrderDto.builder()
                .id(UUID.randomUUID())
                .poNumber("PO-2043-123")
                .supplierId(UUID.randomUUID())
                .supplierName("Fonterra Sri Lanka")
                .branchSlug("colombo")
                .branchName("Colombo Store")
                .status(PurchaseOrderStatus.DRAFT)
                .createdBy("Ruwan Silva")
                .createdAt(Instant.now())
                .expectedAt(Instant.now().plusSeconds(86400))
                .totalAmount(new BigDecimal("27500.00"))
                .items(List.of(mockItem))
                .events(List.of())
                .build();
    }

    @Test
    void testGetPurchaseOrdersSuccess() throws Exception {
        given(purchaseOrderService.getPurchaseOrders(any(), any(Pageable.class)))
                .willReturn(new PageImpl<>(List.of(mockPoDto), PageRequest.of(0, 20), 1));

        mockMvc.perform(get("/api/v1/purchase-orders")
                        .param("branchSlug", "colombo")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].poNumber").value("PO-2043-123"));
    }

    @Test
    void testGetPurchaseOrderByIdSuccess() throws Exception {
        UUID id = mockPoDto.getId();
        given(purchaseOrderService.getPurchaseOrderById(id)).willReturn(mockPoDto);

        mockMvc.perform(get("/api/v1/purchase-orders/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(id.toString()));
    }

    @Test
    void testCreatePurchaseOrderSuccess() throws Exception {
        given(purchaseOrderService.createPurchaseOrder(any(CreatePurchaseOrderRequest.class), any()))
                .willReturn(mockPoDto);

        CreatePurchaseOrderRequest request = CreatePurchaseOrderRequest.builder()
                .supplierId(UUID.randomUUID())
                .branchSlug("colombo")
                .items(List.of(PurchaseOrderItemRequest.builder()
                        .productId(productId)
                        .quantityOrdered(50)
                        .unitCost(new BigDecimal("550.00"))
                        .build()))
                .status(PurchaseOrderStatus.DRAFT)
                .build();

        mockMvc.perform(post("/api/v1/purchase-orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.poNumber").value("PO-2043-123"));
    }

    @Test
    void testUpdatePurchaseOrderSuccess() throws Exception {
        UUID id = mockPoDto.getId();
        given(purchaseOrderService.updatePurchaseOrder(eq(id), any(UpdatePurchaseOrderRequest.class), any()))
                .willReturn(mockPoDto);

        UpdatePurchaseOrderRequest request = UpdatePurchaseOrderRequest.builder()
                .items(List.of(PurchaseOrderItemRequest.builder()
                        .productId(productId)
                        .quantityOrdered(50)
                        .unitCost(new BigDecimal("550.00"))
                        .build()))
                .notes("Split delivery agreed")
                .build();

        mockMvc.perform(put("/api/v1/purchase-orders/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.poNumber").value("PO-2043-123"));
    }

    @Test
    void testUpdateStatusSuccess() throws Exception {
        UUID id = mockPoDto.getId();
        mockPoDto.setStatus(PurchaseOrderStatus.SENT);
        given(purchaseOrderService.updateStatus(eq(id), eq(PurchaseOrderStatus.SENT), any()))
                .willReturn(mockPoDto);

        mockMvc.perform(patch("/api/v1/purchase-orders/{id}/status?status=SENT", id))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("SENT"));
    }

    @Test
    void testReceiveStockSuccess() throws Exception {
        UUID id = mockPoDto.getId();
        mockPoDto.setStatus(PurchaseOrderStatus.RECEIVED);
        given(purchaseOrderService.receiveStock(eq(id), any(ReceivePurchaseOrderRequest.class), any()))
                .willReturn(mockPoDto);

        ReceivePurchaseOrderRequest request = ReceivePurchaseOrderRequest.builder()
                .itemQuantities(Map.of(productId, 50))
                .notes("Full shipment received in good condition")
                .build();

        mockMvc.perform(post("/api/v1/purchase-orders/{id}/receive", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("RECEIVED"));
    }

    @Test
    void testDeletePurchaseOrderSuccess() throws Exception {
        UUID id = mockPoDto.getId();
        org.mockito.Mockito.doNothing().when(purchaseOrderService).deletePurchaseOrder(eq(id), any());

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/v1/purchase-orders/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
