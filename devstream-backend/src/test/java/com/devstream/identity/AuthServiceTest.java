package com.devstream.identity;

import com.devstream.identity.dto.AuthResponse;
import com.devstream.identity.dto.LoginRequest;
import com.devstream.identity.dto.RegisterRequest;
import com.devstream.identity.model.Role;
import com.devstream.identity.model.RoleName;
import com.devstream.identity.model.User;
import com.devstream.identity.repository.RoleRepository;
import com.devstream.identity.repository.UserRepository;
import com.devstream.identity.security.JwtTokenProvider;
import com.devstream.identity.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User testUser;
    private Role testRole;

    @BeforeEach
    void setUp() {
        testRole = Role.builder().id(1L).name(RoleName.ROLE_STUDENT_AUTHOR.name()).build();

        testUser = User.builder()
                .id(100L)
                .username("dev_user")
                .email("dev@devstream.io")
                .password("encoded_secret")
                .githubUsername("devuser")
                .roles(Set.of(testRole))
                .build();

        registerRequest = RegisterRequest.builder()
                .username("dev_user")
                .email("dev@devstream.io")
                .password("raw_secret")
                .githubUsername("devuser")
                .bio("Full stack software developer")
                .build();

        loginRequest = LoginRequest.builder()
                .usernameOrEmail("dev_user")
                .password("raw_secret")
                .build();
    }

    @Test
    @DisplayName("Should successfully register a new student author and generate JWT token")
    void testRegisterSuccess() {
        when(userRepository.existsByUsername("dev_user")).thenReturn(false);
        when(userRepository.existsByEmail("dev@devstream.io")).thenReturn(false);
        when(roleRepository.findByName(RoleName.ROLE_STUDENT_AUTHOR.name())).thenReturn(Optional.of(testRole));
        when(passwordEncoder.encode("raw_secret")).thenReturn("encoded_secret");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(tokenProvider.generateTokenForUsername(eq("dev_user"), any())).thenReturn("mocked.jwt.token");

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("mocked.jwt.token", response.getAccessToken());
        assertEquals("dev_user", response.getUsername());
        assertEquals("dev@devstream.io", response.getEmail());
        assertTrue(response.getRoles().contains(RoleName.ROLE_STUDENT_AUTHOR.name()));

        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when registering with duplicate username")
    void testRegisterDuplicateUsername() {
        when(userRepository.existsByUsername("dev_user")).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.register(registerRequest));

        assertEquals("Username is already taken!", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should successfully authenticate user and return JWT token on login")
    void testLoginSuccess() {
        Authentication mockAuthentication = mock(Authentication.class);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mockAuthentication);
        when(tokenProvider.generateToken(mockAuthentication)).thenReturn("mocked.jwt.login.token");
        when(userRepository.findByUsernameOrEmail("dev_user", "dev_user")).thenReturn(Optional.of(testUser));

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("mocked.jwt.login.token", response.getAccessToken());
        assertEquals("dev_user", response.getUsername());
        assertEquals("dev@devstream.io", response.getEmail());
        assertTrue(response.getRoles().contains(RoleName.ROLE_STUDENT_AUTHOR.name()));
    }
}
