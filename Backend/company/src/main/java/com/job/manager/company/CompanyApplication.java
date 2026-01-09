package com.job.manager.company;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.job.manager.company")
public class CompanyApplication {

	public static void main(String[] args) {
		// Load .env file if it exists
		Dotenv dotenv = Dotenv.configure()
				.ignoreIfMissing()
				.load();

		// Set environment variables from .env file
		dotenv.entries().forEach(e ->
				System.setProperty(e.getKey(), e.getValue())
		);

		SpringApplication.run(CompanyApplication.class, args);
	}

}
