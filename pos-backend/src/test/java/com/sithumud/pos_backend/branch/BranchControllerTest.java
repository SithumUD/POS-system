package com.sithumud.pos_backend.branch;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sithumud.pos_backend.branch.dto.BranchDto;
import com.sithumud.pos_backend.branch.dto.CreateBranchRequest;
import com.sithumud.pos_backend.branch.dto.UpdateBranchRequest;
import com.sithumud.pos_backend.branch.entity.BranchStatus;
import com.sithumud.pos_backend.common.exception.GlobalExceptionHandler;
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
import static org.mockito.BDDMockito.willDoNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class BranchControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private BranchService branchService;

    @InjectMocks
    private BranchController branchController;

    private BranchDto mockBranchDto;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        mockMvc = MockMvcBuilders.standaloneSetup(branchController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setConversionService(new org.springframework.format.support.DefaultFormattingConversionService())
                .build();

        mockBranchDto = BranchDto.builder()
                .id(UUID.randomUUID())
                .slug("kandy-city")
                .name("Kandy City Store")
                .shortName("Kandy City")
                .address("78 Dalada Veediya, Kandy")
                .phone("+94812234567")
                .managerName("Sunil Perera")
                .opensAt("08:00")
                .closesAt("21:00")
                .terminalCount(2)
                .status(BranchStatus.OPEN)
                .build();
    }

    @Test
    void testGetBranchesSuccess() throws Exception {
        given(branchService.getBranches(any(), any(Pageable.class)))
                .willReturn(new PageImpl<>(List.of(mockBranchDto), PageRequest.of(0, 20), 1));

        mockMvc.perform(get("/api/v1/branches")
                        .param("status", "OPEN")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].slug").value("kandy-city"));
    }

    @Test
    void testGetBranchByIdOrSlugSuccess() throws Exception {
        given(branchService.getBranchByIdOrSlug("kandy-city")).willReturn(mockBranchDto);

        mockMvc.perform(get("/api/v1/branches/kandy-city"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Kandy City Store"));
    }

    @Test
    void testCreateBranchSuccess() throws Exception {
        given(branchService.createBranch(any(CreateBranchRequest.class))).willReturn(mockBranchDto);

        CreateBranchRequest request = CreateBranchRequest.builder()
                .name("Kandy City Store")
                .address("78 Dalada Veediya, Kandy")
                .phone("+94812234567")
                .opensAt("08:00")
                .closesAt("21:00")
                .terminalCount(2)
                .status(BranchStatus.OPEN)
                .build();

        mockMvc.perform(post("/api/v1/branches")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.slug").value("kandy-city"));
    }

    @Test
    void testUpdateBranchSuccess() throws Exception {
        UUID id = mockBranchDto.getId();
        given(branchService.updateBranch(eq(id), any(UpdateBranchRequest.class))).willReturn(mockBranchDto);

        UpdateBranchRequest request = UpdateBranchRequest.builder()
                .name("Kandy City Store")
                .shortName("Kandy City")
                .address("78 Dalada Veediya, Kandy")
                .phone("+94812234567")
                .status(BranchStatus.OPEN)
                .build();

        mockMvc.perform(put("/api/v1/branches/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Kandy City Store"));
    }

    @Test
    void testDeleteBranchSuccess() throws Exception {
        UUID id = mockBranchDto.getId();
        willDoNothing().given(branchService).deleteBranch(id);

        mockMvc.perform(delete("/api/v1/branches/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
