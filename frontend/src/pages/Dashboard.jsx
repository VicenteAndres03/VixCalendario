import { useState, useEffect, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import { ThemeContext } from "../context/ThemeContext"
import axios from "axios"

// ─── helpers ──────────────────────────────────────────────────────────────────
const formatHora = (isoString) => {
    if (!isoString) return "--:--"
    const d = new Date(isoString)
    return d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", hour12: false })
}

const diasSemanaES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
const mesesES = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]

const hoy = new Date()
const fechaFormateada = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`

// Estado de tarea → color + texto
const estadoConfig = {
    POR_HACER: { label: "Por hacer", dot: "bg-red-400", text: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
    EN_PROCESO: { label: "En proceso", dot: "bg-yellow-400", text: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
    TERMINADO: { label: "Terminado", dot: "bg-green-400", text: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
}

// Evalúa si una tarea de proyecto está en plazo, cerca de vencer o vencida
const evaluarPlazo = (fechaLimiteStr) => {
    if (!fechaLimiteStr) return null
    const limite = new Date(fechaLimiteStr + "T23:59:59")
    const ahora = new Date()
    const diffMs = limite - ahora
    const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffDias < 0) return { label: `Vencida hace ${Math.abs(diffDias)}d`, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: "🔴" }
    if (diffDias === 0) return { label: "Vence hoy", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", icon: "🟠" }
    if (diffDias <= 3) return { label: `Vence en ${diffDias}d`, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", icon: "🟡" }
    return { label: `${diffDias}d restantes`, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", icon: "🟢" }
}

// ─── Barra de progreso animada ─────────────────────────────────────────────────
function ProgressBar({ value, max, color = "bg-cyan-500" }) {
    const pct = max === 0 ? 0 : Math.round((value / max) * 100)
    return (
        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
                className={`h-full rounded-full ${color}`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            />
        </div>
    )
}

// ─── Tarjeta de tarea personal ─────────────────────────────────────────────────
function TareaCard({ tarea, darkMode }) {
    const cfg = estadoConfig[tarea.estado] || estadoConfig.POR_HACER
    const horaInicio = formatHora(tarea.fechaInicio)
    const horaFin = formatHora(tarea.fechaFin)

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-start gap-3 p-3 rounded-xl border transition-all
                ${tarea.estado === "TERMINADO"
                    ? darkMode ? "bg-gray-900/30 border-gray-800/50 opacity-60" : "bg-gray-50 border-gray-100 opacity-60"
                    : darkMode ? "bg-gray-900 border-gray-800 hover:border-cyan-500/30" : "bg-white border-gray-200 hover:border-cyan-400/40 shadow-sm"
                }`}
        >
            {/* Punto de estado */}
            <div className="mt-1 shrink-0">
                <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
            </div>

            <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold leading-snug truncate
                    ${tarea.estado === "TERMINADO" ? "line-through opacity-60" : darkMode ? "text-white" : "text-gray-900"}`}>
                    {tarea.nombre}
                </p>
                {tarea.descripcion && tarea.descripcion !== "Sin descripción" && (
                    <p className={`text-xs mt-0.5 truncate ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                        {tarea.descripcion}
                    </p>
                )}
                {tarea.esRecurrente && (
                    <span className="text-[10px] text-cyan-500 font-bold">🔄 Recurrente</span>
                )}
            </div>

            {/* Hora */}
            <div className="shrink-0 text-right">
                <p className={`text-xs font-bold tabular-nums ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {horaInicio}
                </p>
                <p className={`text-[10px] tabular-nums ${darkMode ? "text-gray-600" : "text-gray-400"}`}>
                    → {horaFin}
                </p>
            </div>
        </motion.div>
    )
}

// ─── Tarjeta de tarea de proyecto ──────────────────────────────────────────────
function TareaProyectoCard({ tarea, nombreProyecto, darkMode }) {
    const cfg = estadoConfig[tarea.estado] || estadoConfig.POR_HACER
    const plazo = evaluarPlazo(tarea.fechaLimite)

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-3 rounded-xl border transition-all
                ${tarea.estado === "TERMINADO"
                    ? darkMode ? "bg-gray-900/30 border-gray-800/50 opacity-50" : "bg-gray-50 border-gray-100 opacity-50"
                    : darkMode ? "bg-gray-900 border-gray-800 hover:border-purple-500/30" : "bg-white border-gray-200 hover:border-purple-400/40 shadow-sm"
                }`}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                    <div className="min-w-0">
                        <p className={`text-sm font-semibold leading-snug truncate
                            ${tarea.estado === "TERMINADO" ? "line-through opacity-60" : darkMode ? "text-white" : "text-gray-900"}`}>
                            {tarea.nombre}
                        </p>
                        <p className={`text-[11px] mt-0.5 font-medium truncate ${darkMode ? "text-purple-400/70" : "text-purple-500/70"}`}>
                            📁 {nombreProyecto}
                        </p>
                    </div>
                </div>

                {/* Badge de plazo */}
                {plazo && tarea.estado !== "TERMINADO" && (
                    <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${plazo.bg} ${plazo.color}`}>
                        {plazo.icon} {plazo.label}
                    </span>
                )}
                {tarea.estado === "TERMINADO" && (
                    <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400">
                        ✓ Listo
                    </span>
                )}
            </div>

            {/* Fechas */}
            <div className={`flex items-center gap-3 mt-2 text-[10px] font-medium ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                <span>Inicio: {tarea.fechaInicio}</span>
                <span>·</span>
                <span>Límite: {tarea.fechaLimite}</span>
            </div>
        </motion.div>
    )
}

// ─── Tarjeta de hábito ─────────────────────────────────────────────────────────
function HabitoCard({ habito, darkMode }) {
    const completadoHoy = habito.fechasCompletadas?.includes(fechaFormateada)

    // Calcular racha del hábito
    let rachaHabito = 0
    const fechasSet = new Set(habito.fechasCompletadas || [])
    let checkDate = new Date(hoy)
    while (fechasSet.has(checkDate.toISOString().split("T")[0])) {
        rachaHabito++
        checkDate.setDate(checkDate.getDate() - 1)
    }

    // Últimos 7 días para mini heatmap
    const ultimos7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(hoy)
        d.setDate(d.getDate() - (6 - i))
        return d.toISOString().split("T")[0]
    })

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-xl border transition-all
                ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm"}`}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                    {/* Indicador completado hoy */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0 transition-all
                        ${completadoHoy ? "bg-green-500/20 text-green-400" : darkMode ? "bg-gray-800 text-gray-500" : "bg-gray-100 text-gray-400"}`}>
                        {completadoHoy ? "✓" : "○"}
                    </div>
                    <div className="min-w-0">
                        <p className={`text-sm font-semibold truncate ${darkMode ? "text-white" : "text-gray-900"}`}>
                            {habito.nombre}
                        </p>
                        {rachaHabito > 0 && (
                            <p className="text-[10px] text-orange-400 font-bold">🔥 {rachaHabito} días seguidos</p>
                        )}
                    </div>
                </div>

                {/* Mini heatmap 7 días */}
                <div className="flex gap-1 shrink-0">
                    {ultimos7.map((fecha, i) => {
                        const completado = fechasSet.has(fecha)
                        const esHoy = fecha === fechaFormateada
                        return (
                            <div
                                key={i}
                                title={fecha}
                                className={`w-3 h-3 rounded-sm transition-all
                                    ${completado
                                        ? "bg-green-500"
                                        : darkMode ? "bg-gray-800" : "bg-gray-200"
                                    }
                                    ${esHoy ? "ring-1 ring-cyan-500 ring-offset-1 ring-offset-gray-900" : ""}`}
                            />
                        )
                    })}
                </div>
            </div>
        </motion.div>
    )
}

// ─── Componente principal ──────────────────────────────────────────────────────
export default function Dashboard() {
    const { darkMode } = useContext(ThemeContext)
    const navigate = useNavigate()
    const token = localStorage.getItem("token")
    const nombre = localStorage.getItem("nombre") || "Usuario"
    const suscripcion = localStorage.getItem("suscripcion") || "INACTIVO"
    const rol = localStorage.getItem("rol") || "USER"
    const esPremium = suscripcion === "ACTIVO" || rol === "ADMIN"

    const [tareas, setTareas] = useState([])
    const [habitos, setHabitos] = useState([])
    const [proyectos, setProyectos] = useState([])  // [{ proyecto, tareas[] }]
    const [metricas, setMetricas] = useState(null)
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        cargarTodo()
    }, [])

    const cargarTodo = async () => {
        setCargando(true)
        const headers = { Authorization: `Bearer ${token}` }

        try {
            const promesas = [
                axios.get(`https://api.vix-flow.com/api/tarea/dia?fecha=${fechaFormateada}`, { headers }),
                axios.get("https://api.vix-flow.com/api/metricas/personales", { headers }),
                axios.get("https://api.vix-flow.com/api/proyectos/mis", { headers }),
            ]
            if (esPremium) {
                promesas.push(axios.get("https://api.vix-flow.com/api/habitos", { headers }))
            }

            const resultados = await Promise.allSettled(promesas)

            // Tareas del día
            if (resultados[0].status === "fulfilled") {
                const tareasOrdenadas = (resultados[0].value.data || []).sort((a, b) => {
                    if (!a.fechaInicio) return 1
                    if (!b.fechaInicio) return -1
                    return new Date(a.fechaInicio) - new Date(b.fechaInicio)
                })
                setTareas(tareasOrdenadas)
            }

            // Métricas
            if (resultados[1].status === "fulfilled") {
                setMetricas(resultados[1].value.data)
            }

            // Proyectos + sus tareas
            if (resultados[2].status === "fulfilled") {
                const misProyectos = resultados[2].value.data || []
                // Cargamos tareas de cada proyecto en paralelo
                const proyectosConTareas = await Promise.all(
                    misProyectos.map(async (pm) => {
                        try {
                            const resTareas = await axios.get(
                                `https://api.vix-flow.com/api/tareas-proyecto/proyecto/${pm.proyecto.id}`,
                                { headers }
                            )
                            return { proyectoMiembro: pm, tareas: resTareas.data || [] }
                        } catch {
                            return { proyectoMiembro: pm, tareas: [] }
                        }
                    })
                )
                setProyectos(proyectosConTareas)
            }

            // Hábitos (solo premium)
            if (esPremium && resultados[3]?.status === "fulfilled") {
                setHabitos(resultados[3].value.data || [])
            }
        } catch (err) {
            console.error("Error cargando dashboard:", err)
        } finally {
            setCargando(false)
        }
    }

    // ── Datos calculados ──
    const totalTareas = tareas.length
    const terminadas = tareas.filter(t => t.estado === "TERMINADO").length
    const enProceso = tareas.filter(t => t.estado === "EN_PROCESO").length
    const porHacer = tareas.filter(t => t.estado === "POR_HACER").length
    const pctHoy = totalTareas === 0 ? 0 : Math.round((terminadas / totalTareas) * 100)

    // Tareas de proyectos que vencen hoy o están vencidas y no terminadas
    const tareasUrgentes = proyectos.flatMap(({ proyectoMiembro: pm, tareas: pts }) =>
        pts
            .filter(t => t.estado !== "TERMINADO")
            .map(t => ({ ...t, nombreProyecto: pm.proyecto?.nombre }))
            .filter(t => {
                const plazo = evaluarPlazo(t.fechaLimite)
                return plazo && (plazo.label.includes("Vencida") || plazo.label.includes("hoy") || plazo.label.includes("1d") || plazo.label.includes("2d") || plazo.label.includes("3d"))
            })
    )

    // Hábitos completados hoy
    const habitosHoy = habitos.filter(h => h.fechasCompletadas?.includes(fechaFormateada)).length

    // Saludo según hora
    const hora = hoy.getHours()
    const saludo = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches"

    if (cargando) {
        return (
            <div className={`min-h-screen ${darkMode ? "bg-gray-950" : "bg-gray-50"}`}>
                <Navbar />
                <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                    <div className="text-cyan-500 animate-pulse text-sm font-medium">Cargando tu día...</div>
                </div>
            </div>
        )
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 pb-12
            ${darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
            <Navbar />

            {/* Orbes de fondo */}
            {darkMode && (
                <>
                    <div className="fixed w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl top-[-5%] right-[-5%] pointer-events-none" />
                    <div className="fixed w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl bottom-[-5%] left-[-5%] pointer-events-none" />
                </>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 relative z-10">

                {/* ── CABECERA ── */}
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <p className={`text-sm font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {diasSemanaES[hoy.getDay()]}, {hoy.getDate()} de {mesesES[hoy.getMonth()]} {hoy.getFullYear()}
                    </p>
                    <h1 className="text-3xl font-extrabold tracking-tight">
                        {saludo}, <span className="text-cyan-400">{nombre}</span> 👋
                    </h1>
                </motion.div>

                {/* ── FILA DE STATS RÁPIDAS ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                    {[
                        { label: "Tareas hoy", valor: totalTareas, sub: `${terminadas} terminadas`, color: "text-cyan-400", icon: "📋" },
                        { label: "Progreso", valor: `${pctHoy}%`, sub: totalTareas === 0 ? "Sin tareas" : pctHoy === 100 ? "¡Día perfecto! 🌟" : pctHoy >= 50 ? "¡Vas bien! 🔥" : "A seguir 💪", color: pctHoy === 100 ? "text-green-400" : "text-yellow-400", icon: "🎯" },
                        { label: "Racha actual", valor: `${metricas?.rachaActual ?? 0}d`, sub: `Mejor: ${metricas?.mejorRacha ?? 0}d`, color: "text-orange-400", icon: "🔥" },
                        esPremium
                            ? { label: "Hábitos hoy", valor: `${habitosHoy}/${habitos.length}`, sub: habitosHoy === habitos.length && habitos.length > 0 ? "¡Todos! 🏆" : `${habitos.length - habitosHoy} pendientes`, color: "text-green-400", icon: "🌱" }
                            : { label: "Urgentes", valor: tareasUrgentes.length, sub: tareasUrgentes.length === 0 ? "Todo en plazo ✓" : "Revisar proyectos", color: tareasUrgentes.length > 0 ? "text-red-400" : "text-green-400", icon: "⚡" },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07 }}
                            className={`p-4 rounded-2xl border ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm"}`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">{stat.icon}</span>
                                <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                    {stat.label}
                                </span>
                            </div>
                            <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.valor}</p>
                            <p className={`text-[11px] mt-0.5 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{stat.sub}</p>
                        </motion.div>
                    ))}
                </div>

                {/* ── GRID PRINCIPAL ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* COLUMNA IZQUIERDA (tareas personales) — 2/3 ancho */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* ── TAREAS DEL DÍA ── */}
                        <motion.section
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className={`rounded-2xl border ${darkMode ? "bg-gray-900/60 border-gray-800" : "bg-white border-gray-200 shadow-sm"}`}
                        >
                            {/* Header sección */}
                            <div className={`flex items-center justify-between px-5 py-4 border-b ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">📋</span>
                                    <h2 className="font-bold text-base">Tareas de hoy</h2>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold
                                        ${darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                                        {totalTareas}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* mini progreso */}
                                    <div className="hidden sm:flex items-center gap-2">
                                        <div className="w-24">
                                            <ProgressBar value={terminadas} max={totalTareas} />
                                        </div>
                                        <span className={`text-xs font-bold ${pctHoy === 100 ? "text-green-400" : "text-cyan-400"}`}>
                                            {pctHoy}%
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/tablero/${fechaFormateada}`)}
                                        className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all
                                            ${darkMode ? "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20" : "bg-cyan-50 text-cyan-600 hover:bg-cyan-100 border border-cyan-200"}`}
                                    >
                                        Ver tablero →
                                    </button>
                                </div>
                            </div>

                            <div className="p-4">
                                {totalTareas === 0 ? (
                                    <div className="text-center py-10">
                                        <span className="text-4xl block mb-2 opacity-40">📭</span>
                                        <p className={`text-sm font-medium ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                                            No tienes tareas para hoy
                                        </p>
                                        <button
                                            onClick={() => navigate(`/tablero/${fechaFormateada}`)}
                                            className="mt-3 text-xs text-cyan-500 hover:text-cyan-400 font-bold transition-colors"
                                        >
                                            + Agregar tarea
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {/* Agrupar por estado: primero por hacer, luego en proceso, luego terminadas */}
                                        {["POR_HACER", "EN_PROCESO", "TERMINADO"].map(estado => {
                                            const grupo = tareas.filter(t => t.estado === estado)
                                            if (grupo.length === 0) return null
                                            const cfg = estadoConfig[estado]
                                            return (
                                                <div key={estado}>
                                                    <div className="flex items-center gap-2 mb-2 mt-3 first:mt-0">
                                                        <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                                        <span className={`text-[11px] font-bold uppercase tracking-wider ${cfg.text}`}>
                                                            {cfg.label} · {grupo.length}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        {grupo.map(t => (
                                                            <TareaCard key={t.id} tarea={t} darkMode={darkMode} />
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.section>

                        {/* ── TAREAS DE PROYECTOS ── */}
                        <motion.section
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.18 }}
                            className={`rounded-2xl border ${darkMode ? "bg-gray-900/60 border-gray-800" : "bg-white border-gray-200 shadow-sm"}`}
                        >
                            <div className={`flex items-center justify-between px-5 py-4 border-b ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">🚀</span>
                                    <h2 className="font-bold text-base">Proyectos activos</h2>
                                    {tareasUrgentes.length > 0 && (
                                        <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                                            {tareasUrgentes.length} urgente{tareasUrgentes.length > 1 ? "s" : ""}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => navigate("/proyectos")}
                                    className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all
                                        ${darkMode ? "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20" : "bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200"}`}
                                >
                                    Ver proyectos →
                                </button>
                            </div>

                            <div className="p-4">
                                {proyectos.length === 0 ? (
                                    <div className="text-center py-10">
                                        <span className="text-4xl block mb-2 opacity-40">🚀</span>
                                        <p className={`text-sm font-medium ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                                            No tienes proyectos activos
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-5">
                                        {proyectos.map(({ proyectoMiembro: pm, tareas: pts }, idx) => {
                                            const nombreProy = pm.proyecto?.nombre || "Proyecto"
                                            const total = pts.length
                                            const completadas = pts.filter(t => t.estado === "TERMINADO").length
                                            const pendientes = pts.filter(t => t.estado !== "TERMINADO")
                                            // Ordenar por urgencia: vencidas primero, luego por fecha límite
                                            const pendientesOrdenadas = pendientes.sort((a, b) => {
                                                if (!a.fechaLimite) return 1
                                                if (!b.fechaLimite) return -1
                                                return new Date(a.fechaLimite) - new Date(b.fechaLimite)
                                            })

                                            return (
                                                <div key={idx}>
                                                    {/* Cabecera del proyecto */}
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-md
                                                                ${pm.rol === "ADMIN"
                                                                    ? "bg-cyan-500/10 text-cyan-400"
                                                                    : darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                                                                {pm.rol === "ADMIN" ? "Admin" : "Miembro"}
                                                            </span>
                                                            <span
                                                                className={`text-sm font-bold cursor-pointer hover:text-purple-400 transition-colors ${darkMode ? "text-white" : "text-gray-900"}`}
                                                                onClick={() => navigate(`/proyecto/${pm.proyecto?.id}/tablero`)}
                                                            >
                                                                {nombreProy}
                                                            </span>
                                                        </div>
                                                        <span className={`text-[11px] ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                                                            {completadas}/{total} tareas
                                                        </span>
                                                    </div>

                                                    {/* Barra de progreso del proyecto */}
                                                    <div className="mb-3">
                                                        <ProgressBar value={completadas} max={total} color="bg-purple-500" />
                                                    </div>

                                                    {/* Tareas pendientes (máx 4 visibles) */}
                                                    {pendientesOrdenadas.length > 0 ? (
                                                        <div className="space-y-1.5">
                                                            {pendientesOrdenadas.slice(0, 4).map(t => (
                                                                <TareaProyectoCard
                                                                    key={t.id}
                                                                    tarea={t}
                                                                    nombreProyecto={nombreProy}
                                                                    darkMode={darkMode}
                                                                />
                                                            ))}
                                                            {pendientesOrdenadas.length > 4 && (
                                                                <button
                                                                    onClick={() => navigate(`/proyecto/${pm.proyecto?.id}/tablero`)}
                                                                    className={`w-full text-xs font-medium py-2 rounded-xl text-center transition-all
                                                                        ${darkMode ? "text-gray-500 hover:text-purple-400" : "text-gray-400 hover:text-purple-500"}`}
                                                                >
                                                                    +{pendientesOrdenadas.length - 4} tareas más →
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <p className={`text-xs text-center py-2 ${darkMode ? "text-gray-600" : "text-gray-400"}`}>
                                                            ✅ Todas las tareas completadas
                                                        </p>
                                                    )}

                                                    {/* Separador entre proyectos */}
                                                    {idx < proyectos.length - 1 && (
                                                        <div className={`mt-4 border-t ${darkMode ? "border-gray-800" : "border-gray-100"}`} />
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.section>
                    </div>

                    {/* COLUMNA DERECHA — 1/3 ancho */}
                    <div className="space-y-6">

                        {/* ── HÁBITOS ── */}
                        <motion.section
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.22 }}
                            className={`rounded-2xl border ${darkMode ? "bg-gray-900/60 border-gray-800" : "bg-white border-gray-200 shadow-sm"}`}
                        >
                            <div className={`flex items-center justify-between px-5 py-4 border-b ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">🌱</span>
                                    <h2 className="font-bold text-base">Hábitos</h2>
                                    {esPremium && habitos.length > 0 && (
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold
                                            ${habitosHoy === habitos.length
                                                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                                : darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                                            {habitosHoy}/{habitos.length}
                                        </span>
                                    )}
                                </div>
                                {esPremium && (
                                    <button
                                        onClick={() => navigate("/habitos")}
                                        className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all
                                            ${darkMode ? "bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20" : "bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"}`}
                                    >
                                        Ver todos →
                                    </button>
                                )}
                            </div>

                            <div className="p-4">
                                {!esPremium ? (
                                    <div className="text-center py-8">
                                        <span className="text-4xl block mb-2">🔒</span>
                                        <p className={`text-sm font-medium mb-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                            Función exclusiva Premium
                                        </p>
                                        <button
                                            onClick={() => navigate("/plan")}
                                            className="text-xs bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold px-4 py-2 rounded-xl shadow-md"
                                        >
                                            Ver planes 💎
                                        </button>
                                    </div>
                                ) : habitos.length === 0 ? (
                                    <div className="text-center py-8">
                                        <span className="text-4xl block mb-2 opacity-40">🌱</span>
                                        <p className={`text-sm font-medium ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                                            No tienes hábitos creados
                                        </p>
                                        <button
                                            onClick={() => navigate("/habitos")}
                                            className="mt-2 text-xs text-green-500 hover:text-green-400 font-bold transition-colors"
                                        >
                                            + Crear hábito
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {habitos.map(h => (
                                            <HabitoCard key={h.id} habito={h} darkMode={darkMode} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.section>

                        {/* ── RESUMEN RÁPIDO / ACCESOS DIRECTOS ── */}
                        <motion.section
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.28 }}
                            className={`rounded-2xl border ${darkMode ? "bg-gray-900/60 border-gray-800" : "bg-white border-gray-200 shadow-sm"}`}
                        >
                            <div className={`px-5 py-4 border-b ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">⚡</span>
                                    <h2 className="font-bold text-base">Acceso rápido</h2>
                                </div>
                            </div>
                            <div className="p-4 grid grid-cols-2 gap-2">
                                {[
                                    { label: "Calendario", icon: "📅", ruta: "/calendario", color: "cyan" },
                                    { label: "Tablero", icon: "🗂️", ruta: `/tablero/${fechaFormateada}`, color: "blue" },
                                    { label: "Proyectos", icon: "🚀", ruta: "/proyectos", color: "purple" },
                                    { label: "Cuadernos", icon: "📓", ruta: "/cuadernos", color: "orange" },
                                    ...(esPremium ? [
                                        { label: "Métricas", icon: "📊", ruta: "/metricas", color: "pink" },
                                        { label: "Hábitos", icon: "🌱", ruta: "/habitos", color: "green" },
                                    ] : [
                                        { label: "Amigos", icon: "👥", ruta: "/amigos", color: "teal" },
                                        { label: "Premium", icon: "💎", ruta: "/plan", color: "yellow" },
                                    ]),
                                ].map((item, i) => (
                                    <button
                                        key={i}
                                        onClick={() => navigate(item.ruta)}
                                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center
                                            ${darkMode
                                                ? "bg-gray-800/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800"
                                                : "bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100"}`}
                                    >
                                        <span className="text-xl">{item.icon}</span>
                                        <span className={`text-[11px] font-bold ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                            {item.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </motion.section>

                        {/* ── FRASE MOTIVACIONAL ── */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.35 }}
                            className={`px-5 py-4 rounded-2xl border border-dashed text-center
                                ${darkMode ? "border-gray-800 bg-gray-900/30" : "border-gray-200 bg-gray-50"}`}
                        >
                            <p className={`text-xs font-medium italic ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                                {pctHoy === 100 && totalTareas > 0
                                    ? "\"Día perfecto. Eres imparable. 🌟\""
                                    : pctHoy >= 50
                                        ? "\"La mitad del camino ya está hecho. Sigue. 🔥\""
                                        : totalTareas === 0
                                            ? "\"Un día sin tareas es un día para planificar. 📅\""
                                            : "\"Cada tarea completada es un paso más hacia tus metas. 💪\""}
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}