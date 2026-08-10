package com.sithumud.pos_backend.common.rabbitmq;

import com.sithumud.pos_backend.common.rabbitmq.dto.EmailEvent;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailConsumer {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from-email}")
    private String fromEmail;

    @Value("${app.mail.from-name}")
    private String fromName;

    @RabbitListener(queues = RabbitMQConfig.EMAIL_QUEUE)
    public void consumeEmailEvent(EmailEvent emailEvent) {
        log.info("Received email event from RabbitMQ for {}", emailEvent.getToEmail());
        try {
            sendHtml(emailEvent.getToEmail(), emailEvent.getSubject(), emailEvent.getHtmlContent());
        } catch (Exception e) {
            log.error("Failed to process email event for {}", emailEvent.getToEmail(), e);
            // Re-throwing could trigger RabbitMQ retry mechanisms if configured (DLQ, etc.)
            // For now, we just log the failure.
        }
    }

    private void sendHtml(String to, String subject, String html) throws MessagingException, UnsupportedEncodingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromEmail, fromName);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(html, true);
        mailSender.send(message);
        log.info("Email sent successfully via RabbitMQ: subject='{}' to='{}'", subject, to);
    }
}
