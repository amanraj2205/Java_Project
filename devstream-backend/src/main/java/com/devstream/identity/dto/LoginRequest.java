package com.devstream.identity.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @JsonAlias({"username", "email"})
    @NotBlank(message = "Username or email is required")
    private String usernameOrEmail;

    @NotBlank(message = "Password is required")
    private String password;

    public String getUsernameOrEmail() { return usernameOrEmail; }
    public void setUsernameOrEmail(String usernameOrEmail) { this.usernameOrEmail = usernameOrEmail; }

    public void setUsername(String username) {
        if (this.usernameOrEmail == null || this.usernameOrEmail.isBlank()) {
            this.usernameOrEmail = username;
        }
    }

    public void setEmail(String email) {
        if (this.usernameOrEmail == null || this.usernameOrEmail.isBlank()) {
            this.usernameOrEmail = email;
        }
    }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}

