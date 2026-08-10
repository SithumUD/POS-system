package com.sithumud.pos_backend.common.email;

import com.sithumud.pos_backend.auth.entity.User;
import com.sithumud.pos_backend.tenant.entity.PlanType;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import com.sithumud.pos_backend.common.rabbitmq.RabbitMQProducer;
import com.sithumud.pos_backend.common.rabbitmq.dto.EmailEvent;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private static final String BRAND_COLOR = "#6366F1";
    private static final String BRAND_NAME  = "NexPOS";
    private static final String WHATSAPP    = "+94 70 257 5370";
    private static final String CONTACT_EMAIL = "sithumudayangaofficial@gmail.com";

    private final JavaMailSender mailSender; // Keeping for potential synchronous use
    private final RabbitMQProducer rabbitMQProducer;

    @Value("${app.mail.from-email}")
    private String fromEmail;

    @Value("${app.mail.from-name}")
    private String fromName;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    // ─── Team Member Invitation ───────────────────────────────────────────────

    public void sendInvitationEmail(User user, String token) {
        log.info("Sending team invitation email to {}", user.getEmail());
        try {
            String acceptUrl = frontendUrl + "/accept-invite?token=" + token;
            String branch    = user.getBranch() != null ? user.getBranch().getName() : "All Branches (Global Access)";

            String html = """
                    <html><body style="font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;padding:0;margin:0;">
                    <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.08);overflow:hidden;">
                      <div style="background:%s;padding:32px 40px;">
                        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">%s</h1>
                        <p style="color:rgba(255,255,255,.8);margin:6px 0 0;">You've been invited to join the team</p>
                      </div>
                      <div style="padding:40px;">
                        <p style="color:#1e293b;font-size:16px;">Hi <strong>%s</strong>,</p>
                        <p style="color:#475569;line-height:1.6;">You have been invited to join <strong>%s</strong> POS system.</p>
                        <table style="margin:16px 0;width:100%%;border-collapse:collapse;">
                          <tr><td style="padding:8px 0;color:#64748b;">Role</td><td style="color:#1e293b;font-weight:600;">%s</td></tr>
                          <tr><td style="padding:8px 0;color:#64748b;">Branch</td><td style="color:#1e293b;font-weight:600;">%s</td></tr>
                        </table>
                        <p style="color:#475569;margin-bottom:24px;">Click the button below to set your password and activate your account. This link expires in <strong>24 hours</strong>.</p>
                        <a href="%s" style="display:inline-block;padding:14px 28px;background:%s;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;">Accept Invitation</a>
                        <p style="margin-top:32px;font-size:12px;color:#94a3b8;">If you didn't expect this invitation, please ignore this email.</p>
                      </div>
                    </div>
                    </body></html>
                    """.formatted(
                    BRAND_COLOR, BRAND_NAME,
                    user.getName(), BRAND_NAME,
                    user.getRole().name(), branch,
                    acceptUrl, BRAND_COLOR);

            EmailEvent event = EmailEvent.builder()
                    .toEmail(user.getEmail())
                    .subject("You've been invited to join " + BRAND_NAME)
                    .htmlContent(html)
                    .build();
            rabbitMQProducer.sendEmail(event);
        } catch (Exception e) {
            log.error("Failed to send invitation email to {}", user.getEmail(), e);
        }
    }

    // ─── Business Signup Invitation ───────────────────────────────────────────

    public void sendBusinessInvitation(String toEmail, String token, PlanType plan) {
        log.info("Sending business signup invitation to {} (plan={})", toEmail, plan);
        try {
            String signupUrl = frontendUrl + "/signup?token=" + token;
            String planLabel  = planLabel(plan);

            String html = """
                    <html><body style="font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;padding:0;margin:0;">
                    <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.08);overflow:hidden;">
                      <div style="background:linear-gradient(135deg,%s 0%%,#8b5cf6 100%%);padding:40px;">
                        <h1 style="color:#fff;margin:0;font-size:28px;font-weight:800;">%s</h1>
                        <p style="color:rgba(255,255,255,.85);margin:8px 0 0;font-size:16px;">Your business has been invited to join</p>
                      </div>
                      <div style="padding:40px;">
                        <p style="color:#1e293b;font-size:16px;">Hello,</p>
                        <p style="color:#475569;line-height:1.7;">You have been invited to set up your <strong>%s</strong> account for your business. Your invitation includes the <strong>%s plan</strong>.</p>

                        <div style="background:#f1f5f9;border-radius:12px;padding:20px;margin:24px 0;">
                          <p style="margin:0 0 8px;font-weight:700;color:#1e293b;">Your Plan: %s</p>
                          <p style="margin:4px 0;color:#64748b;font-size:14px;">✓ Multiple users, branches & product catalogue included</p>
                          <p style="margin:4px 0;color:#64748b;font-size:14px;">✓ Full POS, inventory, analytics & purchasing modules</p>
                          <p style="margin:4px 0;color:#64748b;font-size:14px;">✓ Real-time reporting and low-stock alerts</p>
                        </div>

                        <p style="color:#475569;">Click the button below to complete your business signup. This link expires in <strong>72 hours</strong>.</p>
                        <a href="%s" style="display:inline-block;padding:16px 32px;background:%s;color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:16px;margin:8px 0 24px;">Complete Signup →</a>

                        <div style="border-top:1px solid #e2e8f0;padding-top:24px;margin-top:8px;">
                          <p style="color:#64748b;font-size:14px;margin:0 0 8px;"><strong>After signup:</strong></p>
                          <p style="color:#64748b;font-size:14px;line-height:1.6;">Please make your payment manually and send the receipt via WhatsApp to <strong>%s</strong>. Your account will be activated within 24 hours of payment confirmation.</p>
                        </div>
                        <p style="margin-top:24px;font-size:12px;color:#94a3b8;">Questions? Email us at <a href="mailto:%s" style="color:%s;">%s</a></p>
                      </div>
                    </div>
                    </body></html>
                    """.formatted(
                    BRAND_COLOR, BRAND_NAME,
                    BRAND_NAME, planLabel,
                    planLabel,
                    signupUrl, BRAND_COLOR,
                    WHATSAPP,
                    CONTACT_EMAIL, BRAND_COLOR, CONTACT_EMAIL);

            EmailEvent event = EmailEvent.builder()
                    .toEmail(toEmail)
                    .subject("Your " + BRAND_NAME + " Business Invitation")
                    .htmlContent(html)
                    .build();
            rabbitMQProducer.sendEmail(event);
        } catch (Exception e) {
            log.error("Failed to send business invitation email to {}", toEmail, e);
        }
    }

    // ─── Tenant Approval Notification ────────────────────────────────────────

    public void sendTenantApprovalNotification(String toEmail, String adminName, String businessName) {
        log.info("Sending approval notification to {} (business={})", toEmail, businessName);
        try {
            String loginUrl = frontendUrl + "/login";

            String html = """
                    <html><body style="font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;padding:0;margin:0;">
                    <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.08);overflow:hidden;">
                      <div style="background:linear-gradient(135deg,#10b981 0%%,#059669 100%%);padding:40px;text-align:center;">
                        <div style="font-size:48px;">🎉</div>
                        <h1 style="color:#fff;margin:12px 0 0;font-size:24px;font-weight:800;">You're Approved!</h1>
                        <p style="color:rgba(255,255,255,.85);margin:8px 0 0;">Your %s account is now active</p>
                      </div>
                      <div style="padding:40px;">
                        <p style="color:#1e293b;font-size:16px;">Hi <strong>%s</strong>,</p>
                        <p style="color:#475569;line-height:1.7;">Great news! We have confirmed your payment and activated your <strong>%s</strong> account on <strong>%s</strong>. You can now log in and start using the full system.</p>
                        <a href="%s" style="display:inline-block;padding:16px 32px;background:#10b981;color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:16px;margin:24px 0;">Log In Now →</a>
                        <div style="border-top:1px solid #e2e8f0;padding-top:24px;margin-top:8px;">
                          <p style="color:#64748b;font-size:14px;">Need help getting started? Contact us on WhatsApp: <strong>%s</strong></p>
                          <p style="color:#64748b;font-size:14px;">Or email: <a href="mailto:%s" style="color:%s;">%s</a></p>
                        </div>
                      </div>
                    </div>
                    </body></html>
                    """.formatted(
                    BRAND_NAME,
                    adminName, BRAND_NAME, businessName,
                    loginUrl,
                    WHATSAPP, CONTACT_EMAIL, BRAND_COLOR, CONTACT_EMAIL);

            EmailEvent event = EmailEvent.builder()
                    .toEmail(toEmail)
                    .subject("✅ Your " + BRAND_NAME + " Account is Now Active!")
                    .htmlContent(html)
                    .build();
            rabbitMQProducer.sendEmail(event);
        } catch (Exception e) {
            log.error("Failed to send approval notification to {}", toEmail, e);
        }
    }

    // ─── Helper ────────────────────────────────────────────────────────────────

    private void sendHtml(String to, String subject, String html) throws MessagingException, java.io.UnsupportedEncodingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromEmail, fromName);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(html, true);
        mailSender.send(message);
        log.info("Email sent: subject='{}' to='{}'", subject, to);
    }

    private String planLabel(PlanType plan) {
        return switch (plan) {
            case STARTER      -> "Starter";
            case BUSINESS     -> "Business";
            case PROFESSIONAL -> "Professional";
            case ENTERPRISE   -> "Enterprise";
        };
    }
}
