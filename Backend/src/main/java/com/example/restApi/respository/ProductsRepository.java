package com.example.restApi.respository;

import com.example.restApi.entity.ProductsEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Component;

@Component
public interface ProductsRepository extends MongoRepository<ProductsEntity, Long> {
}
