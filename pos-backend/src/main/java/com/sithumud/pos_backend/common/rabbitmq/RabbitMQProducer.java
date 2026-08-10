package com.sithumud.pos_backend.common.rabbitmq;

import com.sithumud.pos_backend.common.rabbitmq.dto.EmailEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class RabbitMQProducer {

    private final RabbitTemplate rabbitTemplate;

    public void sendEmail(EmailEvent emailEvent) {
        log.info("Publishing email event to RabbitMQ for {}", emailEvent.getToEmail());
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EMAIL_EXCHANGE,
                RabbitMQConfig.EMAIL_ROUTING_KEY,
                emailEvent
        );
    }
}
