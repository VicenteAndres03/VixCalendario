package apicalendario.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import apicalendario.model.Amistad;
import apicalendario.model.EstadoAmistad;
import apicalendario.model.User;

public interface AmistadRepository extends JpaRepository<Amistad, Long> {
    List<Amistad> findByReceptorAndEstado(User receptor, EstadoAmistad estado);

    List<Amistad> findBySolicitanteAndEstado(User solicitante, EstadoAmistad estado);

    Optional<Amistad> findBySolicitanteAndReceptor(User solicitante, User receptor);

    boolean existsBySolicitanteAndReceptor(User solicitante, User receptor);
}