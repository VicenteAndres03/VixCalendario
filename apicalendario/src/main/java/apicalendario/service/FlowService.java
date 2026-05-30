package apicalendario.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.TreeMap;

@Service
public class FlowService {

    @Value("${flow.api-key}")
    private String apiKey;

    @Value("${flow.secret-key}")
    private String secretKey;

    @Value("${flow.environment:SANDBOX}")
    private String environment;

    private final String API_URL_SANDBOX = "https://sandbox.flow.cl/api";
    private final String API_URL_LIVE = "https://www.flow.cl/api";

    // 💵 TASA DE CAMBIO: 1 USD = 950 CLP (Puedes ajustar este valor cuando quieras)
    private final int TASA_CAMBIO_USD_CLP = 950;

    // Ahora recibimos el monto en USD como parámetro
    public String crearOrdenDePago(String emailUsuario, String ordenId, int montoUsd) {
        String baseUrl = environment.equals("SANDBOX") ? API_URL_SANDBOX : API_URL_LIVE;
        String endpoint = baseUrl + "/payment/create";

        // 🔄 CONVERSIÓN MÁGICA: De USD a CLP para que Flow lo acepte
        int montoClp = montoUsd * TASA_CAMBIO_USD_CLP;

        // TreeMap ordena automáticamente los parámetros alfabéticamente (Requisito de
        // Flow)
        Map<String, String> params = new TreeMap<>();
        params.put("apiKey", apiKey);
        params.put("commerceOrder", ordenId);
        params.put("subject", "Plan Premium VixCalendario (" + montoUsd + " USD)");
        params.put("currency", "CLP"); // Siempre debe ser CLP para Flow
        params.put("amount", String.valueOf(montoClp)); // Enviamos los pesos chilenos convertidos
        params.put("email", emailUsuario);
        params.put("paymentMethod", "9"); // 9 = Mostrar todos los medios (Webpay, Mach, etc)
        params.put("urlConfirmation", "http://localhost:8080/api/pagos/webhook");
        params.put("urlReturn", "http://localhost:5173/perfil?pago=exitoso");

        // 1. Concatenar parámetros para firmar
        String stringToSign = params.entrySet().stream()
                .map(e -> e.getKey() + "=" + e.getValue())
                .reduce((p1, p2) -> p1 + "&" + p2)
                .orElse("");

        // 2. Generar Firma HMAC SHA256
        String signature = generateHmacSHA256(stringToSign, secretKey);
        params.put("s", signature);

        // 3. Hacer la petición POST a Flow
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        params.forEach(map::add);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(endpoint, request, Map.class);
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("url") && body.containsKey("token")) {
                return body.get("url") + "?token=" + body.get("token");
            }
        } catch (Exception e) {
            System.err.println("Error comunicándose con Flow: " + e.getMessage());
            throw new RuntimeException("No se pudo generar el pago");
        }
        return null;
    }

    // Método criptográfico exigido por Flow
    private String generateHmacSHA256(String data, String key) {
        try {
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            byte[] hash = sha256_HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1)
                    hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error generando firma HMAC", e);
        }
    }
}