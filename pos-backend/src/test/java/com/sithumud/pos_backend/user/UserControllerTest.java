package com.sithumud.pos_backend.user;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sithumud.pos_backend.auth.entity.Role;
import com.sithumud.pos_backend.auth.entity.UserStatus;
import com.sithumud.pos_backend.common.exception.GlobalExceptionHandler;
import com.sithumud.pos_backend.user.dto.CreateUserRequest;
import com.sithumud.pos_backend.user.dto.RolePermissionMatrixDto;
import com.sithumud.pos_backend.user.dto.UpdateUserRequest;
import com.sithumud.pos_backend.user.dto.UserDto;
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
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willDoNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    private UserDto mockUserDto;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        mockMvc = MockMvcBuilders.standaloneSetup(userController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setConversionService(new org.springframework.format.support.DefaultFormattingConversionService())
                .build();

        mockUserDto = UserDto.builder()
                .id(UUID.randomUUID())
                .name("Ruwan Silva")
                .email("ruwan@retailos.lk")
                .role(Role.CASHIER)
                .status(UserStatus.ACTIVE)
                .branchSlug("colombo")
                .branchName("Colombo Store")
                .build();
    }

    @Test
    void testGetUsersSuccess() throws Exception {
        given(userService.getUsers(any(), any(Pageable.class)))
                .willReturn(new PageImpl<>(List.of(mockUserDto), PageRequest.of(0, 20), 1));

        mockMvc.perform(get("/api/v1/users")
                        .param("role", "CASHIER")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].email").value("ruwan@retailos.lk"));
    }

    @Test
    void testGetUserByIdSuccess() throws Exception {
        UUID id = mockUserDto.getId();
        given(userService.getUserById(id)).willReturn(mockUserDto);

        mockMvc.perform(get("/api/v1/users/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Ruwan Silva"));
    }

    @Test
    void testCreateUserSuccess() throws Exception {
        given(userService.createUser(any(CreateUserRequest.class))).willReturn(mockUserDto);

        CreateUserRequest request = CreateUserRequest.builder()
                .name("Ruwan Silva")
                .email("ruwan@retailos.lk")
                .password("password123")
                .role(Role.CASHIER)
                .branchSlug("colombo")
                .build();

        mockMvc.perform(post("/api/v1/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("ruwan@retailos.lk"));
    }

    @Test
    void testUpdateUserSuccess() throws Exception {
        UUID id = mockUserDto.getId();
        given(userService.updateUser(eq(id), any(UpdateUserRequest.class))).willReturn(mockUserDto);

        UpdateUserRequest request = UpdateUserRequest.builder()
                .name("Ruwan Silva")
                .email("ruwan@retailos.lk")
                .role(Role.CASHIER)
                .status(UserStatus.ACTIVE)
                .build();

        mockMvc.perform(put("/api/v1/users/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Ruwan Silva"));
    }

    @Test
    void testUpdateUserStatusSuccess() throws Exception {
        UUID id = mockUserDto.getId();
        mockUserDto.setStatus(UserStatus.SUSPENDED);
        given(userService.updateUserStatus(eq(id), eq(UserStatus.SUSPENDED))).willReturn(mockUserDto);

        mockMvc.perform(patch("/api/v1/users/{id}/status?status=SUSPENDED", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("SUSPENDED"));
    }

    @Test
    void testDeleteUserSuccess() throws Exception {
        UUID id = mockUserDto.getId();
        willDoNothing().given(userService).deleteUser(id);

        mockMvc.perform(delete("/api/v1/users/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void testGetRolePermissionsSuccess() throws Exception {
        RolePermissionMatrixDto matrix = RolePermissionMatrixDto.builder()
                .rolePermissions(Map.of(Role.ADMIN, List.of("POS_CHECKOUT")))
                .build();

        given(userService.getRolePermissions()).willReturn(matrix);

        mockMvc.perform(get("/api/v1/roles/permissions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
