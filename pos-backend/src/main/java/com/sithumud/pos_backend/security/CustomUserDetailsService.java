package com.sithumud.pos_backend.security;

import com.sithumud.pos_backend.auth.UserRepository;
import com.sithumud.pos_backend.auth.entity.User;
import com.sithumud.pos_backend.tenant.context.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Ensure TenantContext is set before executing the tenant-scoped query.
        // JwtAuthenticationFilter normally sets it from the JWT claims, and
        // AuthService.login() sets it before calling authenticationManager.authenticate().
        // This fallback handles any edge-case where it isn't set yet.
        if (TenantContext.getTenantId() == null) {
            UUID tenantId = userRepository.findTenantIdByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
            TenantContext.setTenantId(tenantId);
        }

        User user = userRepository.findByEmailWithBranch(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return UserPrincipal.create(user);
    }
}
