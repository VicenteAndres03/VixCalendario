package apicalendario.service;

import apicalendario.model.EstadoSuscripcion;
import apicalendario.repository.UsuarioRepository;
import com.mercadopago.client.preapproval.PreapprovalClient;
import com.mercadopago.resources.preapproval.Preapproval;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class PagoService {

    private final UsuarioRepository usuarioRepo;

    public void procesarEventoSuscripcion(String suscripcionId) {
        try {
            PreapprovalClient client = new PreapprovalClient();
            Preapproval preapproval = client.get(suscripcionId);

            String estado = preapproval.getStatus();
            String emailPagador = preapproval.getPayerEmail();

            System.out.println("🔔 Webhook recibido - Estado: " + estado + " - Email: " + emailPagador);

            usuarioRepo.findByEmail(emailPagador).ifPresent(usuario -> {
                if ("authorized".equals(estado)) {
                    usuario.setEstadoSuscripcion(EstadoSuscripcion.ACTIVO);
                    usuario.setMercadoPagoSuscripcionId(suscripcionId);
                    usuario.setFechaFinPremium(java.time.LocalDate.now().plusMonths(1));
                    System.out.println("✅ Usuario activado: " + emailPagador);
                } else if ("cancelled".equals(estado) ||
                        "paused".equals(estado)) {
                    usuario.setEstadoSuscripcion(EstadoSuscripcion.INACTIVO);
                    usuario.setFechaFinPremium(null);
                    System.out.println("❌ Usuario desactivado: " + emailPagador);
                }
                usuarioRepo.save(usuario);
            });

        } catch (Exception e) {
            System.out.println("❌ Error procesando webhook: " + e.getMessage());
        }
    }
}