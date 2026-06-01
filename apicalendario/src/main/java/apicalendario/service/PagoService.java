package apicalendario.service;

import apicalendario.model.EstadoSuscripcion;
import apicalendario.repository.UsuarioRepository;
import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.preapproval.PreapprovalClient;
import com.mercadopago.resources.preapproval.Preapproval;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class PagoService {

    private final UsuarioRepository usuarioRepo;

    /**
     * CORRECCIÓN: Inyectamos el accessToken aquí también.
     * El @PostConstruct del Controller solo corre una vez al arrancar,
     * pero si el webhook llega antes o en otro hilo, el token puede no
     * estar configurado y PreapprovalClient falla silenciosamente.
     */
    @Value("${mercadopago.access-token}")
    private String accessToken;

    public void procesarEventoSuscripcion(String suscripcionId) {
        try {
            // ── CORRECCIÓN: Garantizar el token antes de cualquier llamada a la API de MP
            // ──
            MercadoPagoConfig.setAccessToken(accessToken);

            PreapprovalClient client = new PreapprovalClient();
            Preapproval preapproval = client.get(suscripcionId);

            String estado = preapproval.getStatus();
            String emailPagador = preapproval.getExternalReference();

            System.out.println("🔔 Webhook - Estado: " + estado + " | Email: " + emailPagador
                    + " | SuscripcionId: " + suscripcionId);

            if (emailPagador == null || emailPagador.isBlank()) {
                System.out.println("⚠️ externalReference vacío para suscripcionId: " + suscripcionId
                        + ". Verifica que al crear la suscripción se esté enviando .externalReference(email)");
                return;
            }

            usuarioRepo.findByEmail(emailPagador).ifPresent(usuario -> {

                /**
                 * CORRECCIÓN: MercadoPago puede enviar el estado como "authorized" O "active"
                 * dependiendo de la versión de su API y del tipo de evento.
                 * Antes solo se comparaba contra "authorized" y se perdían los eventos
                 * "active".
                 */
                if ("authorized".equals(estado) || "active".equals(estado)) {
                    usuario.setEstadoSuscripcion(EstadoSuscripcion.ACTIVO);
                    usuario.setMercadoPagoSuscripcionId(suscripcionId);
                    usuario.setFechaFinPremium(java.time.LocalDate.now().plusMonths(1));
                    usuarioRepo.save(usuario);
                    System.out.println("✅ Usuario activado: " + emailPagador);

                } else if ("cancelled".equals(estado) || "paused".equals(estado)) {
                    usuario.setEstadoSuscripcion(EstadoSuscripcion.INACTIVO);
                    usuario.setFechaFinPremium(null);
                    usuario.setMercadoPagoSuscripcionId(null);
                    usuarioRepo.save(usuario);
                    System.out.println("❌ Usuario desactivado: " + emailPagador);

                } else {
                    // Loguear estados no manejados para detectar futuros problemas
                    System.out.println("ℹ️ Estado de suscripción no manejado: '" + estado
                            + "' para " + emailPagador + ". No se realizó ningún cambio.");
                }
            });

            if (usuarioRepo.findByEmail(emailPagador).isEmpty()) {
                System.out.println("⚠️ No se encontró usuario con email: " + emailPagador);
            }

        } catch (Exception e) {
            System.out.println("❌ Error procesando webhook para suscripcionId " + suscripcionId
                    + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void cancelarSuscripcion(String suscripcionId) {
        try {
            MercadoPagoConfig.setAccessToken(accessToken);

            com.mercadopago.client.preapproval.PreapprovalUpdateRequest updateRequest = com.mercadopago.client.preapproval.PreapprovalUpdateRequest
                    .builder()
                    .status("cancelled")
                    .build();

            PreapprovalClient client = new PreapprovalClient();
            client.update(suscripcionId, updateRequest);
            System.out.println("✅ Suscripción cancelada en MP: " + suscripcionId);

        } catch (Exception e) {
            System.out.println("❌ Error cancelando en MP: " + e.getMessage());
            throw new RuntimeException("Error al cancelar en Mercado Pago");
        }
    }
}