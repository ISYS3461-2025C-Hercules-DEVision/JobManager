package com.example.team_manager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;


@SpringBootApplication
public class TeamManagerApplication {

	public static void main(String[] args) {
		SpringApplication.run(TeamManagerApplication.class, args);
	}

	@RestController
    static class PingController {

        @GetMapping("/ping")
        public String ping() {
            return "OK";
        }
    }
}
