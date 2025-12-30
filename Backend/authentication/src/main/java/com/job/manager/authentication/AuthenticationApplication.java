package com.job.manager.authentication;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;

@SpringBootApplication
public class AuthenticationApplication {


	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.configure()
                .ignoreIfMissing()
                .load();

        dotenv.entries().forEach(e ->
            System.setProperty(e.getKey(), e.getValue())
        );
		
		SpringApplication.run(AuthenticationApplication.class, args);
	}

	@Bean
	public CommandLineRunner commandLineRunner(Environment environment) {
		return args -> {
			System.out.println("--- Spring Environment Variables ---");

			// Access a specific property from application.properties or OS env variable
			String kafkaBootstrapServer = environment.getProperty("spring.kafka.bootstrap-servers");
			System.out.println("Kafka bootstrap server Name: " + kafkaBootstrapServer);
			System.out.println("----------------------------------");
		};
	}

}
