import { useState, useEffect, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import axios from "axios"
import { ThemeContext } from "../context/ThemeContext"

const coloresActivos = {
    columnas: { "POR_HACER": "bg-red-50/60 dark:bg-red-900/10 border-red-200 dark:border-red-500/30", "EN_PROCESO": "bg-yellow-50/60 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-500/30", "TERMINADO": "bg-green-50/60 dark:bg-green-900/10 border-green-200 dark:border-green-500/30" },
    gradientes: { "POR_HACER": "dark:bg-gradient-to-b dark:from-red-500/20 dark:to-red-500/5", "EN_PROCESO": "dark:bg-gradient-to-b dark:from-yellow-500/20 dark:to-yellow-500/5", "TERMINADO": "dark:bg-gradient-to-b dark:from-green-500/20 dark:to-green-500/5" },
    puntos: { "POR_HACER": "bg-red-400", "EN_PROCESO": "bg-yellow-400", "TERMINADO": "bg-green-400" }
}

const infoColumnas = [ 
    { id: "POR_HACER", titulo: "Por Hacer" }, 
    { id: "EN_PROCESO", titulo: "En Proceso" }, 
    { id: "TERMINADO", titulo: "Terminado" } 
]

function TableroProyecto() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { darkMode } = useContext(ThemeContext)
    const token = localStorage.getItem("token")
    const emailUsuario = localStorage.getItem("email")

    // 🔒 VERIFICACIÓN PREMIUM
    const suscripcion = localStorage.getItem("suscripcion") || "INACTIVO"
    const esPremium = suscripcion === "ACTIVO"

    const [proyecto, setProyecto] = useState(null)
    const [miembros, setMiembros] = useState([])
    const [tareas, setTareas] = useState({
        POR_HACER: [],
        EN_PROCESO: [],
        TERMINADO: []
    })
    
    const [nuevaTarea, setNuevaTarea] = useState({
        nombre: "",
        descripcion: "",
        fechaInicio: "",
        fechaLimite: "",
        emailAsignadoA: ""
    })

    useEffect(() => {
        cargarDatos()
    }, [id])

    const cargarDatos = async () => {
        try {
            const [resTareas, resMiembros] = await Promise.all([
                axios.get(`http://localhost:8080/api/tareas-proyecto/proyecto/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`http://localhost:8080/api/proyectos/miembros/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ])

            const nuevasTareas = { POR_HACER: [], EN_PROCESO: [], TERMINADO: [] }
            if (Array.isArray(resTareas.data)) {
                resTareas.data.forEach(tarea => {
                    if (tarea && tarea.estado && nuevasTareas[tarea.estado]) {
                        nuevasTareas[tarea.estado].push({
                            id: String(tarea.id),
                            nombre: tarea.nombre || "Sin nombre",
                            descripcion: tarea.descripcion || "",
                            fechaInicio: tarea.fechaInicio || "",
                            fechaLimite: tarea.fechaLimite || "",
                            asignadoA: tarea.asignadoA || null
                        })
                    }
                })
            }
            setTareas(nuevasTareas)

            if (Array.isArray(resMiembros.data)) {
                setMiembros(resMiembros.data)
                const miProyecto = resMiembros.data[0]?.proyecto
                if (miProyecto) setProyecto(miProyecto)
            }
        } catch (error) {
            console.error("Error cargando datos:", error)
        }
    }

    const onDragEnd = async (result) => {
        const { source, destination } = result
        if (!destination) return
        if (source.droppableId === destination.droppableId && source.index === destination.index) return

        const origen = [...tareas[source.droppableId]]
        const destino = source.droppableId === destination.droppableId ? origen : [...tareas[destination.droppableId]]
        const [tarea] = origen.splice(source.index, 1)
        destino.splice(destination.index, 0, tarea)

        setTareas(prev => ({
            ...prev,
            [source.droppableId]: origen,
            [destination.droppableId]: destino
        }))

        try {
            await axios.patch(
                `http://localhost:8080/api/tareas-proyecto/${tarea.id}/estado?nuevoEstado=${destination.droppableId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            )
        } catch (error) {
            console.error("Error actualizando estado:", error)
        }
    }

    const crearTarea = async (e) => {
        e.preventDefault() 
        if (!nuevaTarea.nombre || !nuevaTarea.fechaInicio || !nuevaTarea.fechaLimite) return
        
        try {
            await axios.post(`http://localhost:8080/api/tareas-proyecto/crear/${id}`, nuevaTarea, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setNuevaTarea({ nombre: "", descripcion: "", fechaInicio: "", fechaLimite: "", emailAsignadoA: "" })
            cargarDatos()
        } catch (error) {
            console.error("Error creando tarea:", error)
        }
    }

    const eliminarTarea = async (tareaId) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar esta tarea permanentemente?")) return
        
        try {
            await axios.delete(`http://localhost:8080/api/tareas-proyecto/eliminar/${tareaId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            cargarDatos() 
        } catch (error) {
            console.error("Error al eliminar la tarea:", error)
            alert("No se pudo eliminar la tarea.")
        }
    }

    const copiarLinkCliente = () => {
        const tokenDemo = proyecto?.tokenPublico || `demo-proyecto-${id}`
        const url = `${window.location.origin}/shared/proyecto/${tokenDemo}`
        navigator.clipboard.writeText(url)
        alert(`✅ ¡Enlace copiado al portapapeles!\n\nEnvíale este enlace a tu cliente:\n${url}`)
    }

    const descargarReporte = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/reportes/proyecto/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            })
            
            const url = window.URL.createObjectURL(new Blob([res.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `Reporte_${proyecto?.nombre || 'Proyecto'}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.parentNode.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error("Error descargando el reporte:", error)
            alert("Hubo un problema al generar el reporte PDF.")
        }
    }

    return (
        <div className={`${darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"} min-h-screen transition-colors duration-300`}>
            <Navbar />

            {darkMode && (
                <>
                    <div className="fixed w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl top-0 right-0 pointer-events-none"></div>
                    <div className="fixed w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl bottom-0 left-0 pointer-events-none"></div>
                </>
            )}

            <div className="p-6 relative z-10 max-w-7xl mx-auto">

                {/* Header Superior */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => navigate("/proyectos")}
                            className={`px-3 py-2 rounded-xl text-sm transition-all font-medium ${darkMode ? "bg-gray-900 hover:bg-gray-800 text-gray-400" : "bg-white border border-gray-200 text-gray-600 shadow-sm"}`}
                        >
                            ← Volver
                        </motion.button>
                        <div>
                            <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                                {proyecto?.nombre || "Tablero del Proyecto"}
                            </h1>
                            <p className={`mt-1 font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{proyecto?.descripcion}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">

                        {/* 📄 Botón Exportar PDF — solo premium */}
                        {esPremium ? (
                            <motion.button 
                                whileHover={{ scale: 1.02 }} 
                                onClick={descargarReporte} 
                                className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-sm font-bold flex items-center gap-2"
                            >
                                <span>📄</span> Exportar PDF
                            </motion.button>
                        ) : (
                            <motion.button 
                                whileHover={{ scale: 1.02 }} 
                                onClick={() => navigate("/plan")}
                                title="Función exclusiva Premium — haz clic para ver planes"
                                className={`px-4 py-2 rounded-xl border border-dashed text-sm font-bold flex items-center gap-2 transition-all ${
                                    darkMode 
                                        ? "border-gray-700 bg-gray-900/50 text-gray-500 hover:border-gray-500 hover:text-gray-400" 
                                        : "border-gray-300 bg-gray-50 text-gray-400 hover:border-gray-400"
                                }`}
                            >
                                <span>🔒</span> Exportar PDF
                            </motion.button>
                        )}

                        {/* 🔗 Botón Link Cliente — solo premium */}
                        {esPremium ? (
                            <motion.button 
                                whileHover={{ scale: 1.02 }} 
                                onClick={copiarLinkCliente} 
                                className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-500 hover:bg-purple-500 hover:text-white transition-all text-sm font-bold flex items-center gap-2"
                            >
                                <span>🔗</span> Link Cliente
                            </motion.button>
                        ) : (
                            <motion.button 
                                whileHover={{ scale: 1.02 }} 
                                onClick={() => navigate("/plan")}
                                title="Función exclusiva Premium — haz clic para ver planes"
                                className={`px-4 py-2 rounded-xl border border-dashed text-sm font-bold flex items-center gap-2 transition-all ${
                                    darkMode 
                                        ? "border-gray-700 bg-gray-900/50 text-gray-500 hover:border-gray-500 hover:text-gray-400" 
                                        : "border-gray-300 bg-gray-50 text-gray-400 hover:border-gray-400"
                                }`}
                            >
                                <span>🔒</span> Link Cliente
                            </motion.button>
                        )}
                        
                        <div className="flex -space-x-2 border-l border-gray-700 pl-4">
                            {miembros.slice(0, 4).map((m, i) => {
                                const nombre = m.usuario?.nombre || m.nombre || "?"
                                return (
                                    <div
                                        key={i}
                                        className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full border-2 border-gray-950 flex items-center justify-center text-white text-sm font-bold shadow-md"
                                        title={nombre}
                                    >
                                        {nombre.charAt(0).toUpperCase()}
                                    </div>
                                )
                            })}
                            {miembros.length > 4 && (
                                <div className="w-10 h-10 bg-gray-800 rounded-full border-2 border-gray-950 flex items-center justify-center text-gray-400 text-sm font-bold shadow-md">
                                    +{miembros.length - 4}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* FORMULARIO CREAR TAREA */}
                <motion.form 
                    onSubmit={crearTarea}
                    className={`w-full mb-10 p-6 rounded-3xl border backdrop-blur-xl shadow-lg transition-all ${
                        darkMode ? "bg-gray-900/40 border-white/10" : "bg-white border-gray-200"
                    }`}
                >
                    <div className="flex flex-col gap-5">
                        
                        <div className="flex flex-col md:flex-row gap-4">
                            <input 
                                type="text" placeholder="✨ Nombre de la Tarea..." 
                                value={nuevaTarea.nombre} onChange={(e) => setNuevaTarea({...nuevaTarea, nombre: e.target.value})} 
                                className={`flex-1 px-5 py-3 rounded-2xl border text-base font-medium outline-none transition-all ${darkMode ? "bg-gray-950/80 border-gray-700 focus:border-cyan-500 text-white placeholder-gray-500" : "bg-gray-50 border-gray-300 focus:border-cyan-500 text-gray-900 placeholder-gray-400"}`} 
                                required 
                            />
                            <input 
                                type="text" placeholder="📝 Descripción (opcional)..." 
                                value={nuevaTarea.descripcion} onChange={(e) => setNuevaTarea({...nuevaTarea, descripcion: e.target.value})} 
                                className={`flex-1 px-5 py-3 rounded-2xl border text-sm font-medium outline-none transition-all ${darkMode ? "bg-gray-950/80 border-gray-700 focus:border-cyan-500 text-white placeholder-gray-500" : "bg-gray-50 border-gray-300 focus:border-cyan-500 text-gray-900 placeholder-gray-400"}`} 
                            />
                        </div>

                        <div className="flex flex-wrap lg:flex-nowrap items-center gap-4">
                            
                            <div className={`flex items-center gap-1.5 px-4 py-3 rounded-2xl border transition-all focus-within:border-cyan-500 w-full lg:w-auto ${darkMode ? "bg-gray-950/80 border-gray-700" : "bg-gray-50 border-gray-300"}`}>
                                <span className="text-lg">📅</span>
                                <input 
                                    type="date" title="Fecha de inicio"
                                    value={nuevaTarea.fechaInicio} onChange={(e) => setNuevaTarea({...nuevaTarea, fechaInicio: e.target.value})} 
                                    className="bg-transparent font-bold outline-none cursor-pointer text-sm w-[110px]"
                                    style={{ colorScheme: darkMode ? "dark" : "light" }}
                                    required 
                                />
                                <span className="font-bold text-gray-400 mx-1">→</span>
                                <input 
                                    type="date" title="Fecha Límite"
                                    value={nuevaTarea.fechaLimite} onChange={(e) => setNuevaTarea({...nuevaTarea, fechaLimite: e.target.value})} 
                                    className="bg-transparent font-bold outline-none cursor-pointer text-sm w-[110px]"
                                    style={{ colorScheme: darkMode ? "dark" : "light" }} 
                                    required 
                                />
                            </div>

                            <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all focus-within:border-cyan-500 flex-1 w-full lg:w-auto ${darkMode ? "bg-gray-950/80 border-gray-700" : "bg-gray-50 border-gray-300"}`}>
                                <span className="text-lg">👤</span>
                                <select 
                                    value={nuevaTarea.emailAsignadoA} 
                                    onChange={(e) => setNuevaTarea({...nuevaTarea, emailAsignadoA: e.target.value})} 
                                    className={`bg-transparent font-bold outline-none cursor-pointer w-full text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
                                >
                                    <option value="" className={darkMode ? "bg-gray-900" : "bg-white"}>Sin asignar</option>
                                    {miembros.map((m) => {
                                        const nombre = m.usuario?.nombre || m.nombre
                                        const email = m.usuario?.email || m.email
                                        return (
                                            <option key={m.id || email} value={email} className={darkMode ? "bg-gray-900" : "bg-white"}>
                                                {nombre} {email === emailUsuario ? "(Tú)" : ""}
                                            </option>
                                        )
                                    })}
                                </select>
                            </div>

                            <motion.button 
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" 
                                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-cyan-500/20 w-full lg:w-auto shrink-0 transition-all"
                            >
                                Añadir Tarea
                            </motion.button>
                        </div>
                    </div>
                </motion.form>

                {/* Tablero Kanban */}
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {infoColumnas.map((columna) => (
                            <div key={columna.id} className={`border rounded-2xl p-4 transition-all duration-300 ${coloresActivos.columnas[columna.id]} ${coloresActivos.gradientes[columna.id]}`}>
                                
                                <div className="flex items-center gap-2 mb-4">
                                    <div className={`w-3 h-3 rounded-full ${coloresActivos.puntos[columna.id]}`}></div>
                                    <h2 className={`font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>{columna.titulo}</h2>
                                    <span className={`ml-auto text-xs px-2.5 py-1 rounded-full font-medium shadow-sm ${darkMode ? "bg-gray-800 text-gray-400" : "bg-white text-gray-600"}`}>
                                        {tareas[columna.id].length}
                                    </span>
                                </div>

                                <Droppable droppableId={columna.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`min-h-[200px] space-y-3 rounded-xl transition-all duration-300 ${snapshot.isDraggingOver ? "bg-cyan-500/5 p-2" : ""}`}
                                        >
                                            <AnimatePresence>
                                                {tareas[columna.id].map((tarea, index) => (
                                                    <Draggable key={tarea.id} draggableId={tarea.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 20 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    className={`border rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all duration-300
                                                                        ${snapshot.isDragging ? "border-cyan-500 shadow-xl shadow-cyan-500/20 rotate-2 scale-105" : darkMode ? "bg-gray-900 border-gray-700 hover:border-cyan-500/50" : "bg-white border-gray-200 shadow-sm hover:border-cyan-500/30"}`}
                                                                >
                                                                    <div className="flex items-start justify-between mb-1">
                                                                        <h3 className={`font-semibold text-sm leading-snug flex items-center ${darkMode ? "text-white" : "text-gray-800"} ${columna.id === "TERMINADO" ? "line-through opacity-50" : ""}`}>
                                                                            {tarea.nombre}
                                                                        </h3>
                                                                        
                                                                        <div className="flex items-center gap-2">
                                                                            <button 
                                                                                onClick={() => eliminarTarea(tarea.id)}
                                                                                className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-500/10"
                                                                                title="Eliminar tarea"
                                                                            >
                                                                                🗑️
                                                                            </button>
                                                                            <span className="text-gray-400/50 text-xs ml-1 cursor-grab" title="Arrastrar">⠿</span>
                                                                        </div>
                                                                    </div>

                                                                    {tarea.descripcion && (
                                                                        <p className={`text-xs mt-1 mb-3 line-clamp-2 leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                                            {tarea.descripcion}
                                                                        </p>
                                                                    )}

                                                                    <div className="flex items-center gap-1.5 mb-2 mt-3">
                                                                        <span className="text-[11px] bg-cyan-500/10 text-cyan-500 rounded-md px-1.5 py-0.5">📅</span>
                                                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                                            {tarea.fechaInicio?.substring(5)} → {tarea.fechaLimite?.substring(5)}
                                                                        </span>
                                                                    </div>

                                                                    {tarea.asignadoA && (
                                                                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700/60">
                                                                            <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-md shadow-cyan-500/20">
                                                                                {tarea.asignadoA?.nombre ? tarea.asignadoA.nombre.charAt(0).toUpperCase() : "?"}
                                                                            </div>
                                                                            <span className={`text-[11px] font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                                                                                {tarea.asignadoA?.nombre}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </motion.div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                            </AnimatePresence>
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        ))}
                    </div>
                </DragDropContext>
            </div>
        </div>
    )
}

export default TableroProyecto