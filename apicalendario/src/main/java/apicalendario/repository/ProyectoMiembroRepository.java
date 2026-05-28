package apicalendario.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import apicalendario.model.Proyecto;
import apicalendario.model.ProyectoMiembro;
import apicalendario.model.User;

public interface ProyectoMiembroRepository extends JpaRepository<ProyectoMiembro, Long> {
    List<ProyectoMiembro> findByUsuario(User usuario);

    List<ProyectoMiembro> findByProyecto(Proyecto proyecto);

    boolean existsByProyectoAndUsuario(Proyecto proyecto, User usuario);
}