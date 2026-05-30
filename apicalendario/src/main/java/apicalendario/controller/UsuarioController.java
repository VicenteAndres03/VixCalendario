package apicalendario.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import apicalendario.dto.ActualizarPerfilDto;
import apicalendario.dto.LoginDto;
import apicalendario.dto.LoginResponseDto;
import apicalendario.dto.RegisterDto;
import apicalendario.model.EstadoSuscripcion;
import apicalendario.model.User;
import apicalendario.service.UsuarioService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/usuarios")
@AllArgsConstructor
public class UsuarioController {

    private final UsuarioService service;

    @PostMapping("/registro")
    public String registrarUsuario(@Valid @RequestBody RegisterDto registro) {
        return service.registrarUsuario(registro);
    }

    @PostMapping("/login")
    public LoginResponseDto IniciarSesion(@Valid @RequestBody LoginDto email) {
        return service.IniciarSesion(email);
    }

    @GetMapping("/perfil")
    public String BuscarUsuario() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @DeleteMapping("/borrar")
    public String borrarUsuario(HttpServletRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        String token = request.getHeader("Authorization").substring(7);

        return service.BorrarUsuario(email, token);
    }

    @PutMapping("/modificar")
    public String ModificarUsuario(@Valid @RequestBody ActualizarPerfilDto actualizar) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return service.ModificarUsuario(email, actualizar);
    }

    @GetMapping("/admin/todos")
    public ResponseEntity<List<User>> obtenerTodos() {
        return ResponseEntity.ok(service.obtenerTodosLosUsuarios());
    }

    @PutMapping("/admin/suscripcion/{id}")
    public ResponseEntity<String> cambiarSuscripcion(@PathVariable Long id, @RequestParam EstadoSuscripcion estado) {
        return ResponseEntity.ok(service.cambiarEstadoSuscripcion(id, estado));
    }

    @DeleteMapping("/admin/eliminar/{id}")
    public ResponseEntity<String> eliminarUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(service.eliminarUsuario(id));
    }
}
