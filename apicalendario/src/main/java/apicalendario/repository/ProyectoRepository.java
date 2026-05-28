package apicalendario.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import apicalendario.model.Proyecto;
import apicalendario.model.User;

public interface ProyectoRepository extends JpaRepository<Proyecto, Long> {
    List<Proyecto> findByCreador(User creador);
}