package com.example.restApi.entity;


import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Document(collection = "userDetails")
public class UserEntity {
    @Id
    private String userId;
    private String email;
    private String username, password;

    UserEntity(String username, String email, String password) {
        userId = UUID.randomUUID().toString();
        this.username = username;
        this.email = email;
        this.password = password;
    }

    @Override
    public String toString() {
        return "[userId: " + userId + ", username: " + username + ", email: " + email + ", password: " + password + "]";
    }

    @DBRef
    List<ProductsEntity> productsEntityList = new ArrayList<>();
}