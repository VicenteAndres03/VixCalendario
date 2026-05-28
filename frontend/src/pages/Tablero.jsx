import { useState, useEffect, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { useParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import axios from "axios"
import { ThemeContext } from "../context/ThemeContext"

function Tablero(){
    const { fecha } = useParams()
    const fechaTablero = fecha ? new Date(fecha + "T00:00:00") : new Date()
    const token = localStorage.getItem("token")
    const { darkMode } = useContext(ThemeContext)

    const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
                   "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
    const diasSemana = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"]

    const tituloFecha = `${diasSemana[fechaTablero.getDay()]}, ${fechaTablero.getDate()} de ${meses[fechaTablero.getMonth()]} ${fechaTablero.getFullYear()}`

    const fechaFormateada = `${fechaTablero.getFullYear()}-${String(fechaTablero.getMonth()+1).padStart(2,"0")}-${String(fechaTablero.getDate()).padStart(2,"0")}`

    const [tareas, setTareas] = useState({
        POR_HACER: [],
        EN_PROCESO: [],
        TERMINADO: []
    })

    const [mostrarModal, setMostrarModal] = useState(false)
    const [tareaEditandoId, setTareaEditandoId] = useState(null)
    
    const [nuevaTarea, setNuevaTarea] = useState({
        nombre: "",
        descripcion: "",
        fechaInicio: fechaFormateada + "T08:00:00",
        fechaFin: fechaFormateada + "T09:00:00",
        esRecurrente: false,
        diasRecurrencia: "" 
    })

    const columnas = [
        { id: "POR_HACER", titulo: "Por Hacer", color: "from-red-500/20 to-red-500/5", borde: "border-red-500/30", bordeLight: "border-red-200", bgLight: "bg-red-50/60", punto: "bg-red-400" },
        { id: "EN_PROCESO", titulo: "En Proceso", color: "from-yellow-500/20 to-yellow-500/5", borde: "border-yellow-500/30", bordeLight: "border-yellow-200", bgLight: "bg-yellow-50/60", punto: "bg-yellow-400" },
        { id: "TERMINADO", titulo: "Terminado", color: "from-green-500/20 to-green-500/5", borde: "border-green-500/30", bordeLight: "border-green-200", bgLight: "bg-green-50/60", punto: "bg-green-400" },
    ]

    const cargarTareas = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/tarea/dia?fecha=${fechaFormateada}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const nuevasTareas = { POR_HACER: [], EN_PROCESO: [], TERMINADO: [] }
            response.data.forEach(tarea => {
                if (nuevasTareas[tarea.estado]) {
                    nuevasTareas[tarea.estado].push({ ...tarea, id: String(tarea.id) })
                }
            })
            setTareas(nuevasTareas)
        } catch (err) {
            console.error("Error cargando tareas:", err)
        }
    }

    useEffect(() => {
        cargarTareas()
    }, [fechaFormateada])

    const onDragEnd = async (result) => {
        const { source, destination } = result
        if (!destination) return
        if (source.droppableId === destination.droppableId && source.index === destination.index) return

        const origen = [...tareas[source.droppableId]]
        const destino = [...tareas[destination.droppableId]]
        const [tarea] = origen.splice(source.index, 1)

        if (source.droppableId === destination.droppableId) {
            origen.splice(destination.index, 0, tarea)
            setTareas(prev => ({ ...prev, [source.droppableId]: origen }))
        } else {
            destino.splice(destination.index, 0, tarea)
            setTareas(prev => ({
                ...prev,
                [source.droppableId]: origen,
                [destination.droppableId]: destino
            }))
            try {
                await axios.patch(`http://localhost:8080/api/tarea/${tarea.id}/estado?nuevoEstado=${destination.droppableId}&fecha=${fechaFormateada}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            } catch (err) {
                console.error("Error actualizando estado:", err)
            }
        }
    }

    const abrirModalCrear = () => {
        setNuevaTarea({
            nombre: "",
            descripcion: "",
            fechaInicio: fechaFormateada + "T08:00:00",
            fechaFin: fechaFormateada + "T09:00:00",
            esRecurrente: false,
            diasRecurrencia: ""
        })
        setTareaEditandoId(null)
        setMostrarModal(true)
    }

    const abrirModalEditar = (tarea) => {
        setNuevaTarea({
            nombre: tarea.nombre,
            descripcion: tarea.descripcion,
            fechaInicio: tarea.fechaInicio || fechaFormateada + "T08:00:00",
            fechaFin: tarea.fechaFin || fechaFormateada + "T09:00:00",
            esRecurrente: tarea.esRecurrente || false,
            diasRecurrencia: tarea.diasRecurrencia || ""
        })
        setTareaEditandoId(tarea.id)
        setMostrarModal(true)
    }

    const guardarTarea = async () => {
        if (!nuevaTarea.nombre) return
        try {
            if (tareaEditandoId) {
                await axios.put(`http://localhost:8080/api/tarea/${tareaEditandoId}`, nuevaTarea, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            } else {
                await axios.post("http://localhost:8080/api/tarea/guardar", nuevaTarea, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            }
            setMostrarModal(false)
            cargarTareas()
        } catch (err) {
            console.error("Error guardando tarea:", err)
        }
    }

    const eliminarTarea = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar esta tarea?")) {
            try {
                await axios.delete(`http://localhost:8080/api/tarea/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                cargarTareas() 
            } catch (err) {
                console.error("Error eliminando tarea:", err)
            }
        }
    }

    const toggleDiaRecurrencia = (dia) => {
        let diasActuales = nuevaTarea.diasRecurrencia ? nuevaTarea.diasRecurrencia.split(",") : []
        if (diasActuales.includes(dia)) {
            diasActuales = diasActuales.filter(d => d !== dia)
        } else {
            diasActuales.push(dia)
        }
        setNuevaTarea({...nuevaTarea, diasRecurrencia: diasActuales.join(",")})
    }

    const handleCambioHora = (tipo, nuevaHoraStr, nuevoMinutoStr) => {
        let horaI = parseInt(nuevaTarea.fechaInicio.substring(11, 13), 10);
        let minI = parseInt(nuevaTarea.fechaInicio.substring(14, 16), 10);
        
        let horaF = parseInt(nuevaTarea.fechaFin.substring(11, 13), 10);
        let minF = parseInt(nuevaTarea.fechaFin.substring(14, 16), 10);

        const nuevaH = parseInt(nuevaHoraStr, 10);
        const nuevaM = parseInt(nuevoMinutoStr, 10);

        if (tipo === "inicio") {
            horaI = nuevaH;
            minI = nuevaM;
            
            if ((horaI * 60 + minI) >= (horaF * 60 + minF)) {
                let nuevosMinutosFin = (horaI * 60 + minI) + 15;
                
                if (nuevosMinutosFin > 23 * 60 + 45) {
                    horaI = 23; minI = 30;
                    horaF = 23; minF = 45;
                } else {
                    horaF = Math.floor(nuevosMinutosFin / 60);
                    minF = nuevosMinutosFin % 60;
                }
            }
        } else if (tipo === "fin") {
            const intentosMinutosFin = nuevaH * 60 + nuevaM;
            const minutosInicio = horaI * 60 + minI;

            if (intentosMinutosFin <= minutosInicio) {
                alert("⚠️ La hora de fin no puede ser igual ni más temprano que la hora de inicio.");
                return;
            }
            
            horaF = nuevaH;
            minF = nuevaM;
        }

        const strInicio = `${fechaFormateada}T${String(horaI).padStart(2, '0')}:${String(minI).padStart(2, '0')}:00`;
        const strFin = `${fechaFormateada}T${String(horaF).padStart(2, '0')}:${String(minF).padStart(2, '0')}:00`;

        setNuevaTarea({...nuevaTarea, fechaInicio: strInicio, fechaFin: strFin});
    };

    const diasSelector = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] 

    return (
        <div className={`${darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"} min-h-screen transition-colors duration-300`}>
            <Navbar />

            {/* Efecto de luces difuminadas solo visible en modo oscuro */}
            {darkMode && (
                <>
                    <div className="fixed w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl top-0 right-0 pointer-events-none"></div>
                    <div className="fixed w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl bottom-0 left-0 pointer-events-none"></div>
                </>
            )}

            <div className="p-6">
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <div>
                        <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Mi Tablero</h1>
                        <p className="text-cyan-500 mt-1 font-medium">{tituloFecha}</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={abrirModalCrear}
                        className="bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-md shadow-cyan-500/10"
                    >
                        <span className="text-xl">+</span> Nueva Tarea
                    </motion.button>
                </div>

                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {columnas.map((columna) => (
                            <div 
                                key={columna.id} 
                                className={`border rounded-2xl p-4 transition-all duration-300 ${
                                    darkMode 
                                    ? `bg-gradient-to-b ${columna.color} ${columna.borde}` 
                                    : `${columna.bgLight} ${columna.bordeLight} shadow-sm`
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <div className={`w-3 h-3 rounded-full ${columna.punto}`}></div>
                                    <h2 className={`font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>{columna.titulo}</h2>
                                    <span className={`ml-auto text-xs px-2 py-1 rounded-full ${darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-200 text-gray-600 font-medium"}`}>
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
                                            <AnimatePresence>
                                                {tareas[columna.id].map((tarea, index) => (
                                                    <Draggable key={tarea.id} draggableId={tarea.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                            >
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 20 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    className={`border rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all duration-300
                                                                        ${snapshot.isDragging
                                                                            ? "border-cyan-500 shadow-lg shadow-cyan-500/20 rotate-2 scale-105"
                                                                            : darkMode 
                                                                                ? "bg-gray-900 border-gray-700 hover:border-cyan-500/50" 
                                                                                : "bg-white border-gray-200 shadow-sm hover:border-cyan-500/30"}`}
                                                                >
                                                                    <div className="flex items-start justify-between mb-1">
                                                                        <h3 className={`font-medium flex items-center ${darkMode ? "text-white" : "text-gray-800"}`}>
                                                                            {tarea.esRecurrente && <span className="mr-2 text-cyan-500 text-xs" title="Tarea Recurrente">🔄</span>}
                                                                            {tarea.nombre}
                                                                        </h3>
                                                                        <div className="flex gap-3 items-center">
                                                                            <button onClick={() => abrirModalEditar(tarea)} className="text-gray-400 hover:text-cyan-500 transition-colors" title="Editar">✏️</button>
                                                                            <button onClick={() => eliminarTarea(tarea.id)} className="text-gray-400 hover:text-red-400 transition-colors" title="Eliminar">🗑️</button>
                                                                        </div>
                                                                    </div>
                                                                    <p className={`text-sm mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{tarea.descripcion}</p>
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

            {/* MODAL DE EDICIÓN / CREACIÓN */}
            <AnimatePresence>
                {mostrarModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setMostrarModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className={`border rounded-2xl p-8 w-full max-w-md transition-colors ${
                                darkMode ? "bg-gray-900 border-cyan-500/30 shadow-2xl" : "bg-white border-gray-200 shadow-xl"
                            }`}
                        >
                            <h2 className="text-2xl font-bold text-cyan-500 mb-6">
                                {tareaEditandoId ? "Editar Tarea" : "Nueva Tarea"}
                            </h2>

                            <div className="mb-4">
                                <label className={`text-sm mb-1 block ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Nombre</label>
                                <input
                                    type="text"
                                    value={nuevaTarea.nombre}
                                    onChange={(e) => setNuevaTarea({...nuevaTarea, nombre: e.target.value})}
                                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all ${
                                        darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-300 text-gray-900"
                                    }`}
                                    placeholder="Nombre de la tarea"
                                />
                            </div>

                            <div className="mb-4">
                                <label className={`text-sm mb-1 block ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Descripción</label>
                                <textarea
                                    value={nuevaTarea.descripcion}
                                    onChange={(e) => setNuevaTarea({...nuevaTarea, descripcion: e.target.value})}
                                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all resize-none ${
                                        darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-300 text-gray-900"
                                    }`}
                                    placeholder="Descripción de la tarea"
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-4 mb-4">
                                {/* HORA INICIO */}
                                <div className="w-1/2">
                                    <label className={`text-sm mb-1 block ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Hora inicio</label>
                                    <div className={`flex items-center gap-2 border rounded-xl px-4 py-3 focus-within:border-cyan-500 transition-all ${
                                        darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-300"
                                    }`}>
                                        <select 
                                            value={nuevaTarea.fechaInicio.substring(11, 13)}
                                            onChange={(e) => handleCambioHora("inicio", e.target.value, nuevaTarea.fechaInicio.substring(14, 16))}
                                            className={`bg-transparent w-full outline-none appearance-none cursor-pointer text-center font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                                        >
                                            {Array.from({length: 24}, (_, i) => String(i).padStart(2, '0')).map(h => (
                                                <option key={h} value={h} className={darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}>{h}</option>
                                            ))}
                                        </select>
                                        <span className="text-cyan-500 font-bold">:</span>
                                        <select 
                                            value={nuevaTarea.fechaInicio.substring(14, 16)}
                                            onChange={(e) => handleCambioHora("inicio", nuevaTarea.fechaInicio.substring(11, 13), e.target.value)}
                                            className={`bg-transparent w-full outline-none appearance-none cursor-pointer text-center font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                                        >
                                            {['00', '15', '30', '45'].map(m => (
                                                <option key={m} value={m} className={darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}>{m}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* HORA FIN */}
                                <div className="w-1/2">
                                    <label className={`text-sm mb-1 block ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Hora fin</label>
                                    <div className={`flex items-center gap-2 border rounded-xl px-4 py-3 focus-within:border-cyan-500 transition-all ${
                                        darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-300"
                                    }`}>
                                        <select 
                                            value={nuevaTarea.fechaFin.substring(11, 13)}
                                            onChange={(e) => handleCambioHora("fin", e.target.value, nuevaTarea.fechaFin.substring(14, 16))}
                                            className={`bg-transparent w-full outline-none appearance-none cursor-pointer text-center font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                                        >
                                            {Array.from({length: 24}, (_, i) => String(i).padStart(2, '0')).map(h => (
                                                <option key={h} value={h} className={darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}>{h}</option>
                                            ))}
                                        </select>
                                        <span className="text-cyan-500 font-bold">:</span>
                                        <select 
                                            value={nuevaTarea.fechaFin.substring(14, 16)}
                                            onChange={(e) => handleCambioHora("fin", nuevaTarea.fechaFin.substring(11, 13), e.target.value)}
                                            className={`bg-transparent w-full outline-none appearance-none cursor-pointer text-center font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                                        >
                                            {['00', '15', '30', '45'].map(m => (
                                                <option key={m} value={m} className={darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}>{m}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4 flex items-center gap-3">
                                <input 
                                    type="checkbox" 
                                    id="recurrente"
                                    checked={nuevaTarea.esRecurrente}
                                    onChange={(e) => {
                                        const checked = e.target.checked
                                        setNuevaTarea({...nuevaTarea, esRecurrente: checked, diasRecurrencia: checked ? nuevaTarea.diasRecurrencia : ""})
                                    }}
                                    className="w-5 h-5 accent-cyan-500 rounded bg-gray-800 border-gray-700 cursor-pointer"
                                />
                                <label htmlFor="recurrente" className={`text-sm cursor-pointer font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                    Hacer de esta una tarea recurrente
                                </label>
                            </div>

                            {nuevaTarea.esRecurrente && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="mb-6 overflow-hidden"
                                >
                                    <label className={`text-xs mb-2 block ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Selecciona los días (L M X J V S D)</label>
                                    <div className="flex gap-2">
                                        {diasSelector.map(dia => {
                                            const seleccionado = nuevaTarea.diasRecurrencia?.includes(dia)
                                            return (
                                                <button
                                                    key={dia}
                                                    type="button"
                                                    onClick={() => toggleDiaRecurrencia(dia)}
                                                    className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                                                        seleccionado 
                                                        ? 'bg-cyan-500 text-gray-950 border border-transparent shadow-sm' 
                                                        : darkMode 
                                                            ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700' 
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                                                    }`}
                                                >
                                                    {dia}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </motion.div>
                            )}

                            <div className="flex gap-3 mt-6">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setMostrarModal(false)}
                                    className={`w-1/2 py-3 rounded-xl transition-all font-medium ${
                                        darkMode ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                                    }`}
                                >
                                    Cancelar
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={guardarTarea}
                                    className="w-1/2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold py-3 rounded-xl transition-all shadow-md shadow-cyan-500/10"
                                >
                                    {tareaEditandoId ? "Actualizar" : "Guardar"}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Tablero