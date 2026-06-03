package apicalendario.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "hoja")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Hoja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    // Utilizamos TEXT para poder almacenar notas largas o HTML si usas un editor de
    // texto enriquecido en el frontend
    @Column(columnDefinition = "TEXT", nullable = true)
    private String contenido;

    @ManyToOne
    @JoinColumn(name = "cuaderno_id", nullable = false)
    private Cuaderno cuaderno;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime fechaActualizacion = LocalDateTime.now();
}