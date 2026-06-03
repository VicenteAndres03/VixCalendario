package apicalendario.service;

import apicalendario.dto.HojaDto;
import apicalendario.exception.UsuarioNoEncontradoException;
import apicalendario.model.Cuaderno;
import apicalendario.model.Hoja;
import apicalendario.model.User;
import apicalendario.repository.CuadernoRepository;
import apicalendario.repository.HojaRepository;
import apicalendario.repository.UsuarioRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class HojaService {

    private final HojaRepository hojaRepo;
    private final CuadernoRepository cuadernoRepo;
    private final UsuarioRepository usuarioRepo;

    public List<Hoja> obtenerHojasDeCuaderno(Long cuadernoId) {
        Cuaderno cuaderno = cuadernoRepo.findById(cuadernoId)
                .orElseThrow(() -> new RuntimeException("Cuaderno no encontrado"));
        return hojaRepo.findByCuaderno(cuaderno);
    }

    public Hoja obtenerHoja(Long id) {
        return hojaRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Hoja no encontrada"));
    }

    public Hoja crearHoja(String email, Long cuadernoId, HojaDto dto) {
        User usuario = usuarioRepo.findByEmail(email)
                .orElseThrow(() -> new UsuarioNoEncontradoException("Usuario no encontrado"));

        Cuaderno cuaderno = cuadernoRepo.findById(cuadernoId)
                .orElseThrow(() -> new RuntimeException("Cuaderno no encontrado"));

        // Validar que el cuaderno pertenezca al usuario que está haciendo la petición
        if (!cuaderno.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("No tienes permiso para agregar hojas a este cuaderno");
        }

        // 🔒 LÓGICA FREEMIUM: Validar límite de hojas
        boolean esPremium = "ACTIVO".equals(usuario.getEstadoSuscripcion()) || "ADMIN".equals(usuario.getRol().name());

        if (!esPremium) {
            long totalHojas = hojaRepo.countByCuaderno(cuaderno);
            // Límite de 10 hojas por cuaderno para usuarios gratuitos
            if (totalHojas >= 10) {
                throw new RuntimeException(
                        "Has alcanzado el límite gratuito de 10 hojas en este cuaderno. ¡Hazte Premium para tener hojas ilimitadas!");
            }
        }

        Hoja nuevaHoja = Hoja.builder()
                .titulo(dto.getTitulo())
                .contenido(dto.getContenido())
                .cuaderno(cuaderno)
                .build();

        return hojaRepo.save(nuevaHoja);
    }

    public Hoja actualizarHoja(Long id, HojaDto dto) {
        Hoja hoja = hojaRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Hoja no encontrada"));

        hoja.setTitulo(dto.getTitulo());
        hoja.setContenido(dto.getContenido());
        hoja.setFechaActualizacion(LocalDateTime.now());

        return hojaRepo.save(hoja);
    }

    public String eliminarHoja(Long id) {
        Hoja hoja = hojaRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Hoja no encontrada"));

        hojaRepo.delete(hoja);
        return "Hoja eliminada correctamente";
    }
}