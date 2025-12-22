package com.job.manager.subscription.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.stereotype.Component;

import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtUtil {

    private static final String PUBLIC_KEY = "-----BEGIN PUBLIC KEY-----\n" +
            "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAo+mcHsXGWhA42PzviGCF\n" +
            "Lgn2hOBlDjexbclMdG4ahQ5TCD/Uv/9OEBu2QzUgoNQc9V9Bz6m1b2WsEGe+mIlZ\n" +
            "JweVSSpwT5fuC4mFP/kkX0x/dg3+JOJzwt9ycj7TQoIK6rxO7dYyy/Twk06+r+zx\n" +
            "Yfy91IEcwzL3QT/rH0jjblRQ2d3e2wkRvJ/qtIPeT4/pMXqDGYFCyOmToL35kCg+\n" +
            "zGSAuJ0/lqUmkXjCj+LlUJUtwrUwzltlX86SF9IsxihKQ4S1joftFgj5gFXiHN+1\n" +
            "fw4b4r+4RsB82w2+h7C40Zqg0wO7x5M3wmf1TlWmlKDeiu/id0kX8mCS9nMEwbZ1\n" +
            "wwIDAQAB\n" +
            "-----END PUBLIC KEY-----\n";

    private final PublicKey publicKey;

    public JwtUtil() throws Exception {
        this.publicKey = loadPublicKey(PUBLIC_KEY);
    }

    public Claims validateToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(publicKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String getUsernameFromToken(String token) {
        return validateToken(token).getSubject();
    }

    public String getUserIdFromToken(String token) {
        return validateToken(token).get("id", String.class);
    }

    public boolean isTokenExpired(String token) {
        return validateToken(token).getExpiration().before(new Date());
    }

    private PublicKey loadPublicKey(String key) throws Exception {
        String publicKeyPEM = key.replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s", "");
        byte[] keyBytes = Base64.getDecoder().decode(publicKeyPEM);
        X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        return keyFactory.generatePublic(spec);
    }
}
