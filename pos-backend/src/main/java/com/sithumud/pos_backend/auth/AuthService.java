package com.sithumud.pos_backend.auth;

import com.sithumud.pos_backend.auth.dto.AuthResponse;
import com.sithumud.pos_backend.auth.dto.LoginRequest;
import com.sithumud.pos_backend.auth.dto.RefreshTokenRequest;
import com.sithumud.pos_backend.auth.dto.UserDto;
import com.sithumud.pos_backend.auth.entity.User;
import com.sithumud.pos_backend.auth.entity.UserStatus;
import com.sithumud.pos_backend.common.exception.ApiException;
import com.sithumud.pos_backend.security.JwtTokenProvider;
import com.sithumud.pos_backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException ex) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Invalid email or password.");
        }

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findByEmailWithBranch(userPrincipal.getEmail())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found."));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ApiException(HttpStatus.FORBIDDEN, "ACCOUNT_NOT_ACTIVE", "User account is suspended or has not activated their password.");
        }

        user.setLastActiveAt(Instant.now());
        userRepository.save(user);

        UserPrincipal updatedPrincipal = UserPrincipal.create(user);
        String accessToken = tokenProvider.generateAccessTokenForUser(updatedPrincipal);
        String refreshToken = tokenProvider.generateRefreshTokenForUser(updatedPrincipal);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getAccessTokenExpirationMs() / 1000)
                .user(UserDto.fromEntity(user))
                .build();
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!tokenProvider.validateToken(refreshToken)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_REFRESH_TOKEN", "Invalid or expired refresh token.");
        }

        String tokenType = tokenProvider.getTokenType(refreshToken);
        if (!"REFRESH".equals(tokenType)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_TOKEN_TYPE", "Token provided is not a refresh token.");
        }

        String email = tokenProvider.getEmailFromToken(refreshToken);
        User user = userRepository.findByEmailWithBranch(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found."));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ApiException(HttpStatus.FORBIDDEN, "ACCOUNT_NOT_ACTIVE", "User account is not active.");
        }

        user.setLastActiveAt(Instant.now());
        userRepository.save(user);

        UserPrincipal userPrincipal = UserPrincipal.create(user);
        String newAccessToken = tokenProvider.generateAccessTokenForUser(userPrincipal);
        String newRefreshToken = tokenProvider.generateRefreshTokenForUser(userPrincipal);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getAccessTokenExpirationMs() / 1000)
                .user(UserDto.fromEntity(user))
                .build();
    }

    @Transactional
    public UserDto getCurrentUserContext(UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "User context is missing.");
        }

        User user = userRepository.findByEmailWithBranch(currentUser.getEmail())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found."));

        user.setLastActiveAt(Instant.now());
        userRepository.save(user);

        return UserDto.fromEntity(user);
    }
}
