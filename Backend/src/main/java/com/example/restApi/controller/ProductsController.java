package com.example.restApi.controller;

import com.example.restApi.entity.ProductsEntity;
import com.example.restApi.service.ProductsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000/")
@RestController
@RequestMapping("/products")
public class ProductsController {

    @Autowired
    ProductsService productsService;

    @GetMapping("/health")
    public String health() {
        return "OK";
    }

    @PostMapping("/add-product")
    public boolean addProduct(@RequestBody ProductsEntity product) {
        return productsService.saveProduct(product);
    }

    @GetMapping("/get-products")
    public List<ProductsEntity> getProducts() {
        return productsService.getProducts();
    }

    @GetMapping("/get-product/{productId}")
    public Optional<ProductsEntity> getProduct(@PathVariable Long productId) {
        return productsService.getProduct(productId);
    }
}
