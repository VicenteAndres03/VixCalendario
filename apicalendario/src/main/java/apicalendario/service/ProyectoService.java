package apicalendario.service;

import java.util.List;

import org.springframework.stereotype.Service;

import apicalendario.dto.ProyectoDto;
import apicalendario.exception.UsuarioNoEncontradoException;
import apicalendario.model.Proyecto;
import apicalendario.model.ProyectoMiembro;
import apicalendario.model.RolProyecto;
import apicalendario.model.User;
import apicalendario.repository.ProyectoMiembroRepository;
import apicalendario.repository.ProyectoRepository;
import apicalendario.repository.UsuarioRepository;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ProyectoService {

    private final ProyectoRepository repositorio;
    private final ProyectoMiembroRepository repositorioMiembro;
    private final UsuarioRepository repositorioU;

    public String crearProyecto(String email, ProyectoDto dto) {
        User creador = repositorioU.findByEmail(email)
                .orElseThrow(() -> new UsuarioNoEncontradoException("Usuario no encontrado"));

        Proyecto proyecto = Proyecto.builder()
                .nombre(dto.getNombre())
                .descripcion(dto.getDescripcion())
                .creador(creador)
                .build();
        repositorio.save(proyecto);

        ProyectoMiembro miembro = ProyectoMiembro.builder()
                .proyecto(proyecto)
                .usuario(creador)
                .rol(RolProyecto.ADMIN)
                .build();
        repositorioMiembro.save(miembro);

        return "Proyecto creado correctamente";
    }

    public String invitarMiembro(Long proyectoId, String emailInvitado) {
        Proyecto proyecto = repositorio.findById(proyectoId)
                .orElseThrow(() -> new RuntimeException("Proyecto no encontrado"));
        User invitado = repositorioU.findByEmail(emailInvitado)
                .orElseThrow(() -> new UsuarioNoEncontradoException("Usuario no encontrado"));

        if (repositorioMiembro.existsByProyectoAndUsuario(proyecto, invitado)) {
            return "El usuario ya es miembro del proyecto";
        }

        ProyectoMiembro miembro = ProyectoMiembro.builder()
                .proyecto(proyecto)
                .usuario(invitado)
                .rol(RolProyecto.MIEMBRO)
                .build();
        repositorioMiembro.save(miembro);
        return "Miembro invitado correctamente";
    }

    public List<ProyectoMiembro> obtenerMisProyectos(String email) {
        User usuario = repositorioU.findByEmail(email)
                .orElseThrow(() -> new UsuarioNoEncontradoException("Usuario no encontrado"));
        return repositorioMiembro.findByUsuario(usuario);
    }
}