package apicalendario.controller;

import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.preapproval.PreApprovalAutoRecurringCreateRequest;
import com.mercadopago.client.preapproval.PreapprovalClient;
import com.mercadopago.client.preapproval.PreapprovalCreateRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.resources.preapproval.Preapproval;
import apicalendario.service.PagoService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
public class PagoController {

    @Value("${mercadopago.access-token}")
    private String accessToken;

    private final PagoService pagoService;

    @PostConstruct
    public void init() {
        MercadoPagoConfig.setAccessToken(accessToken);
    }

    @PostMapping("/crear-suscripcion")
    public ResponseEntity<Map<String, String>> crearSuscripcion(@RequestParam String email) {
        try {
            PreapprovalClient client = new PreapprovalClient();

            PreApprovalAutoRecurringCreateRequest autoRecurring = PreApprovalAutoRecurringCreateRequest.builder()
                    .frequency(1)
                    .frequencyType("months")
                    .transactionAmount(new BigDecimal("3000"))
                    .currencyId("CLP")
                    .build();

            PreapprovalCreateRequest request = PreapprovalCreateRequest.builder()
                    .payerEmail(email)
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
            System.out.println("❌ Error Mercado Pago: " + apiException.getApiResponse().getContent());
            return ResponseEntity.internalServerError().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> recibirWebhook(
            @RequestBody(required = false) Map<String, Object> payload,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String id) {
        try {
            System.out.println("🔔 Webhook recibido - type: " + type + " - id: " + id);

            String dataId = id;
            if (dataId == null && payload != null && payload.get("data") != null) {
                Map<String, Object> data = (Map<String, Object>) payload.get("data");
                dataId = data.get("id").toString();
            }

            String tipo = type;
            if (tipo == null && payload != null) {
                tipo = (String) payload.get("type");
            }

            if ("subscription_preapproval".equals(tipo) && dataId != null) {
                pagoService.procesarEventoSuscripcion(dataId);
            }

            return ResponseEntity.ok("Recibido");
        } catch (Exception e) {
            System.out.println("❌ Error en webhook: " + e.getMessage());
            return ResponseEntity.ok("Recibido");
        }
    }
}