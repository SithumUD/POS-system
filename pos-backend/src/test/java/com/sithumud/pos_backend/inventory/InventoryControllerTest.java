package com.sithumud.pos_backend.inventory;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sithumud.pos_backend.common.exception.GlobalExceptionHandler;
import com.sithumud.pos_backend.inventory.dto.CreateStockTransferRequest;
import com.sithumud.pos_backend.inventory.dto.StockAdjustmentRequest;
import com.sithumud.pos_backend.inventory.dto.StockAdjustmentResponse;
import com.sithumud.pos_backend.inventory.dto.StockLevelDto;
import com.sithumud.pos_backend.inventory.dto.StockMovementDto;
import com.sithumud.pos_backend.inventory.dto.StockTransferDto;
import com.sithumud.pos_backend.inventory.dto.StockTransferItemRequest;
import com.sithumud.pos_backend.inventory.entity.StockMovementType;
import com.sithumud.pos_backend.inventory.entity.TransferStatus;
import com.sithumud.pos_backend.product.dto.StockStatus;
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
class InventoryControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private InventoryService inventoryService;

    @InjectMocks
    private InventoryController inventoryController;

    private StockLevelDto mockStockDto;
    private StockAdjustmentResponse mockAdjustmentResponse;
    private StockMovementDto mockMovementDto;
    private StockTransferDto mockTransferDto;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        mockMvc = MockMvcBuilders.standaloneSetup(inventoryController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        mockStockDto = StockLevelDto.builder()
                .id(UUID.randomUUID())
                .productId(UUID.randomUUID())
                .productName("Coca-Cola 400ml")
                .sku("BEV-CC-400")
                .branchSlug("colombo")
                .branchName("Colombo Store")
                .quantityOnHand(50)
                .reorderPoint(10)
                .stockStatus(StockStatus.IN_STOCK)
                .build();

        mockAdjustmentResponse = StockAdjustmentResponse.builder()
                .id(UUID.randomUUID())
                .referenceId("ADJ-1001-123")
                .productId(UUID.randomUUID())
                .productName("Coca-Cola 400ml")
                .branchSlug("colombo")
                .action("ADD")
                .previousQuantity(50)
                .adjustedQuantityDelta(10)
                .newQuantity(60)
                .reason("Recount / Stocktake")
                .adjustedBy("Admin User")
                .adjustedAt(Instant.now())
                .build();

        mockMovementDto = StockMovementDto.builder()
                .id(UUID.randomUUID())
                .productName("Coca-Cola 400ml")
                .sku("BEV-CC-400")
                .branchSlug("colombo")
                .type(StockMovementType.SALE)
                .quantity(-2)
                .referenceId("SALE-1001-123")
                .createdBy("Ruwan Silva")
                .createdAt(Instant.now())
                .build();

        mockTransferDto = StockTransferDto.builder()
                .id(UUID.randomUUID())
                .transferNumber("TRF-0338-123")
                .fromBranchSlug("colombo")
                .toBranchSlug("kandy")
                .status(TransferStatus.IN_TRANSIT)
                .note("Cover weekend shortfall")
                .createdBy("Admin User")
                .createdAt(Instant.now())
                .build();
    }

    @Test
    void testGetLiveStockSuccess() throws Exception {
        given(inventoryService.getLiveStock(any(), any(Pageable.class)))
                .willReturn(new PageImpl<>(List.of(mockStockDto), PageRequest.of(0, 20), 1));

        mockMvc.perform(get("/api/v1/inventory/stock")
                        .param("branchSlug", "colombo")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].sku").value("BEV-CC-400"))
                .andExpect(jsonPath("$.data.content[0].quantityOnHand").value(50));
    }

    @Test
    void testAdjustStockSuccess() throws Exception {
        given(inventoryService.adjustStock(any(StockAdjustmentRequest.class), any()))
                .willReturn(mockAdjustmentResponse);

        StockAdjustmentRequest request = StockAdjustmentRequest.builder()
                .productId(UUID.randomUUID())
                .branchSlug("colombo")
                .action("ADD")
                .quantity(10)
                .reason("Recount / Stocktake")
                .build();

        mockMvc.perform(post("/api/v1/inventory/adjustments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.newQuantity").value(60));
    }

    @Test
    void testGetStockMovementsSuccess() throws Exception {
        given(inventoryService.getStockMovements(any(), any(Pageable.class)))
                .willReturn(new PageImpl<>(List.of(mockMovementDto), PageRequest.of(0, 20), 1));

        mockMvc.perform(get("/api/v1/inventory/movements")
                        .param("branchSlug", "colombo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].referenceId").value("SALE-1001-123"));
    }

    @Test
    void testGetTransfersSuccess() throws Exception {
        given(inventoryService.getTransfers(any(), any(Pageable.class)))
                .willReturn(new PageImpl<>(List.of(mockTransferDto), PageRequest.of(0, 20), 1));

        mockMvc.perform(get("/api/v1/inventory/transfers")
                        .param("fromBranchSlug", "colombo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].transferNumber").value("TRF-0338-123"));
    }

    @Test
    void testCreateTransferSuccess() throws Exception {
        given(inventoryService.createTransfer(any(CreateStockTransferRequest.class), any()))
                .willReturn(mockTransferDto);

        CreateStockTransferRequest request = CreateStockTransferRequest.builder()
                .fromBranchSlug("colombo")
                .toBranchSlug("kandy")
                .items(List.of(StockTransferItemRequest.builder()
                        .productId(UUID.randomUUID())
                        .quantity(10)
                        .build()))
                .note("Cover weekend shortfall")
                .build();

        mockMvc.perform(post("/api/v1/inventory/transfers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.transferNumber").value("TRF-0338-123"));
    }

    @Test
    void testCompleteTransferSuccess() throws Exception {
        UUID id = mockTransferDto.getId();
        mockTransferDto.setStatus(TransferStatus.COMPLETED);
        given(inventoryService.completeTransfer(eq(id), any())).willReturn(mockTransferDto);

        mockMvc.perform(post("/api/v1/inventory/transfers/{id}/complete", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("COMPLETED"));
    }

    @Test
    void testCancelTransferSuccess() throws Exception {
        UUID id = mockTransferDto.getId();
        mockTransferDto.setStatus(TransferStatus.CANCELLED);
        given(inventoryService.cancelTransfer(eq(id), any())).willReturn(mockTransferDto);

        mockMvc.perform(post("/api/v1/inventory/transfers/{id}/cancel", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("CANCELLED"));
    }
}
