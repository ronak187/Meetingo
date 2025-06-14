package com.example.restApi.entity;

import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "products")
@Setter
@Getter
public class ProductsEntity {
    @NonNull
    @Id
    private Long id;
    private Double price;
    @NonNull
    private String title;
    private String description;
}
