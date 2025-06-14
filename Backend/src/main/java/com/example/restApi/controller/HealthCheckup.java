package com.example.restApi.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthCheckup {

    @GetMapping ("/health-check")
    public String healthCheckup() {
        return "ok";
    }
}
