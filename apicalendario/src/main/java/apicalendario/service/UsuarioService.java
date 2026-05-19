package apicalendario.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import apicalendario.dto.RegisterDto;
import apicalendario.model.EstadoSuscripcion;
import apicalendario.model.Rol;
import apicalendario.model.User;
import apicalendario.repository.UsuarioRepository;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class UsuarioService {

    private final UsuarioRepository repositorio;
    private final PasswordEncoder passwordEncoder;

    public String registrarUsuario(RegisterDto registro) {
        if (repositorio.findByEmail(registro.getEmail()).isPresent()) {
            return "El usuario ya esta registrado";
        } else {
            String passwordE = passwordEncoder.encode(registro.getPassword());
            User usuario = User.builder()
                    .email(registro.getEmail())
                    .nombre(registro.getNombre())
                    .apellido(registro.getApellido())
                    .password(passwordE)
                    .rol(Rol.USER)
                    .estadoSuscripcion(EstadoSuscripcion.INACTIVO)
                    .build();
            repositorio.save(usuario);
            return "El usuario se registro de una manera correcta";
        }
    }
}
