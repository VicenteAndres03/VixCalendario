import { useState, useEffect, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts"
import Navbar from "../components/Navbar"
import axios from "axios"
import { ThemeContext } from "../context/ThemeContext"

// ─── Partícula flotante ───────────────────────────────────────────────────────
function Particula({ delay }) {
    const x = Math.random() * 300 - 150
    const y = Math.random() * 300 - 150
    const size = Math.random() * 6 + 3
    return (
        <motion.div
            className="absolute rounded-full bg-cyan-400/60"
            style={{ width: size, height: size }}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{
                x: [0, x, x * 0.5, 0],
                y: [0, y, y * 0.5, 0],
                opacity: [0, 1, 0.5, 0],
                scale: [0, 1.5, 0.8, 0]
            }}
            transition={{ duration: 2.5, delay, ease: "easeOut" }}
        />
    )
}

// ─── Pantalla de intro ────────────────────────────────────────────────────────
function IntroPortal({ onComplete }) {
    const [fase, setFase] = useState("pulso") // pulso → burst → done

    useEffect(() => {
        const t1 = setTimeout(() => setFase("burst"), 2000)
        const t2 = setTimeout(() => onComplete(), 3200)
        return () => { clearTimeout(t1); clearTimeout(t2) }
    }, [])

    return (
        <div className="fixed inset-0 bg-gray-950 flex items-center justify-center z-50 overflow-hidden">

            {/* Fondo con ondas */}
            <motion.div
                className="absolute inset-0"
                animate={{ opacity: fase === "burst" ? 0 : 1 }}
                transition={{ duration: 0.8 }}
            >
                {[1, 2, 3].map(i => (
                    <motion.div
                        key={i}
                        className="absolute inset-0 rounded-full border border-cyan-500/20"
                        style={{ margin: "auto", width: i * 200, height: i * 200, top: 0, bottom: 0, left: 0, right: 0 }}
                        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    />
                ))}
            </motion.div>

            {/* Orbe central */}
            <div className="relative flex items-center justify-center">

                {/* Partículas en el burst */}
                {fase === "burst" && Array.from({ length: 20 }).map((_, i) => (
                    <Particula key={i} delay={i * 0.05} />
                ))}

                {/* Halo exterior */}
                <motion.div
                    className="absolute rounded-full"
                    style={{
                        width: 200, height: 200,
                        background: "radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)"
                    }}
                    animate={fase === "burst"
                        ? { scale: [1, 8], opacity: [1, 0] }
                        : { scale: [1, 1.1, 1] }
                    }
                    transition={fase === "burst"
                        ? { duration: 0.8, ease: "easeOut" }
                        : { duration: 1.5, repeat: Infinity }
                    }
                />

                {/* Orbe principal */}
                <motion.div
                    className="relative z-10 rounded-full flex items-center justify-center"
                    style={{
                        width: 120, height: 120,
                        background: "radial-gradient(circle at 35% 35%, #67e8f9, #06b6d4, #7c3aed)"
                    }}
                    animate={fase === "burst"
                        ? { scale: [1, 15], opacity: [1, 0] }
                        : {
                            scale: [1, 1.05, 1],
                            boxShadow: [
                                "0 0 30px rgba(6,182,212,0.5)",
                                "0 0 60px rgba(6,182,212,0.8)",
                                "0 0 30px rgba(6,182,212,0.5)"
                            ]
                        }
                    }
                    transition={fase === "burst"
                        ? { duration: 0.6, ease: "easeOut" }
                        : { duration: 1.5, repeat: Infinity }
                    }
                >
                    <motion.span
                        className="text-4xl"
                        animate={fase === "burst" ? { scale: 0, opacity: 0 } : { rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        📊
                    </motion.span>
                </motion.div>

                {/* Texto */}
                <motion.p
                    className="absolute -bottom-16 text-cyan-400 font-medium text-sm tracking-widest uppercase"
                    animate={fase === "burst" ? { opacity: 0 } : { opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    Analizando tu productividad...
                </motion.p>
            </div>
        </div>
    )
}

// ─── Tooltip personalizado ────────────────────────────────────────────────────
function TooltipCustom({ active, payload, label, darkMode }) {
    if (!active || !payload?.length) return null
    return (
        <div className={`px-4 py-2 rounded-xl border text-sm shadow-xl ${darkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"}`}>
            <p className="font-bold mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.fill || p.color }}>{p.name}: <strong>{p.value}</strong></p>
            ))}
        </div>
    )
}

// ─── Card de métrica ──────────────────────────────────────────────────────────
function MetricaCard({ emoji, valor, label, color, delay }) {
    const { darkMode } = useContext(ThemeContext)
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            whileHover={{ scale: 1.03, y: -4 }}
            className={`p-5 rounded-2xl border transition-all ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm"}`}
        >
            <div className="text-3xl mb-3">{emoji}</div>
            <div className={`text-4xl font-bold ${color} mb-1`}>{valor}</div>
            <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{label}</div>
        </motion.div>
    )
}

// ─── Componente principal ─────────────────────────────────────────────────────
function Metricas() {
    const { darkMode } = useContext(ThemeContext)
    const token = localStorage.getItem("token")

    const [mostrarIntro, setMostrarIntro] = useState(true)
    const [tab, setTab] = useState("personal")
    const [metricasPersonales, setMetricasPersonales] = useState(null)
    const [metricasProyectos, setMetricasProyectos] = useState(null)
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        cargarDatos()
    }, [])

    const cargarDatos = async () => {
        try {
            const [resPersonal, resProyectos] = await Promise.all([
                axios.get("https://api.vix-flow.com/api/metricas/personales", {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get("https://api.vix-flow.com/api/metricas/proyectos", {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ])
            setMetricasPersonales(resPersonal.data)
            setMetricasProyectos(resProyectos.data)
        } catch (error) {
            console.error("Error cargando métricas:", error)
        } finally {
            setCargando(false)
        }
    }

    const dataSemana = metricasPersonales ? [
        { name: "Esta semana", tareas: Number(metricasPersonales.completadasEstaSemana) },
        { name: "Sem. pasada", tareas: Number(metricasPersonales.completadasSemanaPasada) }
    ] : []

    const dataProyectos = metricasProyectos?.proyectos?.map(p => ({
        name: p.nombre.length > 10 ? p.nombre.substring(0, 10) + "…" : p.nombre,
        completadas: p.completadas,
        pendientes: p.porHacer + p.enProceso,
        progreso: p.progreso
    })) || []

    // ── Lógica de Rachas según tu plan ──
    const rachaActual = metricasPersonales?.rachaActual || 0
    let proximoObjetivo = 7
    let recompensaSiguiente = "Temas de color para el tablero"
    let nivelRacha = { label: "🌱 Comenzando", color: "text-green-400" }

    if (rachaActual >= 100 && rachaActual % 100 !== 0) {
        proximoObjetivo = (Math.floor(rachaActual / 100) + 1) * 100
        recompensaSiguiente = "1 mes gratis 🎁"
        nivelRacha = { label: "👑 Leyenda Absoluta", color: "text-yellow-400" }
    } else if (rachaActual >= 90 && rachaActual < 100) {
        proximoObjetivo = 100
        recompensaSiguiente = "1 mes gratis 🎁"
        nivelRacha = { label: "👑 Leyenda", color: "text-yellow-400" }
    } else if (rachaActual >= 60 && rachaActual < 90) {
        proximoObjetivo = 90
        recompensaSiguiente = "Insignia Leyenda + Acceso anticipado 👑"
        nivelRacha = { label: "💎 Modo Focus", color: "text-purple-400" }
    } else if (rachaActual >= 30 && rachaActual < 60) {
        proximoObjetivo = 60
        recompensaSiguiente = "Modo Focus (Pomodoro) 💎"
        nivelRacha = { label: "🏆 30 Días", color: "text-orange-400" }
    } else if (rachaActual >= 14 && rachaActual < 30) {
        proximoObjetivo = 30
        recompensaSiguiente = "Insignia 30 días + 50% dscto 🏆"
        nivelRacha = { label: "⚡ En racha", color: "text-cyan-400" }
    } else if (rachaActual >= 7 && rachaActual < 14) {
        proximoObjetivo = 14
        recompensaSiguiente = "Avatar animado ⚡"
        nivelRacha = { label: "🔥 7 Días", color: "text-red-400" }
    }

    const porcentajeRacha = proximoObjetivo > 0 ? Math.min(Math.round((rachaActual / proximoObjetivo) * 100), 100) : 0

    // ── Lógica para el Panel de Resumen de Hoy ──
    const hoyPorHacer = metricasPersonales?.hoyPorHacer || 0
    const hoyEnProceso = metricasPersonales?.hoyEnProceso || 0
    const hoyCompletadas = metricasPersonales?.hoyCompletadas || 0
    const totalHoy = hoyPorHacer + hoyEnProceso + hoyCompletadas
    const progresoHoy = totalHoy > 0 ? Math.round((hoyCompletadas / totalHoy) * 100) : 0

    let mensajeMotivacional = "¡A darle con todo! 🚀"
    if (progresoHoy === 100 && totalHoy > 0) mensajeMotivacional = "¡Día perfecto! 🌟"
    else if (progresoHoy >= 50) mensajeMotivacional = "¡Vas genial! 🔥"
    else if (progresoHoy > 0) mensajeMotivacional = "¡Buen inicio, sigue así! 💪"
    else if (totalHoy === 0) mensajeMotivacional = "Día libre, o crea tareas nuevas ☕"

    return (
        <>
            {/* Intro portal */}
            <AnimatePresence>
                {mostrarIntro && (
                    <IntroPortal onComplete={() => setMostrarIntro(false)} />
                )}
            </AnimatePresence>

            <div className={`${darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"} min-h-screen transition-colors duration-300`}>
                <Navbar />

                {darkMode && (
                    <>
                        <div className="fixed w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl top-0 right-0 pointer-events-none" />
                        <div className="fixed w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl bottom-0 left-0 pointer-events-none" />
                    </>
                )}

                {!mostrarIntro && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        className="p-6 max-w-7xl mx-auto relative z-10"
                    >
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="mb-8"
                        >
                            <h1 className="text-3xl font-bold">Métricas de Enfoque</h1>
                            <p className={`mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                Tu productividad real, analizada al detalle
                            </p>
                        </motion.div>

                        {/* Tabs */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className={`flex gap-1 p-1 rounded-xl w-fit mb-8 ${darkMode ? "bg-gray-800" : "bg-gray-200"}`}
                        >
                            {[
                                { id: "personal", label: "📊 Personal" },
                                { id: "proyectos", label: "🚀 Proyectos" }
                            ].map(t => (
                                <motion.button
                                    key={t.id}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setTab(t.id)}
                                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300
                                        ${tab === t.id
                                            ? "bg-cyan-500 text-gray-950 font-bold"
                                            : darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
                                >
                                    {t.label}
                                </motion.button>
                            ))}
                        </motion.div>

                        {cargando ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-cyan-400 animate-pulse">Cargando datos...</div>
                            </div>
                        ) : (
                            <AnimatePresence mode="wait">

                                {/* ── TAB PERSONAL ── */}
                                {tab === "personal" && metricasPersonales && (
                                    <motion.div
                                        key="personal"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {/* Cards resumen */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                            <MetricaCard emoji="📝" valor={metricasPersonales.totalCreadas} label="Tareas creadas" color="text-cyan-400" delay={0.1} />
                                            <MetricaCard emoji="✅" valor={metricasPersonales.totalCompletadas} label="Completadas" color="text-green-400" delay={0.15} />
                                            <MetricaCard emoji="🎯" valor={`${metricasPersonales.porcentajeGeneral}%`} label="Tasa de éxito" color="text-purple-400" delay={0.2} />
                                            <MetricaCard emoji="📈" valor={metricasPersonales.promedioDiario} label="Promedio diario" color="text-yellow-400" delay={0.25} />
                                        </div>

                                        {/* Gráficos fila 1 */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                                            {/* Panel Resumen de Hoy */}
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 }}
                                                className={`p-6 rounded-2xl border flex flex-col justify-between ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm"}`}
                                            >
                                                <div>
                                                    <h3 className="font-bold text-lg mb-1">Resumen de Hoy</h3>
                                                    <p className={`text-xs mb-4 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Tu progreso actual en tiempo real</p>

                                                    <div className="space-y-3 mb-6">
                                                        <div className={`flex items-center justify-between p-3 rounded-xl ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                                                <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Por Hacer</span>
                                                            </div>
                                                            <span className="font-bold text-red-400">{hoyPorHacer}</span>
                                                        </div>
                                                        <div className={`flex items-center justify-between p-3 rounded-xl ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                                                <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>En Proceso</span>
                                                            </div>
                                                            <span className="font-bold text-yellow-400">{hoyEnProceso}</span>
                                                        </div>
                                                        <div className={`flex items-center justify-between p-3 rounded-xl ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                                                <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Completadas</span>
                                                            </div>
                                                            <span className="font-bold text-green-400">{hoyCompletadas}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex justify-between items-end mb-2">
                                                        <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Progreso de hoy</span>
                                                        <span className="text-2xl font-bold text-cyan-400">{progresoHoy}%</span>
                                                    </div>
                                                    <div className={`w-full h-3 rounded-full mb-3 ${darkMode ? "bg-gray-800" : "bg-gray-200"}`}>
                                                        <motion.div
                                                            className="h-3 rounded-full bg-gradient-to-r from-cyan-400 to-green-400"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${progresoHoy}%` }}
                                                            transition={{ duration: 1, delay: 0.5 }}
                                                        />
                                                    </div>
                                                    <p className={`text-center text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                        {mensajeMotivacional}
                                                    </p>
                                                </div>
                                            </motion.div>

                                            {/* Bar semana */}
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.35 }}
                                                className={`p-6 rounded-2xl border ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm"}`}
                                            >
                                                <h3 className="font-bold text-lg mb-1">Comparativa semanal</h3>
                                                <p className={`text-xs mb-4 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Tareas completadas esta semana vs la anterior</p>
                                                <ResponsiveContainer width="100%" height={220}>
                                                    <BarChart data={dataSemana} barSize={50}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#1f2937" : "#f3f4f6"} />
                                                        <XAxis dataKey="name" tick={{ fill: darkMode ? "#9ca3af" : "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
                                                        <YAxis tick={{ fill: darkMode ? "#9ca3af" : "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                                        <Tooltip content={<TooltipCustom darkMode={darkMode} />} />
                                                        <Bar dataKey="tareas" name="Completadas" fill="#06b6d4" radius={[10, 10, 0, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </motion.div>
                                        </div>

                                        {/* Fila 2: Patrones + Racha */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                            {/* Patrones */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.4 }}
                                                className={`p-6 rounded-2xl border ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm"}`}
                                            >
                                                <h3 className="font-bold text-lg mb-1">Tus patrones</h3>
                                                <p className={`text-xs mb-4 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Cuándo eres más productivo</p>
                                                <div className="space-y-3">
                                                    {[
                                                        { emoji: "⏰", label: "Hora más productiva", valor: metricasPersonales.horaMasProductiva, color: "text-cyan-400" },
                                                        { emoji: "📅", label: "Día más productivo", valor: metricasPersonales.diaMasProductivo, color: "text-purple-400" },
                                                        { emoji: "📊", label: "Promedio por día", valor: `${metricasPersonales.promedioDiario} tareas`, color: "text-yellow-400" },
                                                    ].map((item, i) => (
                                                        <motion.div
                                                            key={i}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.45 + i * 0.1 }}
                                                            className={`flex items-center justify-between p-4 rounded-xl ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xl">{item.emoji}</span>
                                                                <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{item.label}</span>
                                                            </div>
                                                            <span className={`font-bold ${item.color}`}>{item.valor}</span>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </motion.div>

                                            {/* Racha con sistema dinámico */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.45 }}
                                                className={`p-6 rounded-2xl border flex flex-col justify-between ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm"}`}
                                            >
                                                <div>
                                                    <h3 className="font-bold text-lg mb-1">Tu racha de enfoque</h3>
                                                    <p className={`text-xs mb-4 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Completa el 80% de tus tareas diarias para mantenerla</p>

                                                    {/* Nivel actual */}
                                                    <div className={`flex items-center justify-between p-4 rounded-xl mb-4 ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                                                        <span className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Nivel actual</span>
                                                        <span className={`font-bold text-lg ${nivelRacha.color}`}>{nivelRacha.label}</span>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div className={`flex items-center justify-between p-3 rounded-xl border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                                                            <div className="flex items-center gap-2">
                                                                <span>🔥</span>
                                                                <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Racha actual</span>
                                                            </div>
                                                            <span className="font-bold text-orange-500 text-lg">{rachaActual} días</span>
                                                        </div>
                                                        <div className={`flex items-center justify-between p-3 rounded-xl ${darkMode ? "bg-transparent" : "bg-transparent"}`}>
                                                            <div className="flex items-center gap-2">
                                                                <span>🏆</span>
                                                                <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Mejor racha histórica</span>
                                                            </div>
                                                            <span className={`font-bold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{metricasPersonales.mejorRacha || 0} días</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Barra de progreso hacia la SIGUIENTE recompensa */}
                                                <div className="mt-6 pt-4 border-t border-dashed border-gray-300 dark:border-gray-700">
                                                    <div className="flex justify-between items-end mb-2">
                                                        <div>
                                                            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Desbloqueas en {proximoObjetivo - rachaActual} días:</p>
                                                            <p className={`text-sm font-bold mt-1 ${darkMode ? "text-white" : "text-gray-900"}`}>{recompensaSiguiente}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-2xl font-bold text-orange-400">{porcentajeRacha}%</span>
                                                            <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{rachaActual} / {proximoObjetivo} d</p>
                                                        </div>
                                                    </div>
                                                    <div className={`w-full h-3 rounded-full ${darkMode ? "bg-gray-800" : "bg-gray-200"}`}>
                                                        <motion.div
                                                            className="h-3 rounded-full bg-gradient-to-r from-orange-400 to-yellow-400"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${porcentajeRacha}%` }}
                                                            transition={{ duration: 1.2, delay: 0.5 }}
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ── TAB PROYECTOS ── */}
                                {tab === "proyectos" && metricasProyectos && (
                                    <motion.div
                                        key="proyectos"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {/* Resumen */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                            <MetricaCard emoji="🚀" valor={metricasProyectos.totalProyectos} label="Proyectos activos" color="text-cyan-400" delay={0.1} />
                                            <MetricaCard emoji="📋" valor={metricasProyectos.proyectos?.reduce((a, p) => a + p.totalTareas, 0) || 0} label="Tareas en total" color="text-purple-400" delay={0.15} />
                                            <MetricaCard emoji="✅" valor={metricasProyectos.proyectos?.reduce((a, p) => a + p.completadas, 0) || 0} label="Completadas" color="text-green-400" delay={0.2} />
                                        </div>

                                        {dataProyectos.length > 0 ? (
                                            <>
                                                {/* Bar proyectos */}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.25 }}
                                                    className={`p-6 rounded-2xl border mb-6 ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm"}`}
                                                >
                                                    <h3 className="font-bold text-lg mb-1">Tareas por proyecto</h3>
                                                    <p className={`text-xs mb-4 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Comparativa entre completadas y pendientes</p>
                                                    <ResponsiveContainer width="100%" height={260}>
                                                        <BarChart data={dataProyectos} barGap={4}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#1f2937" : "#f3f4f6"} />
                                                            <XAxis dataKey="name" tick={{ fill: darkMode ? "#9ca3af" : "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
                                                            <YAxis tick={{ fill: darkMode ? "#9ca3af" : "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                                            <Tooltip content={<TooltipCustom darkMode={darkMode} />} />
                                                            <Legend />
                                                            <Bar dataKey="completadas" name="Completadas" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                                                            <Bar dataKey="pendientes" name="Pendientes" fill="#a855f7" radius={[8, 8, 0, 0]} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </motion.div>

                                                {/* Cards detalle */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {metricasProyectos.proyectos.map((proy, i) => (
                                                        <motion.div
                                                            key={i}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.3 + i * 0.1 }}
                                                            whileHover={{ scale: 1.02 }}
                                                            className={`p-5 rounded-2xl border ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200 shadow-sm"}`}
                                                        >
                                                            <div className="flex items-center justify-between mb-3">
                                                                <h4 className="font-bold truncate">{proy.nombre}</h4>
                                                                <span className="text-cyan-400 font-bold text-lg ml-2">{proy.progreso}%</span>
                                                            </div>

                                                            <div className={`w-full h-2 rounded-full mb-4 ${darkMode ? "bg-gray-800" : "bg-gray-200"}`}>
                                                                <motion.div
                                                                    className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${proy.progreso}%` }}
                                                                    transition={{ duration: 1, delay: 0.4 + i * 0.1 }}
                                                                />
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                                {[
                                                                    { label: "Total tareas", valor: proy.totalTareas, color: "" },
                                                                    { label: "Miembros", valor: proy.totalMiembros, color: "" },
                                                                    { label: "Más activo", valor: proy.miembroMasActivo, color: "text-cyan-400" },
                                                                    { label: "En proceso", valor: proy.enProceso, color: "text-yellow-400" },
                                                                ].map((item, j) => (
                                                                    <div key={j} className={`p-3 rounded-xl ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                                                                        <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{item.label}</p>
                                                                        <p className={`font-bold truncate ${item.color}`}>{item.valor}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center mt-20 text-center">
                                                <div className="text-8xl mb-4 opacity-30">🚀</div>
                                                <h3 className="text-xl font-bold text-gray-400 mb-2">Sin proyectos aún</h3>
                                                <p className="text-gray-500 text-sm">Crea un proyecto colaborativo para ver sus métricas aquí</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}
                    </motion.div>
                )}
            </div>
        </>
    )
}

export default Metricas