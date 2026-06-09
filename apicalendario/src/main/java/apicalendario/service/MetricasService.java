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
        // RACHA
        // ─────────────────────────────────────────
        public void actualizarRacha(String email, LocalDate fecha) {
                User usuario = usuarioRepo.findByEmail(email)
                                .orElseThrow(() -> new UsuarioNoEncontradoException("Usuario no encontrado"));

                // 🛡️ FIX 1: No procesar fechas futuras.
                // Si el usuario agenda tareas con anticipación y las completa antes,
                // eso no debe contar como día productivo hasta que llegue ese día.
                LocalDate hoy = LocalDate.now();
                if (fecha.isAfter(hoy)) {
                        return;
                }

                List<Tarea> todasLasTareas = tareaRepo.findByUsuario(usuario);

                int dayOfWeekNum = fecha.getDayOfWeek().getValue();
                String[] mapaDias = { "", "L", "M", "X", "J", "V", "S", "D" };
                String letraDia = mapaDias[dayOfWeekNum];

                // Filtramos solo las tareas que pertenecen al día 'fecha'
                List<Tarea> tareasDelDia = todasLasTareas.stream().filter(t -> {
                        if (t.getFechaInicio() == null)
                                return false;
                        LocalDate fechaInicioTarea = t.getFechaInicio().toLocalDate();

                        if (t.isEsRecurrente() && t.getDiasRecurrencia() != null) {
                                return !fechaInicioTarea.isAfter(fecha) &&
                                                t.getDiasRecurrencia().contains(letraDia);
                        } else {
                                // Para tareas normales: solo las agendadas exactamente para 'fecha'.
                                // Tareas de otros días (pasados o futuros) no se mezclan.
                                return fechaInicioTarea.equals(fecha);
                        }
                }).collect(Collectors.toList());

                if (tareasDelDia.isEmpty())
                        return;

                long tareasUnicas = tareasDelDia.stream()
                                .map(t -> t.getNombre().toLowerCase().trim())
                                .distinct()
                                .count();

                if (tareasUnicas < 3)
                        return;

                long completadas = tareasDelDia.stream()
                                .filter(t -> obtenerEstadoEfectivo(t, fecha) == Estado.TERMINADO)
                                .count();

                double porcentaje = (completadas * 100.0) / tareasDelDia.size();

                if (porcentaje >= 80) {
                        LocalDate ultimoDia = usuario.getUltimoDiaProductivo();

                        if (ultimoDia == null) {
                                // Primera vez que alcanza el umbral
                                usuario.setRachaActual(1);
                        } else if (ultimoDia.equals(fecha)) {
                                // 🛡️ FIX 2: Este día ya fue registrado como productivo.
                                // Puede ocurrir si el usuario completa varias tareas en el mismo día
                                // (cada una dispara actualizarRacha). No sumamos ni reseteamos.
                                // Solo actualizamos mejorRacha por si acaso y salimos.
                                if (usuario.getRachaActual() > usuario.getMejorRacha()) {
                                        usuario.setMejorRacha(usuario.getRachaActual());
                                }
                                usuarioRepo.save(usuario);
                                return;
                        } else if (ultimoDia.equals(fecha.minusDays(1))) {
                                // Día consecutivo → extender racha
                                usuario.setRachaActual(usuario.getRachaActual() + 1);
                        } else {
                                // Hubo un salto de días → reiniciar racha desde 1
                                usuario.setRachaActual(1);
                        }

                        if (usuario.getRachaActual() > usuario.getMejorRacha()) {
                                usuario.setMejorRacha(usuario.getRachaActual());
                        }

                        // 🛡️ FIX 3: diasGratuitos solo se incrementa una vez por día productivo
                        usuario.setDiasGratuitos(usuario.getDiasGratuitos() + 1);
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

                // Promedio diario
                long diasConTareas = todasLasTareas.stream()
                                .filter(t -> t.getFechaInicio() != null)
                                .map(t -> t.getFechaInicio().toLocalDate())
                                .distinct()
                                .count();

                double promedioDiario = diasConTareas == 0 ? 0
                                : Math.round((totalCompletadas * 10.0) / diasConTareas) / 10.0;

                // ── Tareas de HOY por estado (con historialEstados para recurrentes) ──
                int dayOfWeekNum = hoy.getDayOfWeek().getValue();
                String[] mapaDias = { "", "L", "M", "X", "J", "V", "S", "D" };
                String letraHoy = mapaDias[dayOfWeekNum];

                List<Tarea> tareasDeHoy = todasLasTareas.stream().filter(t -> {
                        if (t.getFechaInicio() == null)
                                return false;
                        LocalDate fechaTarea = t.getFechaInicio().toLocalDate();
                        if (t.isEsRecurrente() && t.getDiasRecurrencia() != null) {
                                return !fechaTarea.isAfter(hoy) && t.getDiasRecurrencia().contains(letraHoy);
                        } else {
                                return fechaTarea.equals(hoy);
                        }
                }).collect(Collectors.toList());

                long hoyPorHacer = tareasDeHoy.stream()
                                .filter(t -> obtenerEstadoEfectivo(t, hoy) == Estado.POR_HACER)
                                .count();
                long hoyEnProceso = tareasDeHoy.stream()
                                .filter(t -> obtenerEstadoEfectivo(t, hoy) == Estado.EN_PROCESO)
                                .count();
                long hoyCompletadas = tareasDeHoy.stream()
                                .filter(t -> obtenerEstadoEfectivo(t, hoy) == Estado.TERMINADO)
                                .count();

                // Armar respuesta
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
                metricas.put("hoyPorHacer", hoyPorHacer);
                metricas.put("hoyEnProceso", hoyEnProceso);
                metricas.put("hoyCompletadas", hoyCompletadas);

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

                        Map<String, Long> tareasPorMiembro = tareas.stream()
                                        .filter(t -> t.getEstado() == Estado.TERMINADO && t.getAsignadoA() != null)
                                        .collect(Collectors.groupingBy(
                                                        t -> t.getAsignadoA().getNombre(),
                                                        Collectors.counting()));

                        String miembroMasActivo = tareasPorMiembro.entrySet().stream()
                                        .max(Map.Entry.comparingByValue())
                                        .map(Map.Entry::getKey)
                                        .orElse("Sin datos");

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
        // HELPERS
        // ─────────────────────────────────────────

        /**
         * Devuelve el estado efectivo de una tarea para una fecha específica.
         * Para tareas recurrentes consulta historialEstados.
         * Para tareas normales devuelve el campo estado directamente.
         */
        private Estado obtenerEstadoEfectivo(Tarea tarea, LocalDate fecha) {
                if (tarea.isEsRecurrente()
                                && tarea.getHistorialEstados() != null
                                && !tarea.getHistorialEstados().isEmpty()) {
                        String prefijoFecha = fecha.toString() + ":";
                        for (String registro : tarea.getHistorialEstados().split(",")) {
                                if (registro.startsWith(prefijoFecha)) {
                                        try {
                                                return Estado.valueOf(registro.split(":")[1]);
                                        } catch (IllegalArgumentException e) {
                                                // registro malformado, caemos al default
                                        }
                                }
                        }
                        // Sin registro para este día = no marcada = POR_HACER
                        return Estado.POR_HACER;
                }
                return tarea.getEstado();
        }

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