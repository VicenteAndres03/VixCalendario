package apicalendario.service;

import apicalendario.exception.UsuarioNoEncontradoException;
import apicalendario.model.*;
import apicalendario.repository.*;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class MetricasService {

        private final TareaRepository tareaRepo;
        private final TareaProyectoRepository tareaProyectoRepo;
        private final ProyectoMiembroRepository proyectoMiembroRepo;
        private final UsuarioRepository usuarioRepo;

        // ─────────────────────────────────────────
        // RACHA - Se llama cada vez que el usuario
        // cambia el estado de una tarea
        // ─────────────────────────────────────────
        public void actualizarRacha(String email, LocalDate fecha) {
                User usuario = usuarioRepo.findByEmail(email)
                                .orElseThrow(() -> new UsuarioNoEncontradoException("Usuario no encontrado"));

                // Obtenemos todas las tareas del día
                LocalDateTime inicioDia = fecha.atStartOfDay();
                LocalDateTime finDia = fecha.atTime(23, 59, 59);
                List<Tarea> tareasDelDia = tareaRepo.findByUsuarioAndFechaInicioBetween(usuario, inicioDia, finDia);

                if (tareasDelDia.isEmpty())
                        return;

                // 🛡️ FILTRO ANTI-TRAMPA: Contar solo tareas con nombres diferentes
                long tareasUnicas = tareasDelDia.stream()
                                .map(t -> t.getNombre().toLowerCase().trim()) // "Descansar " y "descansar" contarán
                                                                              // como la misma
                                .distinct() // Filtra para que queden solo las diferentes
                                .count();

                // Validamos que existan al menos 5 tareas distintas en el día
                if (tareasUnicas < 5) {
                        return; // No evalúa la racha si no cumple el mínimo de esfuerzo
                }

                // Calculamos el porcentaje de completadas
                long completadas = tareasDelDia.stream()
                                .filter(t -> t.getEstado() == Estado.TERMINADO)
                                .count();

                double porcentaje = (completadas * 100.0) / tareasDelDia.size();

                // Si completó 80% o más, es un día productivo
                if (porcentaje >= 80) {
                        LocalDate ultimoDia = usuario.getUltimoDiaProductivo();

                        if (ultimoDia == null) {
                                // Primera vez
                                usuario.setRachaActual(1);
                        } else if (ultimoDia.equals(fecha.minusDays(1))) {
                                // Día consecutivo
                                usuario.setRachaActual(usuario.getRachaActual() + 1);
                        } else if (!ultimoDia.equals(fecha)) {
                                // Rompió la racha
                                usuario.setRachaActual(1);
                        }

                        // Actualizamos mejor racha
                        if (usuario.getRachaActual() > usuario.getMejorRacha()) {
                                usuario.setMejorRacha(usuario.getRachaActual());
                        }

                        // Actualizamos días para mes gratis
                        usuario.setDiasGratuitos(usuario.getDiasGratuitos() + 1);

                        // Cada 100 días → mes gratis (puedes manejar esto con un email o flag)
                        if (usuario.getDiasGratuitos() % 100 == 0) {
                                // TODO: activar mes gratis al usuario
                        }

                        usuario.setUltimoDiaProductivo(fecha);
                        usuarioRepo.save(usuario);
                }
        }

        // ─────────────────────────────────────────
        // MÉTRICAS PERSONALES
        // ─────────────────────────────────────────
        public Map<String, Object> obtenerMetricasPersonales(String email) {
                User usuario = usuarioRepo.findByEmail(email)
                                .orElseThrow(() -> new UsuarioNoEncontradoException("Usuario no encontrado"));

                List<Tarea> todasLasTareas = tareaRepo.findByUsuario(usuario);

                // Totales generales
                long totalCreadas = todasLasTareas.size();
                long totalCompletadas = todasLasTareas.stream()
                                .filter(t -> t.getEstado() == Estado.TERMINADO)
                                .count();
                double porcentajeGeneral = totalCreadas == 0 ? 0
                                : Math.round((totalCompletadas * 100.0) / totalCreadas * 10.0) / 10.0;

                // Esta semana vs semana pasada
                LocalDate hoy = LocalDate.now();
                LocalDate inicioSemana = hoy.minusDays(hoy.getDayOfWeek().getValue() - 1);
                LocalDate inicioSemanaPasada = inicioSemana.minusDays(7);

                long completadasEstaSemana = todasLasTareas.stream()
                                .filter(t -> t.getEstado() == Estado.TERMINADO && t.getFechaInicio() != null)
                                .filter(t -> {
                                        LocalDate fecha = t.getFechaInicio().toLocalDate();
                                        return !fecha.isBefore(inicioSemana) && !fecha.isAfter(hoy);
                                }).count();

                long completadasSemanaPasada = todasLasTareas.stream()
                                .filter(t -> t.getEstado() == Estado.TERMINADO && t.getFechaInicio() != null)
                                .filter(t -> {
                                        LocalDate fecha = t.getFechaInicio().toLocalDate();
                                        return !fecha.isBefore(inicioSemanaPasada) && fecha.isBefore(inicioSemana);
                                }).count();

                // Hora más productiva
                Map<Integer, Long> tareasPorHora = todasLasTareas.stream()
                                .filter(t -> t.getEstado() == Estado.TERMINADO && t.getFechaInicio() != null)
                                .collect(Collectors.groupingBy(
                                                t -> t.getFechaInicio().getHour(),
                                                Collectors.counting()));

                int horaMasProductiva = tareasPorHora.entrySet().stream()
                                .max(Map.Entry.comparingByValue())
                                .map(Map.Entry::getKey)
                                .orElse(-1);

                // Día más productivo
                Map<String, Long> tareasPorDia = todasLasTareas.stream()
                                .filter(t -> t.getEstado() == Estado.TERMINADO && t.getFechaInicio() != null)
                                .collect(Collectors.groupingBy(
                                                t -> t.getFechaInicio().getDayOfWeek().toString(),
                                                Collectors.counting()));

                String diaMasProductivo = tareasPorDia.entrySet().stream()
                                .max(Map.Entry.comparingByValue())
                                .map(Map.Entry::getKey)
                                .orElse("N/A");

                // Promedio diario (últimos 30 días)
                long diasConTareas = todasLasTareas.stream()
                                .filter(t -> t.getFechaInicio() != null)
                                .map(t -> t.getFechaInicio().toLocalDate())
                                .distinct()
                                .count();

                double promedioDiario = diasConTareas == 0 ? 0
                                : Math.round((totalCompletadas * 10.0) / diasConTareas) / 10.0;

                // Armamos la respuesta
                Map<String, Object> metricas = new LinkedHashMap<>();
                metricas.put("totalCreadas", totalCreadas);
                metricas.put("totalCompletadas", totalCompletadas);
                metricas.put("porcentajeGeneral", porcentajeGeneral);
                metricas.put("completadasEstaSemana", completadasEstaSemana);
                metricas.put("completadasSemanaPasada", completadasSemanaPasada);
                metricas.put("horaMasProductiva", horaMasProductiva == -1 ? "Sin datos" : horaMasProductiva + ":00");
                metricas.put("diaMasProductivo", traducirDia(diaMasProductivo));
                metricas.put("promedioDiario", promedioDiario);
                metricas.put("rachaActual", usuario.getRachaActual());
                metricas.put("mejorRacha", usuario.getMejorRacha());
                metricas.put("diasGratuitos", usuario.getDiasGratuitos());

                return metricas;
        }

        // ─────────────────────────────────────────
        // MÉTRICAS DE PROYECTOS
        // ─────────────────────────────────────────
        public Map<String, Object> obtenerMetricasProyectos(String email) {
                User usuario = usuarioRepo.findByEmail(email)
                                .orElseThrow(() -> new UsuarioNoEncontradoException("Usuario no encontrado"));

                List<ProyectoMiembro> misProyectos = proyectoMiembroRepo
                                .findByUsuarioAndEstado(usuario, EstadoInvitacion.ACEPTADO);

                List<Map<String, Object>> proyectosDetalle = new ArrayList<>();

                for (ProyectoMiembro pm : misProyectos) {
                        Proyecto proyecto = pm.getProyecto();
                        List<TareaProyecto> tareas = tareaProyectoRepo.findByProyecto(proyecto);

                        long totalTareas = tareas.size();
                        long completadas = tareas.stream()
                                        .filter(t -> t.getEstado() == Estado.TERMINADO)
                                        .count();
                        int progreso = totalTareas == 0 ? 0 : (int) ((completadas * 100) / totalTareas);

                        // Miembro más activo (el que tiene más tareas asignadas completadas)
                        Map<String, Long> tareasPorMiembro = tareas.stream()
                                        .filter(t -> t.getEstado() == Estado.TERMINADO && t.getAsignadoA() != null)
                                        .collect(Collectors.groupingBy(
                                                        t -> t.getAsignadoA().getNombre(),
                                                        Collectors.counting()));

                        String miembroMasActivo = tareasPorMiembro.entrySet().stream()
                                        .max(Map.Entry.comparingByValue())
                                        .map(Map.Entry::getKey)
                                        .orElse("Sin datos");

                        // Tareas por estado
                        long porHacer = tareas.stream().filter(t -> t.getEstado() == Estado.POR_HACER).count();
                        long enProceso = tareas.stream().filter(t -> t.getEstado() == Estado.EN_PROCESO).count();

                        Map<String, Object> detalle = new LinkedHashMap<>();
                        detalle.put("id", proyecto.getId());
                        detalle.put("nombre", proyecto.getNombre());
                        detalle.put("totalTareas", totalTareas);
                        detalle.put("completadas", completadas);
                        detalle.put("porHacer", porHacer);
                        detalle.put("enProceso", enProceso);
                        detalle.put("progreso", progreso);
                        detalle.put("miembroMasActivo", miembroMasActivo);
                        detalle.put("totalMiembros", proyectoMiembroRepo.findByProyecto(proyecto).size());

                        proyectosDetalle.add(detalle);
                }

                Map<String, Object> respuesta = new LinkedHashMap<>();
                respuesta.put("totalProyectos", misProyectos.size());
                respuesta.put("proyectos", proyectosDetalle);

                return respuesta;
        }

        // ─────────────────────────────────────────
        // HELPER
        // ─────────────────────────────────────────
        private String traducirDia(String dia) {
                return switch (dia) {
                        case "MONDAY" -> "Lunes";
                        case "TUESDAY" -> "Martes";
                        case "WEDNESDAY" -> "Miércoles";
                        case "THURSDAY" -> "Jueves";
                        case "FRIDAY" -> "Viernes";
                        case "SATURDAY" -> "Sábado";
                        case "SUNDAY" -> "Domingo";
                        default -> dia;
                };
        }
}