package com.job.manager.authentication.util;

import java.security.SecureRandom;

public class OtpGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();

    public static String generate() {
        return String.valueOf(100000 + RANDOM.nextInt(900000));
    }
}

