package com.example.restApi.controller;

import com.example.restApi.entity.UserEntity;
import com.example.restApi.service.UserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;


@CrossOrigin(origins = "http://localhost:3000/")
@RestController
@RequestMapping("/users")
public class UsersDatabase {
    @Autowired
    UserDetailsService userDetailsService;

    @GetMapping("/health")
    public String health() {
        return "ok";
    }

    @PostMapping("/add-user")
    public ResponseEntity<Boolean> addUser(@RequestBody UserEntity userEntity) {
        boolean res = userDetailsService.saveUser(userEntity);
        if (res) return new ResponseEntity<>(true, HttpStatus.CREATED);
        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }

    @GetMapping("/all-users")
    public List<UserEntity> getAllUsers() {
        return userDetailsService.getAllUsers();
    }

    @GetMapping("/user-details/{userId}")
    public Optional<UserEntity> getUserDetails(@PathVariable String userId) {
        return userDetailsService.getUserDetails(userId);
    }
}
