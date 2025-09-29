package com.example.restApi.service;

import com.example.restApi.entity.UserEntity;
import com.example.restApi.respository.UserDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class UserDetailsService {
    @Autowired
    UserDetailsRepository userDetailsRepository;

    public boolean saveUser(UserEntity userEntity) {
        try {
            userDetailsRepository.save(userEntity);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public List<UserEntity> getAllUsers() {
        return userDetailsRepository.findAll();
    }

    public Optional<UserEntity> getUserDetails(String id) {
        return userDetailsRepository.findById(id);
    }

    public Optional<UserEntity> findUser(String email) {
        return userDetailsRepository.findByEmail(email);
    }
}
