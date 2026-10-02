package com.devstream;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.devstream.identity")
@EnableMongoRepositories(basePackages = "com.devstream.content")
public class DevStreamApplication {

    public static void main(String[] args) {
        SpringApplication.run(DevStreamApplication.class, args);
    }
}
