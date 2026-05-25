package apicalendario.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import apicalendario.dto.ActualizarPerfilDto;
import apicalendario.dto.LoginDto;
import apicalendario.dto.LoginResponseDto;
import apicalendario.dto.RegisterDto;
import apicalendario.exception.CredencialesInvalidasException;
import apicalendario.exception.CuentaInactivaException;
import apicalendario.exception.UsuarioNoEncontradoException;
import apicalendario.model.EstadoSuscripcion;
import apicalendario.model.Rol;
import apicalendario.model.User;
import apicalendario.repository.UsuarioRepository;
import apicalendario.security.JwtService;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class UsuarioService {

    private final UsuarioRepository repositorio;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenBlacklistService tokenblack;

    public String registrarUsuario(RegisterDto registro) {
        Optional<User> usuarioExistente = repositorio.findByEmail(registro.getEmail());
        if (usuarioExistente.isPresent()) {
            User verifi = usuarioExistente.get();
            if (!verifi.isActivo()) {
                String passwordE = passwordEncoder.encode(registro.getPassword());
                verifi.setActivo(true);
                verifi.setNombre(registro.getNombre());
                verifi.setApellido(registro.getApellido());
                verifi.setPassword(passwordE);
                verifi.setEstadoSuscripcion(EstadoSuscripcion.INACTIVO);
                verifi.setRol(Rol.USER);
                repositorio.save(verifi);
                return "El usuario eliminado fue nuevamente registrado de manera correcta";
            } else {
                return "el usuario ya esta registrado";
            }
        } else {
            String passwordE = passwordEncoder.encode(registro.getPassword());

            User usuario = User.builder()
                    .email(registro.getEmail())
                    .nombre(registro.getNombre())
                    .apellido(registro.getApellido())
                    .password(passwordE)
                    .rol(Rol.USER)
                    .estadoSuscripcion(EstadoSuscripcion.INACTIVO)
                    .activo(true)
                    .build();
            repositorio.save(usuario);
            return "El usuario se registro de una manera correcta";
        }
    }

    public LoginResponseDto IniciarSesion(LoginDto email) {
        User usuario = repositorio.findByEmail(email.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        if (passwordEncoder.matches(email.getPassword(), usuario.getPassword()) && usuario.isActivo()) {
            String token = jwtService.generarToken(usuario.getEmail());
            return new LoginResponseDto(token, usuario.getNombre(), usuario.getEmail());
        } else if (passwordEncoder.matches(email.getPassword(), usuario.getPassword()) && !usuario.isActivo()) {
            throw new CuentaInactivaException("Este usuario ha sido eliminado");
        } else {
            throw new CredencialesInvalidasException("Email o contraseña incorrecta");
        }
    }

    public String BorrarUsuario(String email, String token) {
        User usuario = repositorio.findByEmail(email)
                .orElseThrow(() -> new UsuarioNoEncontradoException("Usuario no ecnontrado"));
        usuario.setActivo(false);
        repositorio.save(usuario);
        tokenblack.agregarToken(token);
        return "cuenta eliminada correctamente";
    }

    public String ModificarUsuario(String email, ActualizarPerfilDto actualizar) {
        User usuario = repositorio.findByEmail(email)
                .orElseThrow(() -> new UsuarioNoEncontradoException("Usuario no encontrado"));
        String passwordE = passwordEncoder.encode(actualizar.getPassword());
        usuario.setNombre(actualizar.getNombre());
        usuario.setApellido(actualizar.getApellido());
        usuario.setPassword(passwordE);

        repositorio.save(usuario);

        return "usuario modificado de manera exitosa";
    }
}
