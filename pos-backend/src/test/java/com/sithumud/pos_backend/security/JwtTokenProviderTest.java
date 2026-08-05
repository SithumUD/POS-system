package com.sithumud.pos_backend.security;

import com.sithumud.pos_backend.auth.entity.Role;
import com.sithumud.pos_backend.auth.entity.UserStatus;
import com.sithumud.pos_backend.config.JwtProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        JwtProperties properties = new JwtProperties();
        properties.setSecret("404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        properties.setAccessTokenExpirationMs(3600000); // 1 hour
        properties.setRefreshTokenExpirationMs(86400000); // 24 hours
        jwtTokenProvider = new JwtTokenProvider(properties);
    }

    @Test
    void testGenerateAndValidateAccessToken() {
        UserPrincipal userPrincipal = new UserPrincipal(
                UUID.randomUUID(),
                "Ruwan Silva",
                "admin@retailos.lk",
                "encodedPassword",
                UserStatus.ACTIVE,
                Role.ADMIN.name(),
                "colombo",
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );

        String accessToken = jwtTokenProvider.generateAccessTokenForUser(userPrincipal);
        assertNotNull(accessToken);
        assertTrue(jwtTokenProvider.validateToken(accessToken));
        assertEquals("admin@retailos.lk", jwtTokenProvider.getEmailFromToken(accessToken));
        assertEquals("ACCESS", jwtTokenProvider.getTokenType(accessToken));
    }

    @Test
    void testGenerateAndValidateRefreshToken() {
        UserPrincipal userPrincipal = new UserPrincipal(
                UUID.randomUUID(),
                "Ruwan Silva",
                "admin@retailos.lk",
                "encodedPassword",
                UserStatus.ACTIVE,
                Role.ADMIN.name(),
                "colombo",
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );

        String refreshToken = jwtTokenProvider.generateRefreshTokenForUser(userPrincipal);
        assertNotNull(refreshToken);
        assertTrue(jwtTokenProvider.validateToken(refreshToken));
        assertEquals("admin@retailos.lk", jwtTokenProvider.getEmailFromToken(refreshToken));
        assertEquals("REFRESH", jwtTokenProvider.getTokenType(refreshToken));
    }

    @Test
    void testInvalidToken() {
        assertFalse(jwtTokenProvider.validateToken("invalid.jwt.token"));
    }
}
