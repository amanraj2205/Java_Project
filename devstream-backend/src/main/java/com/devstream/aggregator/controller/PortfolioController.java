package com.devstream.aggregator.controller;

import com.devstream.aggregator.dto.DeveloperPortfolioResponse;
import com.devstream.aggregator.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;

    @GetMapping("/{username}")
    public ResponseEntity<DeveloperPortfolioResponse> getPortfolio(@PathVariable String username) {
        DeveloperPortfolioResponse portfolio = portfolioService.getDeveloperPortfolio(username);
        return ResponseEntity.ok(portfolio);
    }
}
