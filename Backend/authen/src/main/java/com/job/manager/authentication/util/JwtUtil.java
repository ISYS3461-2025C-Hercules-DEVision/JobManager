package com.job.manager.authentication.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Component;

import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtUtil {

    private static final String PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\n" +
            "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCj6ZwexcZaEDjY\n" +
            "/O+IYIUuCfaE4GUON7FtyUx0bhqFDlMIP9S//04QG7ZDNSCg1Bz1X0HPqbVvZawQ\n" +
            "Z76YiVknB5VJKnBPl+4LiYU/+SRfTH92Df4k4nPC33JyPtNCggrqvE7t1jLL9PCT\n" +
            "Tr6v7PFh/L3UgRzDMvdBP+sfSONuVFDZ3d7bCRG8n+q0g95Pj+kxeoMZgULI6ZOg\n" +
            "vfmQKD7MZIC4nT+WpSaReMKP4uVQlS3CtTDOW2VfzpIX0izGKEpDhLWOh+0WCPmA\n" +
            "VeIc37V/Dhviv7hGwHzbDb6HsLjRmqDTA7vHkzfCZ/VOVaaUoN6K7+J3SRfyYJL2\n" +
            "cwTBtnXDAgMBAAECggEAUFG+8M1VHvjoAlwfPCKf4Cl9pSsYGdlsljGXx03UrPKR\n" +
            "+W7d359JL1eE/nXgIS8PaaVd6FZu08FsiTVtDe3vw9JRcuLa2gXG3dxrcSeyjQg9\n" +
            "RSoiKQzWUN2RhS4H84UpuFDCFIVrqsnBwU1K34Yp2iwxERqbb4Nf6ZdarZ/X4k2h\n" +
            "Vw+r1km9uYaStf7l6f0Yz2qpOCejCWr0WSQj5MA0R376HtaRaZkI+tHfQGio9qHY\n" +
            "TSs6ULrR6d7pv185/B6pETMilFWfnRcldKSeo4dFe/P0emgL8G1rSKCg0iEHCuP9\n" +
            "TjBu92OiQUgj04Odz6cVm3woBjY8Kmj70kQQJvO+4QKBgQDdp7ZAn3zcgnf+cWju\n" +
            "IYsxDBAfLhMPEi4ZyX9Qh5zKBhl82R3+Q1udcx+aT1aWklASaKUj0uCVIgoa+HvG\n" +
            "UCQDe/1AsfT5Uv/c/6+WEegMWbV5kSbwurCpYzXmw7t8anuBmcEBpDdejK3WvZgB\n" +
            "jAhfbGwC5hMrHiawSVuifuk82QKBgQC9T3NHAfbWARfFQrGePZY+FLYZeW4EYs6w\n" +
            "ejZYezEItsUw4dXTI/ruV9Ups2M+LxPd5gw6fA14RvGzALgCeG9XcPCis9p9YL1c\n" +
            "X2hMthYm6XvloMhRwUT3kCxUi/+fH7ATdMdZcarBFJwfFA2vVrXSbw/j8txWVgK0\n" +
            "RX5LOxoV+wKBgQDEQHwDl7KL4xCvPmazgQumr5GOqdLCI0yiFGAfQxM1ZFUoz2vY\n" +
            "9nalX4r5q4l047L1uaWNpGaoZG0iGCQvIEHiu+MtZuMJ5c0ZNWGXs98LIFqnejdK\n" +
            "KWHFeEv/OApGTFlyFFppQ6aqllBMs61koUHAi1TO9DrAkH+c0jbKFygXcQKBgAFS\n" +
            "rtGON/Vi6JGeV7NtZsFkT6l56cTqE9uz3vFbWwpejJ481cu18qj7wCecc1MZ7R+d\n" +
            "3fQCre1rQYEoviB2SwDnbycT7rD1nh0pJYdztk/rTcxbBUtc+Ghqf4TPvaeVBxv7\n" +
            "svDzFGhpBnZJI5dYGckwsYG8TsHjs/0ihzFrZlFFAoGACruVrf5KkvdrjRSQbETW\n" +
            "lPWat5xm7MMHSwkBjzFz9h+LVQmAxHlXEG/azBywd1BmEfvh6wnwPv18E17BmKJw\n" +
            "U2wcVBwS8T7qB9BTUiWEPuNpTFCfDPyYp3fgNi0kRNct007OdtNc0M79MW+oeTCB\n" +
            "2yyICB/ZFzwJOwQwqJp45q8=\n" +
            "-----END PRIVATE KEY-----\n";

    private final PrivateKey privateKey;
    private static final String KONG_CONSUMER = "global-key";

    public JwtUtil() throws Exception {
        this.privateKey = loadPrivateKey(PRIVATE_KEY);
    }
    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuer(KONG_CONSUMER)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // 10 hours
                .signWith(privateKey, SignatureAlgorithm.RS256)
                .compact();
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