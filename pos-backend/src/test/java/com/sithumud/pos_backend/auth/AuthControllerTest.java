package com.sithumud.pos_backend.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.sithumud.pos_backend.auth.dto.AuthResponse;
import com.sithumud.pos_backend.auth.dto.BranchSummaryDto;
import com.sithumud.pos_backend.auth.dto.LoginRequest;
import com.sithumud.pos_backend.auth.dto.RefreshTokenRequest;
import com.sithumud.pos_backend.auth.dto.UserDto;
import com.sithumud.pos_backend.auth.entity.Role;
import com.sithumud.pos_backend.auth.entity.UserStatus;
import com.sithumud.pos_backend.common.exception.GlobalExceptionHandler;
import com.sithumud.pos_backend.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private AuthResponse mockAuthResponse;
    private UserDto mockUserDto;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .build();

        mockUserDto = UserDto.builder()
                .id(UUID.randomUUID())
                .name("Ruwan Silva")
                .email("admin@retailos.lk")
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .branch(BranchSummaryDto.builder()
                        .id(UUID.randomUUID())
                        .slug("colombo")
                        .name("Colombo – Main Branch")
                        .shortName("Colombo – Main")
                        .build())
                .permissions(List.of("pos", "refunds", "products", "purchasing", "reports", "settings"))
                .createdAt(Instant.now())
                .build();

        mockAuthResponse = AuthResponse.builder()
                .accessToken("mock-access-token")
                .refreshToken("mock-refresh-token")
                .tokenType("Bearer")
                .expiresIn(86400)
                .user(mockUserDto)
                .build();
    }

    @Test
    void testLoginSuccess() throws Exception {
        given(authService.login(any(LoginRequest.class))).willReturn(mockAuthResponse);

        LoginRequest loginRequest = LoginRequest.builder()
                .email("admin@retailos.lk")
                .password("admin123")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("mock-access-token"))
                .andExpect(jsonPath("$.data.user.email").value("admin@retailos.lk"))
                .andExpect(jsonPath("$.data.user.role").value("ADMIN"))
                .andExpect(jsonPath("$.data.user.permissions[0]").value("pos"));
    }

    @Test
    void testRefreshTokenSuccess() throws Exception {
        given(authService.refreshToken(any(RefreshTokenRequest.class))).willReturn(mockAuthResponse);

        RefreshTokenRequest refreshRequest = RefreshTokenRequest.builder()
                .refreshToken("valid-refresh-token")
                .build();

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("mock-access-token"));
    }

    @Test
    void testGetCurrentUserSuccess() throws Exception {
        given(authService.getCurrentUserContext(any())).willReturn(mockUserDto);

        UserPrincipal userPrincipal = new UserPrincipal(
                UUID.randomUUID(),
                UUID.randomUUID(),
                "Ruwan Silva",
                "admin@retailos.lk",
                "encodedPassword",
                UserStatus.ACTIVE,
                Role.ADMIN.name(),
                "colombo",
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );

        mockMvc.perform(get("/api/v1/auth/me")
                        .principal(new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.getAuthorities())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("admin@retailos.lk"))
                .andExpect(jsonPath("$.data.branch.slug").value("colombo"));
    }
}
