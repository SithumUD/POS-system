package com.sithumud.pos_backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.RabbitMQContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Full application context smoke test.
 * Requires Docker Desktop to be running.
 * Automatically skipped when Docker is unavailable (e.g. CI without Docker, or local dev without Docker running).
 */
@SpringBootTest(
    properties = {
        // Exclude Redis from the smoke test context; no Redis container is spun up here
        "spring.autoconfigure.exclude=" +
            "org.springframework.boot.data.redis.autoconfigure.RedisAutoConfiguration," +
            "org.springframework.boot.data.redis.autoconfigure.RedisReactiveAutoConfiguration," +
            "org.springframework.boot.data.redis.autoconfigure.RedisRepositoriesAutoConfiguration"
    }
)
@Testcontainers(disabledWithoutDocker = true)
class PosBackendApplicationTests {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17");

    @Container
    @ServiceConnection
    static RabbitMQContainer rabbitMQ = new RabbitMQContainer("rabbitmq:3-management-alpine");

    @Test
    void contextLoads() {
        // Verifies the full Spring application context starts correctly
    }

}
