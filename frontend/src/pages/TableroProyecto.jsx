import { useState, useEffect, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import axios from "axios"
import { ThemeContext } from "../context/ThemeContext"

function TableroProyecto() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { darkMode } = useContext(ThemeContext)
    const token = localStorage.getItem("token")
    const emailUsuario = localStorage.getItem("email")

    const [proyecto, setProyecto] = useState(null)
    const [miembros, setMiembros] = useState([])
    const [tareas, setTareas] = useState({
        POR_HACER: [],
        EN_PROCESO: [],
        TERMINADO: []
    })
    const [mostrarModal, setMostrarModal] = useState(false)
    const [nuevaTarea, setNuevaTarea] = useState({
        nombre: "",
        descripcion: "",
        fechaInicio: "",
        fechaLimite: "",
        emailAsignadoA: ""
    })

    const columnas = [
        { id: "POR_HACER", titulo: "Por Hacer", color: "from-red-500/20 to-red-500/5", borde: "border-red-500/30", punto: "bg-red-400" },
        { id: "EN_PROCESO", titulo: "En Proceso", color: "from-yellow-500/20 to-yellow-500/5", borde: "border-yellow-500/30", punto: "bg-yellow-400" },
        { id: "TERMINADO", titulo: "Terminado", color: "from-green-500/20 to-green-500/5", borde: "border-green-500/30", punto: "bg-green-400" },
    ]

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
            resTareas.data.forEach(tarea => {
                if (nuevasTareas[tarea.estado]) {
                    nuevasTareas[tarea.estado].push({
                        id: String(tarea.id),
                        nombre: tarea.nombre,
                        descripcion: tarea.descripcion,
                        fechaInicio: tarea.fechaInicio,
                        fechaLimite: tarea.fechaLimite,
                        asignadoA: tarea.asignadoA
                    })
                }
            })
            setTareas(nuevasTareas)
            setMiembros(resMiembros.data)

            const miProyecto = resMiembros.data[0]?.proyecto
            if (miProyecto) setProyecto(miProyecto)

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

    const crearTarea = async () => {
        if (!nuevaTarea.nombre || !nuevaTarea.fechaInicio || !nuevaTarea.fechaLimite) return
        try {
            await axios.post(`http://localhost:8080/api/tareas-proyecto/crear/${id}`, nuevaTarea, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setMostrarModal(false)
            setNuevaTarea({ nombre: "", descripcion: "", fechaInicio: "", fechaLimite: "", emailAsignadoA: "" })
            cargarDatos()
        } catch (error) {
            console.error("Error creando tarea:", error)
        }
    }

    return (
        <div className={`${darkMode ? "bg-gray-950" : "bg-gray-50"} min-h-screen`}>
            <Navbar />

            <div className="fixed w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl top-0 right-0 pointer-events-none"></div>
            <div className="fixed w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl bottom-0 left-0 pointer-events-none"></div>

            <div className="p-6 relative z-10">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => navigate("/proyectos")}
                            className="bg-gray-800 hover:bg-gray-700 text-gray-400 px-3 py-2 rounded-xl text-sm transition-all"
                        >
                            ← Volver
                        </motion.button>
                        <div>
                            <h1 className="text-3xl font-bold text-white">
                                {proyecto?.nombre || "Tablero del Proyecto"}
                            </h1>
                            <p className="text-gray-400 mt-1">{proyecto?.descripcion}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Avatares miembros */}
                        <div className="flex -space-x-2">
                            {miembros.slice(0, 4).map((m, i) => (
                                <div
                                    key={i}
                                    className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full border-2 border-gray-950 flex items-center justify-center text-white text-xs font-bold"
                                    title={m.usuario?.nombre}
                                >
                                    {m.usuario?.nombre?.charAt(0).toUpperCase()}
                                </div>
                            ))}
                            {miembros.length > 4 && (
                                <div className="w-8 h-8 bg-gray-700 rounded-full border-2 border-gray-950 flex items-center justify-center text-gray-400 text-xs">
                                    +{miembros.length - 4}
                                </div>
                            )}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setMostrarModal(true)}
                            className="bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold px-5 py-2 rounded-xl transition-all flex items-center gap-2 text-sm"
                        >
                            <span>+</span> Nueva Tarea
                        </motion.button>
                    </div>
                </div>

                {/* Tablero Kanban */}
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {columnas.map((columna) => (
                            <div key={columna.id} className={`bg-gradient-to-b ${columna.color} border ${columna.borde} rounded-2xl p-4`}>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className={`w-3 h-3 rounded-full ${columna.punto}`}></div>
                                    <h2 className="text-white font-bold">{columna.titulo}</h2>
                                    <span className="ml-auto bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded-full">
                                        {tareas[columna.id].length}
                                    </span>
                                </div>

                                <Droppable droppableId={columna.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`min-h-32 space-y-3 rounded-xl transition-all duration-300 ${snapshot.isDraggingOver ? "bg-cyan-500/5 p-2" : ""}`}
                                        >
                                            {tareas[columna.id].map((tarea, index) => (
                                                <Draggable key={tarea.id} draggableId={tarea.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                        >
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                className={`bg-gray-900 border rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all
                                                                    ${snapshot.isDragging
                                                                        ? "border-cyan-500 shadow-lg shadow-cyan-500/20 rotate-1 scale-105"
                                                                        : "border-gray-700 hover:border-cyan-500/50"}`}
                                                            >
                                                                <div className="flex items-start justify-between mb-2">
                                                                    <h3 className="text-white font-medium text-sm">{tarea.nombre}</h3>
                                                                    <span className="text-gray-600 text-xs ml-2">⠿</span>
                                                                </div>

                                                                {tarea.descripcion && (
                                                                    <p className="text-gray-400 text-xs mb-3">{tarea.descripcion}</p>
                                                                )}

                                                                {/* Fechas */}
                                                                <div className="flex items-center gap-1 mb-2">
                                                                    <span className="text-xs text-gray-500">📅</span>
                                                                    <span className="text-xs text-gray-500">
                                                                        {tarea.fechaInicio} → {tarea.fechaLimite}
                                                                    </span>
                                                                </div>

                                                                {/* Asignado a */}
                                                                {tarea.asignadoA && (
                                                                    <div className="flex items-center gap-2 mt-2">
                                                                        <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                                            {tarea.asignadoA?.nombre?.charAt(0).toUpperCase()}
                                                                        </div>
                                                                        <span className="text-gray-400 text-xs">{tarea.asignadoA?.nombre}</span>
                                                                    </div>
                                                                )}
                                                            </motion.div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        ))}
                    </div>
                </DragDropContext>
            </div>

            {/* Modal Nueva Tarea */}
            <AnimatePresence>
                {mostrarModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6"
                        onClick={() => setMostrarModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-gray-900 border border-cyan-500/30 rounded-2xl p-8 w-full max-w-md"
                        >
                            <h2 className="text-2xl font-bold text-cyan-400 mb-6">Nueva Tarea</h2>

                            <div className="mb-4">
                                <label className="text-gray-400 text-sm mb-1 block">Nombre</label>
                                <input
                                    type="text"
                                    value={nuevaTarea.nombre}
                                    onChange={(e) => setNuevaTarea({...nuevaTarea, nombre: e.target.value})}
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all"
                                    placeholder="Nombre de la tarea"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="text-gray-400 text-sm mb-1 block">Descripción</label>
                                <textarea
                                    value={nuevaTarea.descripcion}
                                    onChange={(e) => setNuevaTarea({...nuevaTarea, descripcion: e.target.value})}
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all resize-none"
                                    rows={2}
                                    placeholder="Descripción"
                                />
                            </div>

                            <div className="flex gap-4 mb-4">
                                <div className="w-1/2">
                                    <label className="text-gray-400 text-sm mb-1 block">Fecha inicio</label>
                                    <input
                                        type="date"
                                        value={nuevaTarea.fechaInicio}
                                        onChange={(e) => setNuevaTarea({...nuevaTarea, fechaInicio: e.target.value})}
                                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all"
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className="text-gray-400 text-sm mb-1 block">Fecha límite</label>
                                    <input
                                        type="date"
                                        value={nuevaTarea.fechaLimite}
                                        onChange={(e) => setNuevaTarea({...nuevaTarea, fechaLimite: e.target.value})}
                                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="text-gray-400 text-sm mb-1 block">Asignar a</label>
                                <select
                                    value={nuevaTarea.emailAsignadoA}
                                    onChange={(e) => setNuevaTarea({...nuevaTarea, emailAsignadoA: e.target.value})}
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all"
                                >
                                    <option value="">Sin asignar</option>
                                    {miembros.map((m) => (
                                        <option key={m.id} value={m.usuario?.email}>
                                            {m.usuario?.nombre} {m.usuario?.email === emailUsuario ? "(Tú)" : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setMostrarModal(false)}
                                    className="w-1/2 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl transition-all"
                                >
                                    Cancelar
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={crearTarea}
                                    className="w-1/2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold py-3 rounded-xl transition-all"
                                >
                                    Crear
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default TableroProyecto