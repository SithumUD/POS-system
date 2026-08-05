package com.sithumud.pos_backend.purchasing;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sithumud.pos_backend.common.exception.GlobalExceptionHandler;
import com.sithumud.pos_backend.purchasing.dto.CreateSupplierRequest;
import com.sithumud.pos_backend.purchasing.dto.SupplierDto;
import com.sithumud.pos_backend.purchasing.dto.UpdateSupplierRequest;
import com.sithumud.pos_backend.purchasing.entity.PaymentTerms;
import com.sithumud.pos_backend.purchasing.entity.SupplierStatus;
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

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class SupplierControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private SupplierService supplierService;

    @InjectMocks
    private SupplierController supplierController;

    private SupplierDto mockSupplierDto;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        mockMvc = MockMvcBuilders.standaloneSetup(supplierController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        mockSupplierDto = SupplierDto.builder()
                .id(UUID.randomUUID())
                .name("Ceylon Beverages Distributors")
                .contactPerson("Chaminda Rajapaksa")
                .phone("+94 11 234 5567")
                .contactEmail("orders@ceylonbev.lk")
                .paymentTerms(PaymentTerms.NET_30)
                .leadTimeDays(4)
                .status(SupplierStatus.ACTIVE)
                .suppliedCategories(List.of("Beverages"))
                .build();
    }

    @Test
    void testGetSuppliersSuccess() throws Exception {
        given(supplierService.getSuppliers(any(), any(Pageable.class)))
                .willReturn(new PageImpl<>(List.of(mockSupplierDto), PageRequest.of(0, 20), 1));

        mockMvc.perform(get("/api/v1/suppliers")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].name").value("Ceylon Beverages Distributors"));
    }

    @Test
    void testGetSupplierByIdSuccess() throws Exception {
        UUID id = mockSupplierDto.getId();
        given(supplierService.getSupplierById(id)).willReturn(mockSupplierDto);

        mockMvc.perform(get("/api/v1/suppliers/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(id.toString()));
    }

    @Test
    void testCreateSupplierSuccess() throws Exception {
        given(supplierService.createSupplier(any(CreateSupplierRequest.class))).willReturn(mockSupplierDto);

        CreateSupplierRequest request = CreateSupplierRequest.builder()
                .name("Ceylon Beverages Distributors")
                .contactPerson("Chaminda Rajapaksa")
                .phone("+94 11 234 5567")
                .contactEmail("orders@ceylonbev.lk")
                .paymentTerms(PaymentTerms.NET_30)
                .leadTimeDays(4)
                .build();

        mockMvc.perform(post("/api/v1/suppliers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Ceylon Beverages Distributors"));
    }

    @Test
    void testUpdateSupplierSuccess() throws Exception {
        UUID id = mockSupplierDto.getId();
        given(supplierService.updateSupplier(eq(id), any(UpdateSupplierRequest.class))).willReturn(mockSupplierDto);

        UpdateSupplierRequest request = UpdateSupplierRequest.builder()
                .name("Ceylon Beverages Distributors")
                .contactPerson("Chaminda Rajapaksa")
                .phone("+94 11 234 5567")
                .contactEmail("orders@ceylonbev.lk")
                .paymentTerms(PaymentTerms.NET_30)
                .leadTimeDays(5)
                .status(SupplierStatus.ACTIVE)
                .build();

        mockMvc.perform(put("/api/v1/suppliers/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Ceylon Beverages Distributors"));
    }

    @Test
    void testDeleteSupplierSuccess() throws Exception {
        UUID id = mockSupplierDto.getId();
        doNothing().when(supplierService).deleteSupplier(id);

        mockMvc.perform(delete("/api/v1/suppliers/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
