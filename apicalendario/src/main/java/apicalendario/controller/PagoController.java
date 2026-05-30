package apicalendario.controller;

import apicalendario.service.FlowService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/pagos")
@AllArgsConstructor
public class PagoController {

    private final FlowService flowService;

    // 1. React llamará aquí cuando el usuario haga clic en "Ser Premium"
    @PostMapping("/generar-link")
    public ResponseEntity<String> solicitarPagoPremium() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        // Generamos un ID de orden único (Ej: VIX-4A2B9C10)
        String ordenId = "VIX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // 💵 Definimos el precio de la suscripción en Dólares (USD)
        int precioUsd = 3;

        // El servicio se encarga de convertirlo a CLP
        String urlPago = flowService.crearOrdenDePago(email, ordenId, precioUsd);

        return ResponseEntity.ok(urlPago);
    }

    // 2. FLOW llamará aquí por detrás cuando el pago sea exitoso (Webhook)
    @PostMapping("/webhook")
    public ResponseEntity<String> confirmacionPago(@RequestParam("token") String token) {
        System.out.println("⚠️ ALERTA: Flow dice que se procesó el pago con token: " + token);

        // Próximo paso: Validar con Flow el pago y activar el plan Premium en la Base
        // de Datos

        return ResponseEntity.ok("OK");
    }
}