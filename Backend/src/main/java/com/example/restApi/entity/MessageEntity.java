package com.example.restApi.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Document(collection = "messages")
@CompoundIndexes({
        @CompoundIndex(
                name = "sender_receiver_index", def = "{'senderId' : 1, 'receiverId' : 1}"
        ),
        @CompoundIndex(
                name = "receiver_sender_index", def = "{'receiverId' : 1, 'senderId' : 1}"
        )
})
public class MessageEntity {
    @Id
    private String messageId;

    private String message;
    private String senderId;
    private String receiverId;
    private LocalDateTime createdDateTime;

    public void setRandomMessageId() {
        messageId = UUID.randomUUID().toString();
    }
}
