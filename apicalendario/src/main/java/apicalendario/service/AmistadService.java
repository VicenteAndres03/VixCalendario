package apicalendario.service;

import java.util.List;

import org.springframework.stereotype.Service;

import apicalendario.dto.AmistadDto;
import apicalendario.exception.UsuarioNoEncontradoException;
import apicalendario.model.Amistad;
import apicalendario.model.EstadoAmistad;
import apicalendario.model.User;
import apicalendario.repository.AmistadRepository;
import apicalendario.repository.UsuarioRepository;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class AmistadService {

    private final AmistadRepository repositorio;
    private final UsuarioRepository repositorioU;

    public String enviarSolicitud(String emailSolicitante, AmistadDto dto) {
        User solicitante = repositorioU.findByEmail(emailSolicitante)
                .orElseThrow(() -> new UsuarioNoEncontradoException("Usuario no encontrado"));
        User receptor = repositorioU.findByEmail(dto.getEmailReceptor())
                .orElseThrow(() -> new UsuarioNoEncontradoException("Usuario receptor no encontrado"));

        if (repositorio.existsBySolicitanteAndReceptor(solicitante, receptor)) {
            return "Ya existe una solicitud pendiente";
        }

        Amistad amistad = Amistad.builder()
                .solicitante(solicitante)
                .receptor(receptor)
                .build();
        repositorio.save(amistad);
        return "Solicitud enviada correctamente";
    }

    public String aceptarSolicitud(Long id) {
        Amistad amistad = repositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
        amistad.setEstado(EstadoAmistad.ACEPTADA);
        repositorio.save(amistad);
        return "Solicitud aceptada";
    }

    public String rechazarSolicitud(Long id) {
        Amistad amistad = repositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
        amistad.setEstado(EstadoAmistad.RECHAZADA);
        repositorio.save(amistad);
        return "Solicitud rechazada";
    }

    public List<Amistad> obtenerSolicitudesPendientes(String email) {
        User usuario = repositorioU.findByEmail(email)
                .orElseThrow(() -> new UsuarioNoEncontradoException("Usuario no encontrado"));
        return repositorio.findByReceptorAndEstado(usuario, EstadoAmistad.PENDIENTE);
    }

    public List<Amistad> obtenerAmigos(String email) {
        User usuario = repositorioU.findByEmail(email)
                .orElseThrow(() -> new UsuarioNoEncontradoException("Usuario no encontrado"));
        return repositorio.findBySolicitanteAndEstado(usuario, EstadoAmistad.ACEPTADA);
    }
}