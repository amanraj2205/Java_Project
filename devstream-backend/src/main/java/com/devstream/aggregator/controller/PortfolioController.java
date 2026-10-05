package com.devstream.aggregator.controller;

import com.devstream.aggregator.dto.DeveloperPortfolioResponse;
import com.devstream.aggregator.dto.UpdatePortfolioRequest;
import com.devstream.aggregator.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;

    /**
     * Read-only portfolio: Accessible by ROLE_GUEST, ROLE_STUDENT_AUTHOR, ROLE_MODERATOR, and unauthenticated users.
     */
    @GetMapping("/{username}")
    public ResponseEntity<DeveloperPortfolioResponse> getPortfolio(@PathVariable String username) {
        DeveloperPortfolioResponse portfolio = portfolioService.getDeveloperPortfolio(username);
        return ResponseEntity.ok(portfolio);
    }

    /**
     * Edit portfolio: Verified students (ROLE_STUDENT_AUTHOR) can only edit their own portfolio.
     */
    @PutMapping("/{username}")
    @PreAuthorize("hasRole('STUDENT_AUTHOR') and #username == authentication.name")
    public ResponseEntity<DeveloperPortfolioResponse> updatePortfolio(
            @PathVariable String username,
            @RequestBody UpdatePortfolioRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(portfolioService.updatePortfolio(username, request));
    }
}
