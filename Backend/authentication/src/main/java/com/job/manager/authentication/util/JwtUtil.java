package com.job.manager.authentication.util;

import com.job.manager.authentication.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.private-key}")
    private String privateKeyBase64;

    @Value("${jwt.expiration-hours:10}")
    private int expirationHours;

    private PrivateKey privateKey;
    private static final String KONG_CONSUMER = "global-key";

    @PostConstruct
    public void init() throws Exception {
        // Decode Base64 private key from environment
        String decodedKey = new String(Base64.getDecoder().decode(privateKeyBase64));
        this.privateKey = loadPrivateKey(decodedKey);
    }

    public String generateToken(User user) {
        long expirationMs = System.currentTimeMillis() + (1000L * 60 * 60 * expirationHours);
        return Jwts.builder()
                .setSubject(user.getUsername())
                .setIssuer(KONG_CONSUMER)
                .claim("id", user.getId())
                .setIssuedAt(new Date())
                .setExpiration(new Date(expirationMs))
                .signWith(privateKey, SignatureAlgorithm.RS256)
                .compact();
    }

    public String extractUserId(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(privateKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.get("id", String.class);
    }

    public String extractUsername(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(privateKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    public long getExpirationTime(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(privateKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getExpiration().getTime();
    }

    private PrivateKey loadPrivateKey(String key) throws Exception {
        String privateKeyPEM = key.replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s", "");
        byte[] keyBytes = Base64.getDecoder().decode(privateKeyPEM);
        PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        return keyFactory.generatePrivate(spec);
    }
}