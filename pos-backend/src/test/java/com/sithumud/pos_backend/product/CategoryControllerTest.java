package com.sithumud.pos_backend.product;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sithumud.pos_backend.common.exception.GlobalExceptionHandler;
import com.sithumud.pos_backend.product.dto.CategoryDto;
import com.sithumud.pos_backend.product.dto.CreateCategoryRequest;
import com.sithumud.pos_backend.product.dto.UpdateCategoryRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
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
class CategoryControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private CategoryService categoryService;

    @InjectMocks
    private CategoryController categoryController;

    private CategoryDto mockCategoryDto;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        mockMvc = MockMvcBuilders.standaloneSetup(categoryController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        mockCategoryDto = CategoryDto.builder()
                .id(UUID.randomUUID())
                .name("Beverages")
                .slug("beverages")
                .displayOrder(1)
                .productCount(10L)
                .build();
    }

    @Test
    void testGetCategoriesSuccess() throws Exception {
        given(categoryService.getCategoryHierarchy()).willReturn(List.of(mockCategoryDto));

        mockMvc.perform(get("/api/v1/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("Beverages"))
                .andExpect(jsonPath("$.data[0].slug").value("beverages"));
    }

    @Test
    void testGetCategoryTreeSuccess() throws Exception {
        given(categoryService.getCategoryHierarchy()).willReturn(List.of(mockCategoryDto));

        mockMvc.perform(get("/api/v1/categories/tree"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("Beverages"))
                .andExpect(jsonPath("$.data[0].slug").value("beverages"));
    }

    @Test
    void testGetCategoryByIdSuccess() throws Exception {
        UUID id = mockCategoryDto.getId();
        given(categoryService.getCategoryById(id)).willReturn(mockCategoryDto);

        mockMvc.perform(get("/api/v1/categories/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(id.toString()));
    }

    @Test
    void testCreateCategorySuccess() throws Exception {
        given(categoryService.createCategory(any(CreateCategoryRequest.class))).willReturn(mockCategoryDto);

        CreateCategoryRequest request = CreateCategoryRequest.builder()
                .name("Beverages")
                .slug("beverages")
                .displayOrder(1)
                .build();

        mockMvc.perform(post("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Beverages"));
    }

    @Test
    void testUpdateCategorySuccess() throws Exception {
        UUID id = mockCategoryDto.getId();
        given(categoryService.updateCategory(eq(id), any(UpdateCategoryRequest.class))).willReturn(mockCategoryDto);

        UpdateCategoryRequest request = UpdateCategoryRequest.builder()
                .name("Beverages Updated")
                .slug("beverages")
                .displayOrder(2)
                .build();

        mockMvc.perform(put("/api/v1/categories/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void testDeleteCategorySuccess() throws Exception {
        UUID id = mockCategoryDto.getId();
        doNothing().when(categoryService).deleteCategory(id);

        mockMvc.perform(delete("/api/v1/categories/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
