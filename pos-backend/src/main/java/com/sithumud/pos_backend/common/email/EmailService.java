package com.sithumud.pos_backend.common.email;

import com.sithumud.pos_backend.auth.entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from-email}")
    private String fromEmail;

    @Value("${app.mail.from-name}")
    private String fromName;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Async
    public void sendInvitationEmail(User user, String token) {
        log.info("Sending invitation email to {}", user.getEmail());
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(user.getEmail());
            helper.setSubject("Invitation to join RetailOS POS");

            String acceptUrl = frontendUrl + "/accept-invite?token=" + token;
            String branchName = user.getBranch() != null ? user.getBranch().getName() : "All Branches (Global Access)";

            String htmlContent = """
                    <html>
                    <body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #4F46E5;">Welcome to RetailOS POS!</h2>
                        <p>Hi %s,</p>
                        <p>You have been invited to join the RetailOS POS system.</p>
                        <p><strong>Role:</strong> %s<br/>
                           <strong>Assigned Branch:</strong> %s</p>
                        <p>Please click the button below to set your password and activate your account. This link will expire in 24 hours.</p>
                        <a href="%s" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px;">Accept Invitation</a>
                        <p style="margin-top: 30px; font-size: 12px; color: #888;">If you didn't expect this invitation, please ignore this email.</p>
                    </body>
                    </html>
                    """.formatted(user.getName(), user.getRole().name(), branchName, acceptUrl);

            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Invitation email sent successfully to {}", user.getEmail());

        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("Failed to send invitation email to {}", user.getEmail(), e);
        }
    }
}
