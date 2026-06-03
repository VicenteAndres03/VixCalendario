package apicalendario.controller;

import apicalendario.dto.HojaDto;
import apicalendario.model.Hoja;
import apicalendario.service.HojaService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/hojas")
@AllArgsConstructor
public class HojaController {

    private final HojaService hojaService;

    // Obtener todas las hojas de un cuaderno específico
    @GetMapping("/cuaderno/{cuadernoId}")
    public ResponseEntity<List<Hoja>> obtenerHojasDeCuaderno(@PathVariable Long cuadernoId) {
        return ResponseEntity.ok(hojaService.obtenerHojasDeCuaderno(cuadernoId));
    }

    // Obtener la información de una hoja específica
    @GetMapping("/{id}")
    public ResponseEntity<Hoja> obtenerHojaPorId(@PathVariable Long id) {
        return ResponseEntity.ok(hojaService.obtenerHoja(id));
    }

    // Crear una nueva hoja dentro de un cuaderno
    @PostMapping("/cuaderno/{cuadernoId}")
    public ResponseEntity<?> crearHoja(@PathVariable Long cuadernoId, @Valid @RequestBody HojaDto dto,
            Principal principal) {
        try {
            Hoja nuevaHoja = hojaService.crearHoja(principal.getName(), cuadernoId, dto);
            return new ResponseEntity<>(nuevaHoja, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            // Capturamos el error si el usuario alcanzó el límite de hojas
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    // Actualizar el título o contenido de una hoja
    @PutMapping("/{id}")
    public ResponseEntity<Hoja> actualizarHoja(@PathVariable Long id, @Valid @RequestBody HojaDto dto) {
        return ResponseEntity.ok(hojaService.actualizarHoja(id, dto));
    }

    // Eliminar una hoja
    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminarHoja(@PathVariable Long id) {
        return ResponseEntity.ok(hojaService.eliminarHoja(id));
    }
}