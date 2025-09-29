package com.example.restApi.respository;

import com.example.restApi.entity.MessageEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public interface MessagesRepository extends MongoRepository<MessageEntity, String> {
    @Query("{'$or':[ {'senderId': ?0, 'receiverId': ?1}, {'senderId': ?1, 'receiverId': ?0} ]}")
    Optional<List<MessageEntity>> findConversation(String user1, String user2);
}
