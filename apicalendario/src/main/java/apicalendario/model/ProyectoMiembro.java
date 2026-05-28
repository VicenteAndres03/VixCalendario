package apicalendario.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "proyecto_miembro")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProyectoMiembro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "proyecto_id", nullable = false)
    private Proyecto proyecto;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private User usuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RolProyecto rol = RolProyecto.MIEMBRO;
}