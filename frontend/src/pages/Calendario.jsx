import { useState, useEffect, useContext } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import axios from "axios"
import { ThemeContext } from "../context/ThemeContext"

function Calendario(){
    const [vista, setVista] = useState("mes")
    const [fechaActual, setFechaActual] = useState(new Date())
    const [todasLasTareas, setTodasLasTareas] = useState([])
    const [rachaActual, setRachaActual] = useState(0)
    
    const { darkMode } = useContext(ThemeContext)
    const navigate = useNavigate()
    const hoy = new Date()
    const token = localStorage.getItem("token")

    const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
                   "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
    const diasSemana = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"]
    const horas = Array.from({length: 16}, (_, i) => i + 7) 

    const formatearFecha = (año, mes, dia) => {
        return `${año}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`
    }

    const irAlTablero = (dia) => {
        if (!dia) return
        const fecha = formatearFecha(fechaActual.getFullYear(), fechaActual.getMonth(), dia)
        navigate(`/tablero/${fecha}`)
    }

    const cargarTodasLasTareas = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/tarea/todas`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setTodasLasTareas(response.data)
        } catch (error) {
            console.error("Error al cargar tareas:", error)
        }
    }

    const cargarMetricas = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/metricas/personales", {
                headers: { Authorization: `Bearer ${token}` }
            })
            setRachaActual(res.data.rachaActual || 0)
        } catch (error) {
            console.error("Error cargando métricas:", error)
        }
    }

    useEffect(() => {
        cargarTodasLasTareas()
        cargarMetricas()
    }, [])

    const getTareasParaDia = (diaObj) => {
        if (!diaObj) return []
        
        return todasLasTareas.filter(t => {
            if(!t.fechaInicio) return false;
            
            const fInicio = new Date(t.fechaInicio)
            
            if (t.esRecurrente && t.diasRecurrencia) {
                const inicioLimpio = new Date(fInicio.getFullYear(), fInicio.getMonth(), fInicio.getDate())
                const actualLimpio = new Date(diaObj.getFullYear(), diaObj.getMonth(), diaObj.getDate())
                
                if (actualLimpio >= inicioLimpio) {
                    const mapDias = ["D", "L", "M", "X", "J", "V", "S"]
                    const letraActual = mapDias[diaObj.getDay()]
                    return t.diasRecurrencia.includes(letraActual)
                }
                return false
            } else {
                return fInicio.getFullYear() === diaObj.getFullYear() && 
                       fInicio.getMonth() === diaObj.getMonth() && 
                       fInicio.getDate() === diaObj.getDate()
            }
        })
    }

    const getDiasDelMes = () => {
        const año = fechaActual.getFullYear()
        const mes = fechaActual.getMonth()
        const primerDia = new Date(año, mes, 1).getDay()
        const totalDias = new Date(año, mes + 1, 0).getDate()
        const dias = []
        for(let i = 0; i < primerDia; i++) dias.push(null)
        for(let i = 1; i <= totalDias; i++) dias.push(i)
        return dias
    }

    const getDiasSemana = () => {
        const inicio = new Date(fechaActual)
        const dia = inicio.getDay()
        inicio.setDate(inicio.getDate() - dia)
        return Array.from({length: 7}, (_, i) => {
            const d = new Date(inicio)
            d.setDate(inicio.getDate() + i)
            return d
        })
    }

    const esHoy = (fecha) => {
        return fecha.getDate() === hoy.getDate() &&
               fecha.getMonth() === hoy.getMonth() &&
               fecha.getFullYear() === hoy.getFullYear()
    }

    const navegarAnterior = () => {
        if (vista === "mes") setFechaActual(new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 1))
        else if (vista === "semana") { const nueva = new Date(fechaActual); nueva.setDate(nueva.getDate() - 7); setFechaActual(nueva) }
        else { const nueva = new Date(fechaActual); nueva.setDate(nueva.getDate() - 1); setFechaActual(nueva) }
    }

    const navegarSiguiente = () => {
        if (vista === "mes") setFechaActual(new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1))
        else if (vista === "semana") { const nueva = new Date(fechaActual); nueva.setDate(nueva.getDate() + 7); setFechaActual(nueva) }
        else { const nueva = new Date(fechaActual); nueva.setDate(nueva.getDate() + 1); setFechaActual(nueva) }
    }

    const tareasDeHoyVistaDia = getTareasParaDia(fechaActual)

    return (
        <div className={`${darkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen transition-colors duration-300 overflow-y-scroll`}>
            <Navbar />

            <div className="p-6 max-w-7xl mx-auto w-full">
                
                {/* Header Superior Fijo */}
                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 mb-6 min-h-[60px]">
                    
                    {/* Racha */}
                    <div className="flex items-center gap-4 justify-start">
                        <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
                            <span className="text-xl">🔥</span>
                            <span className="font-bold text-sm">{rachaActual} días</span>
                        </div>
                    </div>

                    {/* Selector de Vista */}
                    <div className="flex justify-center">
                        <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-xl p-1 flex transition-colors w-max`}>
                            {["mes","semana","dia"].map((v) => (
                                <motion.button
                                    key={v}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setVista(v)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                                        ${vista === v 
                                            ? "bg-cyan-500 text-gray-950 font-bold" 
                                            : darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
                                >
                                    {v === "dia" ? "Día" : v.charAt(0).toUpperCase() + v.slice(1)}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Botones de Navegación y Mes Dinámico */}
                    <div className="flex items-center justify-end gap-2">
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={navegarAnterior} className={`px-3 py-2 rounded-xl font-bold ${darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-100'}`}>‹</motion.button>
                        
                        {/* 🌟 BOTÓN DINÁMICO QUE MUESTRA EL MES Y AÑO 🌟 */}
                        <motion.button 
                            whileHover={{ scale: 1.05 }} 
                            onClick={() => setFechaActual(new Date())} 
                            className={`px-4 py-2 rounded-xl text-sm font-bold min-w-[150px] transition-all ${
                                darkMode ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'bg-cyan-50 text-cyan-600 border border-cyan-200'
                            }`}
                        >
                            {meses[fechaActual.getMonth()]} {fechaActual.getFullYear()}
                        </motion.button>
                        
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={navegarSiguiente} className={`px-3 py-2 rounded-xl font-bold ${darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-100'}`}>›</motion.button>
                    </div>
                </div>

                {/* VISTA MES */}
                {vista === "mes" && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <div className="grid grid-cols-7 mb-2">
                            {diasSemana.map((dia) => (
                                <div key={dia} className="text-center text-gray-500 text-sm py-2 font-medium">{dia}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {getDiasDelMes().map((dia, index) => {
                                const diaObj = dia ? new Date(fechaActual.getFullYear(), fechaActual.getMonth(), dia) : null
                                const tareasDelDia = getTareasParaDia(diaObj)

                                return (
                                    <motion.div
                                        key={index}
                                        whileHover={dia ? { scale: 1.03 } : {}}
                                        onClick={() => irAlTablero(dia)}
                                        className={`min-h-24 p-2 rounded-xl border cursor-pointer transition-all duration-300
                                            ${dia 
                                                ? darkMode ? "border-gray-800 hover:border-cyan-500/50 hover:bg-cyan-500/5" : "border-gray-200 hover:border-cyan-500/50 hover:bg-cyan-500/5" 
                                                : "border-transparent cursor-default"}
                                            ${dia && esHoy(diaObj) ? "border-cyan-500 bg-cyan-500/10" : ""}`}
                                    >
                                        {dia && (
                                            <div className="flex flex-col h-full w-full relative">
                                                <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                                                    ${esHoy(diaObj) ? "bg-cyan-500 text-gray-950 font-bold" : darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                                    {dia}
                                                </span>
                                                
                                                {tareasDelDia.length > 0 && (
                                                    <div className="flex gap-1 justify-center mt-auto pb-1 flex-wrap">
                                                        {tareasDelDia.slice(0, 3).map((t, i) => (
                                                            <div key={i} className="w-2 h-2 rounded-full bg-cyan-400" title={t.nombre}></div>
                                                        ))}
                                                        {tareasDelDia.length > 3 && (
                                                            <span className="text-[9px] text-cyan-500 font-bold leading-none">+{tareasDelDia.length - 3}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                )
                            })}
                        </div>
                    </motion.div>
                )}

                {/* VISTA SEMANA */}
                {vista === "semana" && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="overflow-x-auto w-full">
                        <div className="min-w-[800px]">
                            <div className="grid grid-cols-8 mb-2">
                                <div className="text-gray-600 text-sm p-2"></div>
                                {getDiasSemana().map((dia, index) => {
                                    const tareasDelDia = getTareasParaDia(dia)
                                    return (
                                        <motion.div
                                            key={index}
                                            whileHover={{ scale: 1.05 }}
                                            onClick={() => irAlTablero(dia.getDate())}
                                            className={`text-center p-2 rounded-xl cursor-pointer transition-all flex flex-col items-center
                                                ${esHoy(dia) 
                                                    ? "bg-cyan-500/20 border border-cyan-500/30" 
                                                    : darkMode ? "hover:bg-gray-800" : "hover:bg-gray-200"}`}
                                        >
                                            <div className="text-gray-400 text-xs">{diasSemana[dia.getDay()]}</div>
                                            <div className={`text-lg font-bold mt-1 ${esHoy(dia) ? "text-cyan-400" : darkMode ? "text-white" : "text-gray-900"}`}>{dia.getDate()}</div>
                                            
                                            <div className="flex gap-1 mt-1 h-2">
                                                {tareasDelDia.slice(0, 3).map((t, i) => (
                                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400" title={t.nombre}></div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>

                            <div className={`border ${darkMode ? 'border-gray-800' : 'border-gray-200'} rounded-2xl overflow-hidden`}>
                                {horas.map((hora) => (
                                    <div key={hora} className={`grid grid-cols-8 border-b ${darkMode ? 'border-gray-800/50' : 'border-gray-200/50'} min-h-16`}>
                                        <div className={`text-xs p-2 border-r ${darkMode ? 'border-gray-800/50 text-gray-600' : 'border-gray-200/50 text-gray-400'} flex items-start`}>{hora}:00</div>
                                        {getDiasSemana().map((dia, index) => {
                                            const tareasDelDia = getTareasParaDia(dia);
                                            return (
                                                <motion.div
                                                    key={index}
                                                    whileHover={{ backgroundColor: "rgba(6,182,212,0.05)" }}
                                                    onClick={() => irAlTablero(dia.getDate())}
                                                    className={`border-r ${darkMode ? 'border-gray-800/50' : 'border-gray-200/50'} cursor-pointer transition-all ${esHoy(dia) ? (darkMode ? "bg-cyan-500/10" : "bg-cyan-500/5") : ""} p-1 relative flex flex-col gap-1`}
                                                >
                                                    {tareasDelDia.map((tarea, i) => {
                                                        const horaInicio = new Date(tarea.fechaInicio).getHours();
                                                        if (horaInicio === hora) {
                                                            return (
                                                                <div 
                                                                    key={`${tarea.id}-${i}`}
                                                                    className={`bg-cyan-500/20 border border-cyan-500/50 ${darkMode ? "text-cyan-400" : "text-cyan-700"} text-[10px] sm:text-xs p-1 rounded overflow-hidden leading-tight`}
                                                                    title={tarea.nombre}
                                                                >
                                                                    <span className="font-bold truncate block">{tarea.nombre}</span>
                                                                </div>
                                                            )
                                                        }
                                                        return null;
                                                    })}
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* VISTA DÍA */}
                {vista === "dia" && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                Tareas Programadas
                            </h3>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => irAlTablero(fechaActual.getDate())}
                                className="bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold px-4 py-2 rounded-xl text-sm transition-all"
                            >
                                Ver Tablero Completo →
                            </motion.button>
                        </div>

                        <div className={`border ${darkMode ? 'border-gray-800' : 'border-gray-200'} rounded-2xl overflow-hidden`}>
                            {horas.map((hora) => (
                                <div key={hora} className={`grid grid-cols-12 border-b ${darkMode ? 'border-gray-800/50' : 'border-gray-200/50'} min-h-16 transition-all`}>
                                    <div className={`col-span-2 sm:col-span-1 text-xs p-3 border-r ${darkMode ? 'text-gray-600 border-gray-800/50' : 'text-gray-400 border-gray-200/50'} flex items-start`}>
                                        {hora}:00
                                    </div>
                                    <div className="col-span-10 sm:col-span-11 p-2 relative flex flex-col gap-1">
                                        {tareasDeHoyVistaDia.map((tarea, i) => {
                                            const horaInicio = new Date(tarea.fechaInicio).getHours();
                                            if (horaInicio === hora) {
                                                return (
                                                    <div 
                                                        key={`${tarea.id}-${i}`} 
                                                        onClick={() => irAlTablero(fechaActual.getDate())} 
                                                        className={`bg-cyan-500/20 border border-cyan-500/50 ${darkMode ? "text-cyan-400" : "text-cyan-700"} p-2 rounded-lg text-sm cursor-pointer hover:bg-cyan-500/30 flex items-center justify-between`}
                                                    >
                                                        <span className="font-bold">{tarea.nombre}</span>
                                                        {tarea.esRecurrente && <span title="Tarea Recurrente">🔄</span>}
                                                    </div>
                                                )
                                            }
                                            return null;
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

export default Calendario