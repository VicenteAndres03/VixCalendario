import { useState, useEffect, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Navbar from "../components/Navbar"
import axios from "axios"
import { ThemeContext } from "../context/ThemeContext"

function Habitos() {
    const { darkMode } = useContext(ThemeContext)
    const token = localStorage.getItem("token")
    const [habitos, setHabitos] = useState([])
    const [nuevoHabito, setNuevoHabito] = useState("")

    // Generamos un arreglo con los últimos 90 días para el Heatmap
    const diasHeatmap = Array.from({ length: 90 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (89 - i))
        return d.toISOString().split("T")[0] // "YYYY-MM-DD"
    })

    const hoyFormateado = new Date().toISOString().split("T")[0]

    useEffect(() => {
        cargarHabitos()
    }, [])

    const cargarHabitos = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/habitos", {
                headers: { Authorization: `Bearer ${token}` }
            })
            setHabitos(res.data)
        } catch (error) { console.error("Error cargando hábitos", error) }
    }

    const handleCrearHabito = async (e) => {
        e.preventDefault()
        if (!nuevoHabito.trim()) return
        try {
            await axios.post("http://localhost:8080/api/habitos", { nombre: nuevoHabito }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setNuevoHabito("")
            cargarHabitos()
        } catch (error) { console.error("Error creando hábito", error) }
    }

    const toggleHabito = async (habitoId, fecha) => {
        try {
            await axios.patch(`http://localhost:8080/api/habitos/${habitoId}/toggle?fecha=${fecha}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            cargarHabitos() // Recargamos para ver el cuadro pintado
        } catch (error) { console.error("Error al marcar hábito", error) }
    }

    const eliminarHabito = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar este hábito y todo su historial?")) return
        try {
            await axios.delete(`http://localhost:8080/api/habitos/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            cargarHabitos()
        } catch (error) { console.error("Error eliminando", error) }
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
            <Navbar />

            {/* Efecto visual de fondo premium */}
            {darkMode && <div className="fixed w-[600px] h-[600px] bg-green-500/5 rounded-full blur-3xl top-[-10%] right-[-10%] pointer-events-none"></div>}

            <div className="p-6 max-w-5xl mx-auto pb-20 relative z-10">
                <div className="mb-10 text-center">
                    <span className="text-4xl mb-4 block">🌱</span>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2">Hábitos y Rutinas</h1>
                    <p className={`text-lg font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Lo que haces todos los días define quién serás mañana.
                    </p>
                </div>

                {/* BARRA DE CREACIÓN */}
                <motion.form 
                    onSubmit={handleCrearHabito}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`mb-12 p-2 rounded-2xl flex items-center gap-2 border shadow-lg ${darkMode ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"}`}
                >
                    <input 
                        type="text" 
                        value={nuevoHabito} 
                        onChange={(e) => setNuevoHabito(e.target.value)} 
                        placeholder="Ej. Leer 10 páginas, Tomar 2L de agua, Ir al gimnasio..."
                        className={`flex-1 px-4 py-3 bg-transparent border-none outline-none font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                    />
                    <button type="submit" className="bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-green-500/20">
                        Crear Hábito
                    </button>
                </motion.form>

                {/* LISTADO Y MAPA DE CALOR */}
                <div className="space-y-8">
                    <AnimatePresence>
                        {habitos.map((habito) => {
                            const completadoHoy = habito.fechasCompletadas.includes(hoyFormateado)
                            
                            return (
                                <motion.div 
                                    key={habito.id}
                                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                    className={`p-6 rounded-3xl border shadow-xl ${darkMode ? "bg-gray-900/80 border-gray-800" : "bg-white border-gray-200"}`}
                                >
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                                        <div className="flex items-center gap-4">
                                            {/* BOTÓN GIGANTE DE HOY */}
                                            <button 
                                                onClick={() => toggleHabito(habito.id, hoyFormateado)}
                                                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${
                                                    completadoHoy 
                                                    ? "bg-green-500 text-white shadow-lg shadow-green-500/30 rotate-12 scale-110" 
                                                    : darkMode ? "bg-gray-800 text-gray-500 hover:bg-gray-700" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                                }`}
                                            >
                                                {completadoHoy ? "✓" : "O"}
                                            </button>
                                            
                                            <div>
                                                <h2 className="text-xl font-bold">{habito.nombre}</h2>
                                                <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                    {habito.fechasCompletadas.length} días completados en total
                                                </p>
                                            </div>
                                        </div>

                                        <button onClick={() => eliminarHabito(habito.id)} className="text-gray-400 hover:text-red-500 p-2 rounded-xl transition-all hover:bg-red-500/10">
                                            🗑️ Eliminar
                                        </button>
                                    </div>

                                    {/* 🔥 EL MAPA DE CALOR ESTILO GITHUB 🔥 */}
                                    <div className={`p-4 rounded-xl border ${darkMode ? "bg-gray-950/50 border-gray-800" : "bg-gray-50 border-gray-200"}`}>
                                        <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                                            Tus últimos 90 días
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {diasHeatmap.map(dia => {
                                                const completado = habito.fechasCompletadas.includes(dia);
                                                const esHoy = dia === hoyFormateado;
                                                return (
                                                    <div 
                                                        key={dia}
                                                        onClick={() => toggleHabito(habito.id, dia)}
                                                        title={`${dia} ${completado ? '(Completado)' : ''}`}
                                                        className={`w-[14px] h-[14px] rounded-[3px] cursor-pointer transition-colors ${
                                                            completado 
                                                                ? "bg-green-500 hover:bg-green-400 shadow-sm shadow-green-500/20" 
                                                                : darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-200 hover:bg-gray-300"
                                                        } ${esHoy && !completado ? "ring-2 ring-cyan-500 ring-offset-1 dark:ring-offset-gray-900" : ""}`}
                                                    />
                                                )
                                            })}
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>

                    {habitos.length === 0 && (
                        <div className={`text-center py-20 border border-dashed rounded-3xl ${darkMode ? "border-gray-800" : "border-gray-300"}`}>
                            <p className="text-6xl mb-4 opacity-50">🌱</p>
                            <h3 className="text-xl font-bold mb-2">Aún no tienes hábitos</h3>
                            <p className={darkMode ? "text-gray-500" : "text-gray-400"}>Crea tu primer hábito arriba para empezar tu nueva rutina.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Habitos