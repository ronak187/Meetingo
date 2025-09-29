package com.example.restApi.service;

import com.example.restApi.entity.ProductsEntity;
import com.example.restApi.respository.ProductsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class ProductsService {
    @Autowired
    ProductsRepository productsRepository;

    public Boolean saveProduct(ProductsEntity product) {
        try {
            productsRepository.save(product);
            return true;
        } catch (Exception e) {
            return false;
        }
    }


    public List<ProductsEntity> getProducts() {
        return productsRepository.findAll();
    }

    public Optional<ProductsEntity> getProduct(Long id) {
        return productsRepository.findById(id);
    }
}
