package com.example.restApi.controller;

import com.example.restApi.entity.MessageEntity;
import com.example.restApi.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class MessageController {
    @Autowired
    private MessageService messageService;

    @MessageMapping("/message")
    public String sendMessage(@Payload MessageEntity messageEntity, SimpMessagingTemplate messagingTemplate) {
        messageService.saveMessage(messageEntity);
        messagingTemplate.convertAndSend("/personalChat/" + messageEntity.getReceiverId() + "/" + messageEntity.getSenderId(), messageEntity);
        return "Called";
    }
}
