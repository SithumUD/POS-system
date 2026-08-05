package com.sithumud.pos_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class PosBackendApplication {
	public static void main(String[] args) {
		SpringApplication.run(PosBackendApplication.class, args);
	}
}