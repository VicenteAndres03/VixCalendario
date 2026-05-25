package apicalendario.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import apicalendario.dto.TareaDto;
import apicalendario.exception.UsuarioNoEncontradoException;
import apicalendario.model.Estado;
import apicalendario.model.Tarea;
import apicalendario.model.User;
import apicalendario.repository.TareaRepository;
import apicalendario.repository.UsuarioRepository;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class TareaService {

    private final TareaRepository repositorio;
    private final UsuarioRepository repositorioU;

    public String RegistrarTarea(String email, TareaDto tarea) {
        User usuario = repositorioU.findByEmail(email)
                .orElseThrow(() -> new UsuarioNoEncontradoException("Usuario no encontrado"));

        Tarea ta = Tarea.builder()
                .nombre(tarea.getNombre())
                .descripcion(tarea.getDescripcion())
                .fechaInicio(tarea.getFechaInicio())
                .fechaFin(tarea.getFechaFin())
                .estado(Estado.POR_HACER)
                .esRecurrente(tarea.isEsRecurrente())
                .diasRecurrencia(tarea.getDiasRecurrencia())
                .usuario(usuario)
                .build();

        repositorio.save(ta);

        return "Tarea registrada de manera correcta";
    }

    public List<Tarea> TareadelDia(String email, LocalDate fecha) {
        User usuario = repositorioU.findByEmail(email)
                .orElseThrow(() -> new UsuarioNoEncontradoException("Este usuario no se encontro"));

        return repositorio.findByUsuarioAndFechaInicioBetween(usuario, fecha.atStartOfDay(), fecha.atTime(23, 59, 59));
    }

    public String cambiarEstado(Long id, Estado nuevoEstado) {
        Tarea tarea = repositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));

        tarea.setEstado(nuevoEstado);
        repositorio.save(tarea);
        return "Estado actualizado correctamente";
    }

    public String eliminarTarea(Long id) {
        Tarea tarea = repositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));

        repositorio.delete(tarea);
        return "Tarea eliminada de manera correcta";
    }

    public String actualizarTarea(Long id, TareaDto tarea) {
        Tarea ta = repositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));
        ta.setNombre(tarea.getNombre());
        ta.setDescripcion(tarea.getDescripcion());
        ta.setFechaInicio(tarea.getFechaInicio());
        ta.setFechaFin(tarea.getFechaFin());
        ta.setEsRecurrente(tarea.isEsRecurrente());
        ta.setDiasRecurrencia(tarea.getDiasRecurrencia());
        repositorio.save(ta);
        return "Tarea actualizada correctamente";
    }
}
