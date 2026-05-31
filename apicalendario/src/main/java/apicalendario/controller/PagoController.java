package apicalendario.controller;

import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.preapproval.PreApprovalAutoRecurringCreateRequest;
import com.mercadopago.client.preapproval.PreapprovalClient;
import com.mercadopago.client.preapproval.PreapprovalCreateRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.resources.preapproval.Preapproval;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/pagos")
public class PagoController {

    @Value("${mercadopago.access-token}")
    private String accessToken;

    @PostConstruct
    public void init() {
        MercadoPagoConfig.setAccessToken(accessToken);
    }

    @PostMapping("/crear-suscripcion")
    public ResponseEntity<Map<String, String>> crearSuscripcion(@RequestParam String email) {
        try {
            PreapprovalClient client = new PreapprovalClient();

            // 🔥 TRUCO PARA PRUEBAS: Evitar el error de "comprarse a sí mismo"
            String emailComprador = email;
            if (email.contains("vice.pachecoa")) {
                // Le pasamos un correo dummy a Mercado Pago para que nos deje generar el link
                emailComprador = "cliente_prueba_999@test.com";
            }

            // Usamos la clase correcta con "Create"
            PreApprovalAutoRecurringCreateRequest autoRecurring = PreApprovalAutoRecurringCreateRequest.builder()
                    .frequency(1)
                    .frequencyType("months")
                    .transactionAmount(new BigDecimal("3000"))
                    .currencyId("CLP")
                    .build();

            PreapprovalCreateRequest request = PreapprovalCreateRequest.builder()
                    .payerEmail(emailComprador)
                    .backUrl("https://vix-flow.com/perfil?pago=exitoso")
                    .reason("Suscripción Premium Vix-Flow")
                    .autoRecurring(autoRecurring)
                    .status("pending")
                    .build();

            Preapproval preapproval = client.create(request);

            Map<String, String> responseData = new HashMap<>();
            responseData.put("url", preapproval.getInitPoint());

            return ResponseEntity.ok(responseData);

        } catch (MPApiException apiException) {
            System.out.println("❌ MERCADO PAGO RECHAZÓ LA PETICIÓN. Motivo exacto: ");
            System.out.println(apiException.getApiResponse().getContent());
            return ResponseEntity.internalServerError().build();

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> recibirWebhook(@RequestBody Map<String, Object> payload) {
        System.out.println("🔔 Notificación recibida de Mercado Pago: " + payload);
        return ResponseEntity.ok("Recibido");
    }
}