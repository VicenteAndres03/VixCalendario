import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { motion } from "framer-motion"
import logoVix from "../assets/hero.png"
import axios from "axios"

function TableroPublico() {
    const { tokenPublico } = useParams()
    const [nombreProyecto, setNombreProyecto] = useState("Cargando Proyecto...")
    const [tareas, setTareas] = useState({ POR_HACER: [], EN_PROCESO: [], TERMINADO: [] })
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(false)

    // Para esta vista pública forzamos el modo oscuro por estética premium, o puedes adaptarlo
    const darkMode = true 

    useEffect(() => {
        const cargarDatosPublicos = async () => {
            try {
                setCargando(true)
                const res = await axios.get(`http://localhost:8080/api/public/proyectos/${tokenPublico}`)
                
                setNombreProyecto(res.data.nombreProyecto || "Tablero de Cliente")
                
                // Clasificamos las tareas que nos envíe el backend
                const clasificadas = { POR_HACER: [], EN_PROCESO: [], TERMINADO: [] }
                if (res.data.tareas) {
                    res.data.tareas.forEach(t => {
                        if (clasificadas[t.estado]) clasificadas[t.estado].push(t)
                    })
                } else {
                    // Simulación inicial de muestra por si estás probando la vista
                    clasificadas.POR_HACER = [{ id: 1, nombre: "Diseño de Interfaz", descripcion: "Revisar paleta de colores con el cliente" }]
                    clasificadas.EN_PROCESO = [{ id: 2, nombre: "Desarrollo del Backend", descripcion: "Integración de endpoints públicos" }]
                    clasificadas.TERMINADO = [{ id: 3, nombre: "Configuración inicial", descripcion: "Estructura del repositorio" }]
                }
                
                setTareas(clasificadas)
                setError(false)
            } catch (err) {
                console.error(err)
                setError(true)
            } finally {
                setCargando(false)
            }
        }

        cargarDatosPublicos()
    }, [tokenPublico])

    if (error) {
        return (
            <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
                <span className="text-6xl mb-4">🔒</span>
                <h1 className="text-2xl font-bold mb-2">Enlace no válido o expirado</h1>
                <p className="text-gray-400 text-center max-w-sm">Este enlace de seguimiento ya no está disponible o el token público es incorrecto.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white transition-all pb-12">
            
            {/* Encabezado especial para el Cliente (Sin botones de navegación privada) */}
            <header className="w-full border-b border-white/10 bg-gray-900/40 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src={logoVix} alt="Vix" className="h-9 w-auto" />
                    <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Vix-Flow Portal</span>
                </div>
                <div className="px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    Vista de Cliente
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 pt-10">
                
                {/* Título del Proyecto Compartido */}
                <div className="mb-10">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-1">Seguimiento de Avances</span>
                    <h1 className="text-3xl font-extrabold tracking-tight">{nombreProyecto}</h1>
                </div>

                {/* Grid Kanban Estricto de Solo Lectura */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Columna: Por Hacer */}
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-5 bg-gradient-to-b from-red-500/5 to-transparent">
                        <div className="flex items-center gap-2 mb-4 font-bold text-gray-300 border-b border-white/5 pb-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                            <h2>Por Hacer</h2>
                            <span className="ml-auto text-xs px-2 py-0.5 rounded-md bg-white/5 text-gray-400">{tareas.POR_HACER.length}</span>
                        </div>
                        <div className="space-y-3">
                            {tareas.POR_HACER.map(t => <TarjetaPublica key={t.id} tarea={t} />)}
                        </div>
                    </div>

                    {/* Columna: En Proceso */}
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-5 bg-gradient-to-b from-yellow-500/5 to-transparent">
                        <div className="flex items-center gap-2 mb-4 font-bold text-gray-300 border-b border-white/5 pb-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                            <h2>En Marcha</h2>
                            <span className="ml-auto text-xs px-2 py-0.5 rounded-md bg-white/5 text-gray-400">{tareas.EN_PROCESO.length}</span>
                        </div>
                        <div className="space-y-3">
                            {tareas.EN_PROCESO.map(t => <TarjetaPublica key={t.id} tarea={t} />)}
                        </div>
                    </div>

                    {/* Columna: Terminado */}
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-5 bg-gradient-to-b from-green-500/5 to-transparent">
                        <div className="flex items-center gap-2 mb-4 font-bold text-gray-300 border-b border-white/5 pb-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                            <h2>Completado</h2>
                            <span className="ml-auto text-xs px-2 py-0.5 rounded-md bg-white/5 text-gray-400">{tareas.TERMINADO.length}</span>
                        </div>
                        <div className="space-y-3">
                            {tareas.TERMINADO.map(t => <TarjetaPublica key={t.id} tarea={t} />)}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

// Subcomponente interno para las tarjetas del cliente
function TarjetaPublica({ tarea }) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-gray-900/60 border border-white/5 shadow-sm"
        >
            <h4 className="font-semibold text-white text-sm leading-snug mb-1">{tarea.nombre}</h4>
            {tarea.descripcion && (
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{tarea.descripcion}</p>
            )}
        </motion.div>
    )
}

export default TableroPublico