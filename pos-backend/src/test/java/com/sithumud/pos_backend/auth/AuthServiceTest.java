package com.sithumud.pos_backend.auth;

import com.sithumud.pos_backend.auth.dto.AuthResponse;
import com.sithumud.pos_backend.auth.dto.LoginRequest;
import com.sithumud.pos_backend.auth.dto.RefreshTokenRequest;
import com.sithumud.pos_backend.auth.dto.UserDto;
import com.sithumud.pos_backend.auth.entity.Role;
import com.sithumud.pos_backend.auth.entity.User;
import com.sithumud.pos_backend.auth.entity.UserStatus;
import com.sithumud.pos_backend.branch.entity.Branch;
import com.sithumud.pos_backend.common.exception.ApiException;
import com.sithumud.pos_backend.security.JwtTokenProvider;
import com.sithumud.pos_backend.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthService authService;

    private User mockUser;
    private UserPrincipal mockPrincipal;

    @BeforeEach
    void setUp() {
        Branch branch = Branch.builder()
                .slug("colombo")
                .name("Colombo Main")
                .build();
        branch.setId(UUID.randomUUID());

        mockUser = User.builder()
                .name("Ruwan Silva")
                .email("admin@retailos.lk")
                .passwordHash("hashed")
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .branch(branch)
                .build();
        mockUser.setId(UUID.randomUUID());

        mockPrincipal = UserPrincipal.create(mockUser);
    }

    @Test
    void testLoginSuccess() {
        LoginRequest loginRequest = LoginRequest.builder()
                .email("admin@retailos.lk")
                .password("admin123")
                .build();

        given(authenticationManager.authenticate(any())).willReturn(authentication);
        given(authentication.getPrincipal()).willReturn(mockPrincipal);
        given(userRepository.findByEmailWithBranch("admin@retailos.lk")).willReturn(Optional.of(mockUser));
        given(tokenProvider.generateAccessTokenForUser(any())).willReturn("access-123");
        given(tokenProvider.generateRefreshTokenForUser(any())).willReturn("refresh-123");
        given(tokenProvider.getAccessTokenExpirationMs()).willReturn(86400000L);

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("access-123", response.getAccessToken());
        assertEquals("refresh-123", response.getRefreshToken());
        assertEquals("admin@retailos.lk", response.getUser().getEmail());
    }

    @Test
    void testLoginBadCredentials() {
        LoginRequest loginRequest = LoginRequest.builder()
                .email("admin@retailos.lk")
                .password("wrongpassword")
                .build();

        given(authenticationManager.authenticate(any())).willThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(ApiException.class, () -> authService.login(loginRequest));
    }

    @Test
    void testRefreshTokenSuccess() {
        RefreshTokenRequest request = RefreshTokenRequest.builder()
                .refreshToken("valid-refresh-token")
                .build();

        given(tokenProvider.validateToken("valid-refresh-token")).willReturn(true);
        given(tokenProvider.getTokenType("valid-refresh-token")).willReturn("REFRESH");
        given(tokenProvider.getEmailFromToken("valid-refresh-token")).willReturn("admin@retailos.lk");
        given(userRepository.findByEmailWithBranch("admin@retailos.lk")).willReturn(Optional.of(mockUser));
        given(tokenProvider.generateAccessTokenForUser(any())).willReturn("new-access-token");
        given(tokenProvider.generateRefreshTokenForUser(any())).willReturn("new-refresh-token");
        given(tokenProvider.getAccessTokenExpirationMs()).willReturn(86400000L);

        AuthResponse response = authService.refreshToken(request);

        assertNotNull(response);
        assertEquals("new-access-token", response.getAccessToken());
        assertEquals("new-refresh-token", response.getRefreshToken());
    }
}
