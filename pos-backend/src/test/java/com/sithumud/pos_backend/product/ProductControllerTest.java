package com.sithumud.pos_backend.product;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sithumud.pos_backend.common.exception.GlobalExceptionHandler;
import com.sithumud.pos_backend.product.dto.BranchStockDto;
import com.sithumud.pos_backend.product.dto.CategoryDto;
import com.sithumud.pos_backend.product.dto.CreateProductRequest;
import com.sithumud.pos_backend.product.dto.ProductDto;
import com.sithumud.pos_backend.product.dto.UpdateProductRequest;
import com.sithumud.pos_backend.product.entity.UnitOfMeasure;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ProductControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private ProductService productService;

    @InjectMocks
    private ProductController productController;

    private ProductDto mockProductDto;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        mockMvc = MockMvcBuilders.standaloneSetup(productController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        mockProductDto = ProductDto.builder()
                .id(UUID.randomUUID())
                .sku("BEV-CC-400")
                .barcode("4792024011234")
                .name("Coca-Cola 400ml")
                .category(CategoryDto.builder().id(UUID.randomUUID()).name("Beverages").slug("beverages").build())
                .price(new BigDecimal("180.00"))
                .cost(new BigDecimal("132.00"))
                .taxRate(new BigDecimal("10.00"))
                .threshold(12)
                .unitOfMeasure(UnitOfMeasure.EACH)
                .unit("Bottle")
                .active(true)
                .totalQuantity(42)
                .branchStock(List.of(BranchStockDto.builder()
                        .branchId(UUID.randomUUID())
                        .branchSlug("colombo")
                        .branchName("Colombo – Main Branch")
                        .quantity(42)
                        .build()))
                .build();
    }

    @Test
    void testGetProductsSuccess() throws Exception {
        given(productService.getProducts(any(), any(Pageable.class)))
                .willReturn(new PageImpl<>(List.of(mockProductDto), org.springframework.data.domain.PageRequest.of(0, 20), 1));

        mockMvc.perform(get("/api/v1/products")
                        .param("search", "Coca")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].sku").value("BEV-CC-400"))
                .andExpect(jsonPath("$.data.content[0].name").value("Coca-Cola 400ml"));
    }

    @Test
    void testGetProductByIdSuccess() throws Exception {
        UUID id = mockProductDto.getId();
        given(productService.getProductById(id)).willReturn(mockProductDto);

        mockMvc.perform(get("/api/v1/products/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(id.toString()))
                .andExpect(jsonPath("$.data.branchStock[0].branchSlug").value("colombo"));
    }

    @Test
    void testCreateProductSuccess() throws Exception {
        given(productService.createProduct(any(CreateProductRequest.class))).willReturn(mockProductDto);

        CreateProductRequest request = CreateProductRequest.builder()
                .sku("BEV-CC-400")
                .barcode("4792024011234")
                .name("Coca-Cola 400ml")
                .price(new BigDecimal("180.00"))
                .cost(new BigDecimal("132.00"))
                .taxRate(new BigDecimal("10.00"))
                .threshold(12)
                .unitOfMeasure(UnitOfMeasure.EACH)
                .unit("Bottle")
                .active(true)
                .initialStock(Map.of("colombo", 42))
                .build();

        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.sku").value("BEV-CC-400"));
    }

    @Test
    void testUpdateProductSuccess() throws Exception {
        UUID id = mockProductDto.getId();
        given(productService.updateProduct(eq(id), any(UpdateProductRequest.class))).willReturn(mockProductDto);

        UpdateProductRequest request = UpdateProductRequest.builder()
                .sku("BEV-CC-400")
                .name("Coca-Cola 400ml Updated")
                .price(new BigDecimal("190.00"))
                .cost(new BigDecimal("135.00"))
                .build();

        mockMvc.perform(put("/api/v1/products/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void testToggleActiveSuccess() throws Exception {
        UUID id = mockProductDto.getId();
        mockProductDto.setActive(false);
        given(productService.toggleActive(id)).willReturn(mockProductDto);

        mockMvc.perform(patch("/api/v1/products/{id}/toggle-active", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.active").value(false));
    }

    @Test
    void testDuplicateProductSuccess() throws Exception {
        UUID id = mockProductDto.getId();
        ProductDto draftCopy = ProductDto.builder()
                .id(UUID.randomUUID())
                .sku("BEV-CC-400-COPY")
                .name("Coca-Cola 400ml (Draft)")
                .active(false)
                .build();

        given(productService.duplicateProduct(id)).willReturn(draftCopy);

        mockMvc.perform(post("/api/v1/products/{id}/duplicate", id))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.sku").value("BEV-CC-400-COPY"));
    }

    @Test
    void testDeleteProductSuccess() throws Exception {
        UUID id = mockProductDto.getId();
        doNothing().when(productService).deleteProduct(id);

        mockMvc.perform(delete("/api/v1/products/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
