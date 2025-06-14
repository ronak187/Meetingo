package com.example.restApi.service;

import com.example.restApi.entity.MessageEntity;
import com.example.restApi.entity.UserEntity;
import jakarta.servlet.http.HttpSession;
import com.example.restApi.respository.MessagesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class MessageService {
    @Autowired
    private MessagesRepository messagesRepository;

    Optional<List<MessageEntity>> findConversation(String senderId, String receiverId) {
        return messagesRepository.findConversation(senderId, receiverId);
    }

    public boolean saveMessage(MessageEntity messageEntity) {
        try {
            messagesRepository.save(messageEntity);
        } catch (Exception e) {
            return false;
        }

        return true;
    }
}
