import { useState, useEffect, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { useParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import axios from "axios"
import { ThemeContext } from "../context/ThemeContext"

const TEMAS_KANBAN = {
    default: { nombre: "Clásico Vix", emoji: "⚪", columnas: { "POR_HACER": "bg-red-50/60 dark:bg-red-900/10 border-red-200 dark:border-red-500/30", "EN_PROCESO": "bg-yellow-50/60 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-500/30", "TERMINADO": "bg-green-50/60 dark:bg-green-900/10 border-green-200 dark:border-green-500/30" }, gradientes: { "POR_HACER": "dark:bg-gradient-to-b dark:from-red-500/20 dark:to-red-500/5", "EN_PROCESO": "dark:bg-gradient-to-b dark:from-yellow-500/20 dark:to-yellow-500/5", "TERMINADO": "dark:bg-gradient-to-b dark:from-green-500/20 dark:to-green-500/5" }, puntos: { "POR_HACER": "bg-red-400", "EN_PROCESO": "bg-yellow-400", "TERMINADO": "bg-green-400" } },
    ocean: { nombre: "Profundidad Oceánica", emoji: "🌊", columnas: { "POR_HACER": "bg-blue-50/60 dark:bg-blue-900/10 border-blue-200 dark:border-blue-500/30", "EN_PROCESO": "bg-cyan-50/60 dark:bg-cyan-900/10 border-cyan-200 dark:border-cyan-500/30", "TERMINADO": "bg-teal-50/60 dark:bg-teal-900/10 border-teal-200 dark:border-teal-500/30" }, gradientes: { "POR_HACER": "dark:bg-gradient-to-b dark:from-blue-500/20 dark:to-blue-500/5", "EN_PROCESO": "dark:bg-gradient-to-b dark:from-cyan-500/20 dark:to-cyan-500/5", "TERMINADO": "dark:bg-gradient-to-b dark:from-teal-500/20 dark:to-teal-500/5" }, puntos: { "POR_HACER": "bg-blue-400", "EN_PROCESO": "bg-cyan-400", "TERMINADO": "bg-teal-400" } },
    cyberpunk: { nombre: "Cyberpunk Neon", emoji: "🌃", columnas: { "POR_HACER": "bg-fuchsia-50/60 dark:bg-fuchsia-900/10 border-fuchsia-200 dark:border-fuchsia-500/30", "EN_PROCESO": "bg-purple-50/60 dark:bg-purple-900/10 border-purple-200 dark:border-purple-500/30", "TERMINADO": "bg-violet-50/60 dark:bg-violet-900/10 border-violet-200 dark:border-violet-500/30" }, gradientes: { "POR_HACER": "dark:bg-gradient-to-b dark:from-fuchsia-500/20 dark:to-fuchsia-500/5", "EN_PROCESO": "dark:bg-gradient-to-b dark:from-purple-500/20 dark:to-purple-500/5", "TERMINADO": "dark:bg-gradient-to-b dark:from-violet-500/20 dark:to-violet-500/5" }, puntos: { "POR_HACER": "bg-fuchsia-400", "EN_PROCESO": "bg-purple-400", "TERMINADO": "bg-violet-400" } }
}

function Tablero(){
    const { fecha } = useParams()
    const fechaTablero = fecha ? new Date(fecha + "T00:00:00") : new Date()
    const token = localStorage.getItem("token")
    const { darkMode } = useContext(ThemeContext)

    const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
    const diasSemana = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"]
    const diasSelector = ['L', 'M', 'Mi', 'J', 'V', 'S', 'D'] 

    const tituloFecha = `${diasSemana[fechaTablero.getDay()]}, ${fechaTablero.getDate()} de ${meses[fechaTablero.getMonth()]} ${fechaTablero.getFullYear()}`
    const fechaFormateada = `${fechaTablero.getFullYear()}-${String(fechaTablero.getMonth()+1).padStart(2,"0")}-${String(fechaTablero.getDate()).padStart(2,"0")}`

    const [tareas, setTareas] = useState({ POR_HACER: [], EN_PROCESO: [], TERMINADO: [] })
    
    // Controles de Gamificación y Focus
    const [rachaActual, setRachaActual] = useState(0)
    const [mostrarSelectorTema, setMostrarSelectorTema] = useState(false)
    const [temaActivo, setTemaActivo] = useState(() => localStorage.getItem("temaKanban") || "default")

    const [mostrarPomodoro, setMostrarPomodoro] = useState(false)
    const [pomodoroMinutos, setPomodoroMinutos] = useState(25)
    const [pomodoroSegundos, setPomodoroSegundos] = useState(0)
    const [pomodoroActivo, setPomodoroActivo] = useState(false)
    const [pomodoroModo, setPomodoroModo] = useState('trabajo')

    const [formularioCrear, setFormularioCrear] = useState({
        nombre: "", descripcion: "", horaInicio: "09:00", horaFin: "10:00", esRecurrente: false, diasRecurrencia: []
    })

    const [mostrarModalEditar, setMostrarModalEditar] = useState(false)
    const [tareaEditandoId, setTareaEditandoId] = useState(null)
    const [tareaEditando, setTareaEditando] = useState({
        nombre: "", descripcion: "", fechaInicio: "", fechaFin: "", esRecurrente: false, diasRecurrencia: "" 
    })

    // 🔥 NUEVO ESTADO PARA EL MODAL DE CONFIRMACIÓN 🔥
    const [modalConfirmacion, setModalConfirmacion] = useState({ visible: false, idTarea: null })

    // Modal de detalles de tarea
    const [tareaDetalle, setTareaDetalle] = useState(null)
    const [modalDetalle, setModalDetalle] = useState(false)

    const infoColumnas = [ { id: "POR_HACER", titulo: "Por Hacer" }, { id: "EN_PROCESO", titulo: "En Proceso" }, { id: "TERMINADO", titulo: "Terminado" } ]

    const cargarMetricas = async () => {
        try {
            const res = await axios.get("https://api.vix-flow.com/api/metricas/personales", { headers: { Authorization: `Bearer ${token}` } })
            setRachaActual(res.data.rachaActual || 0)
        } catch (error) { console.error(error) }
    }

    const cargarTareas = async () => {
        try {
            const res = await axios.get(`https://api.vix-flow.com/api/tarea/dia?fecha=${fechaFormateada}`, { headers: { Authorization: `Bearer ${token}` } })
            const nuevasTareas = { POR_HACER: [], EN_PROCESO: [], TERMINADO: [] }
            res.data.forEach(t => nuevasTareas[t.estado]?.push({ ...t, id: String(t.id) }))
            setTareas(nuevasTareas)
        } catch (err) { console.error(err) }
    }

    useEffect(() => { cargarTareas(); cargarMetricas(); }, [fechaFormateada])

    useEffect(() => {
        let intervalo;
        if (pomodoroActivo) {
            intervalo = setInterval(() => {
                if (pomodoroSegundos === 0) {
                    if (pomodoroMinutos === 0) {
                        new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(()=>{});
                        if (pomodoroModo === 'trabajo') {
                            setPomodoroModo('descanso'); setPomodoroMinutos(5);
                        } else {
                            setPomodoroModo('trabajo'); setPomodoroMinutos(25); setPomodoroActivo(false);
                        }
                    } else {
                        setPomodoroMinutos(m => m - 1); setPomodoroSegundos(59);
                    }
                } else {
                    setPomodoroSegundos(s => s - 1);
                }
            }, 1000);
        }
        return () => clearInterval(intervalo);
    }, [pomodoroActivo, pomodoroMinutos, pomodoroSegundos, pomodoroModo]);

    const handleCrearTarea = async (e) => {
        e.preventDefault()
        if (!formularioCrear.nombre.trim()) return

        const inicioMins = parseInt(formularioCrear.horaInicio.split(':')[0]) * 60 + parseInt(formularioCrear.horaInicio.split(':')[1])
        const finMins = parseInt(formularioCrear.horaFin.split(':')[0]) * 60 + parseInt(formularioCrear.horaFin.split(':')[1])
        if (finMins <= inicioMins) return alert("⚠️ La hora de fin debe ser posterior a la hora de inicio.")

        const descripcionSegura = formularioCrear.descripcion.trim() === "" ? "Sin descripción" : formularioCrear.descripcion;
        const nuevaTareaParaBD = {
            nombre: formularioCrear.nombre, descripcion: descripcionSegura,
            fechaInicio: `${fechaFormateada}T${formularioCrear.horaInicio}:00`, fechaFin: `${fechaFormateada}T${formularioCrear.horaFin}:00`,
            esRecurrente: formularioCrear.esRecurrente, diasRecurrencia: formularioCrear.esRecurrente ? formularioCrear.diasRecurrencia.join(",") : ""
        }

        try {
            await axios.post("https://api.vix-flow.com/api/tarea/guardar", nuevaTareaParaBD, { headers: { Authorization: `Bearer ${token}` } })
            setFormularioCrear({ ...formularioCrear, nombre: "", descripcion: "" }) 
            cargarTareas()
        } catch (err) { alert("Hubo un error con el servidor.") }
    }

    const toggleDiaCreacion = (dia) => {
        const seleccionados = formularioCrear.diasRecurrencia
        if (seleccionados.includes(dia)) setFormularioCrear({ ...formularioCrear, diasRecurrencia: seleccionados.filter(d => d !== dia) })
        else setFormularioCrear({ ...formularioCrear, diasRecurrencia: [...seleccionados, dia] })
    }

    const abrirModalEditar = (tarea) => {
        setTareaEditando({
            nombre: tarea.nombre, descripcion: tarea.descripcion || "",
            fechaInicio: tarea.fechaInicio || `${fechaFormateada}T09:00:00`, fechaFin: tarea.fechaFin || `${fechaFormateada}T10:00:00`,
            esRecurrente: tarea.esRecurrente || false, diasRecurrencia: tarea.diasRecurrencia || ""
        })
        setTareaEditandoId(tarea.id)
        setMostrarModalEditar(true)
    }

    const guardarTareaEditada = async () => {
        if (!tareaEditando.nombre) return
        const descripcionSegura = tareaEditando.descripcion.trim() === "" ? "Sin descripción" : tareaEditando.descripcion;
        try {
            await axios.put(`https://api.vix-flow.com/api/tarea/${tareaEditandoId}`, { ...tareaEditando, descripcion: descripcionSegura }, { headers: { Authorization: `Bearer ${token}` } })
            setMostrarModalEditar(false); cargarTareas()
        } catch (err) { console.error(err) }
    }

    // 🔥 NUEVA LÓGICA DE ELIMINACIÓN CUSTOM 🔥
    const intentarEliminar = (id) => {
        setModalConfirmacion({ visible: true, idTarea: id })
    }

    const confirmarEliminacion = async () => {
        try { 
            await axios.delete(`https://api.vix-flow.com/api/tarea/${modalConfirmacion.idTarea}`, { headers: { Authorization: `Bearer ${token}` } }); 
            cargarTareas();
            setModalConfirmacion({ visible: false, idTarea: null }) 
        } catch (err) { 
            console.error(err) 
        }
    }

    const onDragEnd = async (result) => {
        const { source, destination } = result
        if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) return

        const origen = [...tareas[source.droppableId]]
        const destino = [...tareas[destination.droppableId]]
        const [tarea] = origen.splice(source.index, 1)

        if (source.droppableId === destination.droppableId) {
            origen.splice(destination.index, 0, tarea)
            setTareas(prev => ({ ...prev, [source.droppableId]: origen }))
        } else {
            destino.splice(destination.index, 0, tarea)
            setTareas(prev => ({ ...prev, [source.droppableId]: origen, [destination.droppableId]: destino }))
            try {
                await axios.patch(`https://api.vix-flow.com/api/tarea/${tarea.id}/estado?nuevoEstado=${destination.droppableId}&fecha=${fechaFormateada}`, {}, { headers: { Authorization: `Bearer ${token}` } })
                if (destination.droppableId === "TERMINADO") cargarMetricas()
            } catch (err) { cargarTareas() }
        }
    }

    const cambiarTema = (idTema) => {
        setTemaActivo(idTema)
        localStorage.setItem("temaKanban", idTema)
        setMostrarSelectorTema(false)
    }

    const SelectorHora = ({ valor, onChange, icono }) => {
        const h = valor.split(':')[0]
        const m = valor.split(':')[1]
        return (
            <div className={`flex items-center gap-1.5 px-4 py-3 rounded-2xl border transition-all focus-within:border-cyan-500 ${darkMode ? "bg-gray-950/80 border-gray-700" : "bg-gray-50 border-gray-300"}`}>
                <span className="text-lg">{icono}</span>
                <select value={h} onChange={(e) => onChange(`${e.target.value}:${m}`)} className={`bg-transparent font-bold outline-none cursor-pointer appearance-none text-center ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {Array.from({length: 24}, (_, i) => String(i).padStart(2, '0')).map(hour => <option key={hour} value={hour} className={darkMode ? "bg-gray-900 text-white" : "bg-white"}>{hour}</option>)}
                </select>
                <span className="font-bold text-gray-400">:</span>
                <select value={m} onChange={(e) => onChange(`${h}:${e.target.value}`)} className={`bg-transparent font-bold outline-none cursor-pointer appearance-none text-center ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {['00', '15', '30', '45'].map(min => <option key={min} value={min} className={darkMode ? "bg-gray-900 text-white" : "bg-white"}>{min}</option>)}
                </select>
            </div>
        )
    }

    const coloresActivos = TEMAS_KANBAN[temaActivo] || TEMAS_KANBAN.default

    return (
        <div className={`${darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"} min-h-screen transition-colors duration-300`}>
            <Navbar />

            {darkMode && (
                <>
                    <div className="fixed w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl top-0 right-0 pointer-events-none"></div>
                    <div className="fixed w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl bottom-0 left-0 pointer-events-none"></div>
                </>
            )}

            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Mi Tablero</h1>
                        <p className="text-cyan-500 mt-1 font-medium">{tituloFecha}</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
                            <span className="text-xl">🔥</span>
                            <div>
                                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Racha</p>
                                <p className="font-bold leading-none text-sm">{rachaActual} días</p>
                            </div>
                        </div>

                        {rachaActual >= 7 ? (
                            <div className="relative">
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setMostrarSelectorTema(!mostrarSelectorTema)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold shadow-lg shadow-purple-500/20 flex items-center gap-2 text-sm">
                                    <span>{coloresActivos.emoji}</span><span className="hidden sm:inline">Temas</span>
                                </motion.button>
                                <AnimatePresence>
                                    {mostrarSelectorTema && (
                                        <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className={`absolute right-0 mt-3 w-48 p-2 rounded-2xl shadow-2xl border z-50 ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
                                            <p className={`text-xs font-bold uppercase tracking-wider px-3 py-2 mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Temas</p>
                                            {Object.entries(TEMAS_KANBAN).map(([id, tema]) => (
                                                <button key={id} onClick={() => cambiarTema(id)} className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${temaActivo === id ? (darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900") : (darkMode ? "hover:bg-gray-800/50 text-gray-400" : "hover:bg-gray-50 text-gray-600")}`}>
                                                    <span className="flex items-center gap-2"><span className="text-base">{tema.emoji}</span>{tema.nombre}</span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className={`px-4 py-2 rounded-xl border border-dashed flex items-center gap-2 opacity-60 cursor-not-allowed ${darkMode ? "border-gray-700 bg-gray-900/50" : "border-gray-300 bg-gray-50"}`} title="Llega a 7 días de racha">
                                <span className="text-xl grayscale">🎨</span>
                                <div className="hidden sm:block">
                                    <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Bloqueado</p>
                                    <p className={`text-xs font-bold ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Faltan {7 - rachaActual} días</p>
                                </div>
                            </div>
                        )}

                        {rachaActual >= 60 ? (
                            <motion.button 
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} 
                                onClick={() => setMostrarPomodoro(!mostrarPomodoro)} 
                                className={`px-4 py-2 rounded-xl text-white font-bold shadow-lg flex items-center gap-2 text-sm transition-all ${
                                    mostrarPomodoro ? "bg-amber-500 shadow-amber-500/30" : "bg-gradient-to-r from-yellow-500 to-amber-500 shadow-yellow-500/20"
                                }`}
                            >
                                <span>⏱️</span><span className="hidden sm:inline">Focus</span>
                            </motion.button>
                        ) : (
                            <div className={`px-4 py-2 rounded-xl border border-dashed flex items-center gap-2 opacity-60 cursor-not-allowed ${darkMode ? "border-gray-700 bg-gray-900/50" : "border-gray-300 bg-gray-50"}`} title="Llega a 60 días para desbloquear el Modo Focus">
                                <span className="text-xl grayscale">⏱️</span>
                                <div className="hidden sm:block">
                                    <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Bloqueado</p>
                                    <p className={`text-xs font-bold ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Faltan {60 - rachaActual} días</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <motion.form onSubmit={handleCrearTarea} className={`w-full mb-10 p-6 rounded-3xl border backdrop-blur-xl shadow-lg transition-all ${darkMode ? "bg-gray-900/40 border-white/10" : "bg-white border-gray-200"}`}>
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col md:flex-row gap-4">
                            <input type="text" placeholder="✨ ¿Qué quieres lograr hoy?" value={formularioCrear.nombre} onChange={(e) => setFormularioCrear({...formularioCrear, nombre: e.target.value})} className={`flex-1 px-5 py-3 rounded-2xl border text-base font-medium outline-none transition-all ${darkMode ? "bg-gray-950/80 border-gray-700 focus:border-cyan-500 text-white" : "bg-gray-50 border-gray-300 focus:border-cyan-500 text-gray-900"}`} required />
                            <input type="text" placeholder="📝 Descripción (opcional)..." value={formularioCrear.descripcion} onChange={(e) => setFormularioCrear({...formularioCrear, descripcion: e.target.value})} className={`flex-1 px-5 py-3 rounded-2xl border text-sm font-medium outline-none transition-all ${darkMode ? "bg-gray-950/80 border-gray-700 focus:border-cyan-500 text-white" : "bg-gray-50 border-gray-300 focus:border-cyan-500 text-gray-900"}`} />
                        </div>
                        <div className="flex flex-wrap md:flex-nowrap items-center gap-4">
                            <SelectorHora icono="🕒" valor={formularioCrear.horaInicio} onChange={(val) => setFormularioCrear({...formularioCrear, horaInicio: val})} />
                            <span className="hidden sm:block text-gray-400 font-bold">→</span>
                            <SelectorHora icono="🏁" valor={formularioCrear.horaFin} onChange={(val) => setFormularioCrear({...formularioCrear, horaFin: val})} />
                            <label className={`flex items-center gap-2 cursor-pointer text-sm font-bold ml-0 md:ml-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                <input type="checkbox" checked={formularioCrear.esRecurrente} onChange={(e) => setFormularioCrear({...formularioCrear, esRecurrente: e.target.checked})} className="w-5 h-5 accent-cyan-500 cursor-pointer rounded bg-gray-800 border-gray-700" />
                                <span>🔄 Recurrente</span>
                            </label>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-cyan-500/20 w-full md:w-auto ml-auto shrink-0">Añadir Tarea</motion.button>
                        </div>
                        <AnimatePresence>
                            {formularioCrear.esRecurrente && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-800/50">
                                    <span className={`text-xs uppercase tracking-wider font-bold mr-2 mt-3 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Días:</span>
                                    <div className="flex gap-2 mt-3">
                                        {diasSelector.map(dia => (
                                            <button key={dia} type="button" onClick={() => toggleDiaCreacion(dia)} className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${formularioCrear.diasRecurrencia.includes(dia) ? 'bg-cyan-500 text-gray-950 shadow-md shadow-cyan-500/30' : darkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>{dia}</button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.form>

                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {infoColumnas.map((columna) => (
                            <div key={columna.id} className={`border rounded-2xl p-4 transition-all duration-300 ${coloresActivos.columnas[columna.id]} ${coloresActivos.gradientes[columna.id]}`}>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className={`w-3 h-3 rounded-full ${coloresActivos.puntos[columna.id]}`}></div>
                                    <h2 className={`font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>{columna.titulo}</h2>
                                    <span className={`ml-auto text-xs px-2 py-1 rounded-full ${darkMode ? "bg-gray-800 text-gray-400" : "bg-white text-gray-600 font-medium shadow-sm"}`}>{tareas[columna.id].length}</span>
                                </div>
                                <Droppable droppableId={columna.id}>
                                    {(provided, snapshot) => (
                                        <div ref={provided.innerRef} {...provided.droppableProps} className={`min-h-[200px] space-y-3 rounded-xl transition-all duration-300 ${snapshot.isDraggingOver ? "bg-cyan-500/5 p-2" : ""}`}>
                                            <AnimatePresence>
                                                {tareas[columna.id].map((tarea, index) => (
                                                    <Draggable key={tarea.id} draggableId={tarea.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                                <motion.div 
                                                                    initial={{ opacity: 0, y: 20 }} 
                                                                    animate={{ opacity: 1, y: 0 }} 
                                                                    onClick={() => {
                                                                        if (!snapshot.isDragging) {
                                                                            setTareaDetalle(tarea)
                                                                            setModalDetalle(true)
                                                                        }
                                                                    }}
                                                                    className={`border rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all duration-300 ${snapshot.isDragging ? "border-cyan-500 shadow-lg shadow-cyan-500/20 rotate-2 scale-105" : darkMode ? "bg-gray-900 border-gray-700 hover:border-cyan-500/50" : "bg-white border-gray-200 shadow-sm hover:border-cyan-500/30"}`}>
                                                                    <div className="flex items-start justify-between mb-1">
                                                                        <h3 className={`font-medium flex items-center ${darkMode ? "text-white" : "text-gray-800"} ${columna.id === "TERMINADO" ? "line-through opacity-50" : ""}`}>{tarea.nombre}</h3>
                                                                        <div className="flex gap-3 items-center">
                                                                            <button onClick={(e) => { e.stopPropagation(); abrirModalEditar(tarea) }} className="text-gray-400 hover:text-cyan-500 transition-colors">✏️</button>
                                                                            {/* 🔥 CAMBIADO: AHORA LLAMA A INTENTAR ELIMINAR 🔥 */}
                                                                            <button onClick={(e) => { e.stopPropagation(); intentarEliminar(tarea.id) }} className="text-gray-400 hover:text-red-400 transition-colors">🗑️</button>
                                                                        </div>
                                                                    </div>
                                                                    {tarea.descripcion && tarea.descripcion !== "Sin descripción" && <p className={`text-sm mt-1 mb-2 line-clamp-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{tarea.descripcion}</p>}
                                                                    {tarea.esRecurrente && (
                                                                        <div className="mt-2 flex items-center gap-1.5">
                                                                            <span className="text-cyan-500 text-xs">🔄</span>
                                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${darkMode ? 'bg-cyan-500/10 text-cyan-400' : 'bg-cyan-50 text-cyan-600'}`}>{tarea.diasRecurrencia ? tarea.diasRecurrencia.replace(/,/g, ' - ') : 'Diario'}</span>
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

            <AnimatePresence>
                {mostrarPomodoro && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        drag dragConstraints={{ left: -500, right: 0, top: -500, bottom: 0 }}
                        className={`fixed bottom-10 right-10 p-6 rounded-3xl shadow-2xl border z-50 backdrop-blur-xl w-72 ${darkMode ? "bg-gray-900/90 border-amber-500/30 shadow-amber-500/10" : "bg-white/95 border-amber-200 shadow-amber-500/20"}`}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`font-bold flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                                <span>{pomodoroModo === 'trabajo' ? "🍅 Focus" : "☕ Descanso"}</span>
                            </h3>
                            <button onClick={() => setMostrarPomodoro(false)} className="text-gray-400 hover:text-red-500 text-lg">✖</button>
                        </div>
                        
                        <div className={`text-5xl font-extrabold text-center my-6 tracking-widest ${pomodoroModo === 'trabajo' ? "text-amber-500" : "text-cyan-500"}`}>
                            {String(pomodoroMinutos).padStart(2, '0')}:{String(pomodoroSegundos).padStart(2, '0')}
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setPomodoroActivo(!pomodoroActivo)} 
                                className={`flex-1 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${pomodoroActivo ? "bg-red-500 hover:bg-red-400 shadow-red-500/20" : "bg-amber-500 hover:bg-amber-400 shadow-amber-500/20"}`}
                            >
                                {pomodoroActivo ? "Pausar" : "Iniciar"}
                            </button>
                            <button 
                                onClick={() => { setPomodoroActivo(false); setPomodoroModo('trabajo'); setPomodoroMinutos(25); setPomodoroSegundos(0); }} 
                                className={`px-4 rounded-xl font-bold border transition-all ${darkMode ? "border-gray-700 hover:bg-gray-800 text-gray-300" : "border-gray-300 hover:bg-gray-100 text-gray-700"}`}
                                title="Reiniciar"
                            >
                                ↺
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 🔥 NUEVO MODAL DE CONFIRMACIÓN 🔥 */}
            <AnimatePresence>
                {modalConfirmacion.visible && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={() => setModalConfirmacion({ visible: false, idTarea: null })}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()} className={`border rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl ${darkMode ? "bg-gray-900 border-red-500/30" : "bg-white border-red-200"}`}>
                            <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 text-3xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                                ⚠️
                            </div>
                            <h2 className={`text-xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>Eliminar Tarea</h2>
                            <p className={`text-sm mb-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                ¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setModalConfirmacion({ visible: false, idTarea: null })} className={`w-1/2 py-3 rounded-xl font-medium transition-colors ${darkMode ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}>
                                    Cancelar
                                </button>
                                <button onClick={confirmarEliminacion} className="w-1/2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-500/20 transition-all">
                                    Sí, eliminar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MODAL DETALLES DE TAREA */}
            <AnimatePresence>
                {modalDetalle && tareaDetalle && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setModalDetalle(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className={`border rounded-2xl p-8 w-full max-w-md shadow-2xl ${
                                darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
                            }`}
                        >
                            {/* Estado */}
                            <div className="flex items-center justify-between mb-4">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                    tareaDetalle.estado === "TERMINADO" 
                                        ? "bg-green-500/20 text-green-400"
                                        : tareaDetalle.estado === "EN_PROCESO"
                                            ? "bg-yellow-500/20 text-yellow-400"
                                            : "bg-red-500/20 text-red-400"
                                }`}>
                                    {tareaDetalle.estado === "TERMINADO" ? "✅ Terminado" 
                                        : tareaDetalle.estado === "EN_PROCESO" ? "⚡ En Proceso" 
                                        : "📋 Por Hacer"}
                                </span>
                                <button 
                                    onClick={() => setModalDetalle(false)}
                                    className="text-gray-400 hover:text-white text-lg"
                                >
                                    ✖
                                </button>
                            </div>

                            {/* Nombre */}
                            <h2 className={`text-2xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
                                {tareaDetalle.nombre}
                            </h2>

                            {/* Descripción */}
                            <div className={`p-4 rounded-xl mb-4 ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                                <p className={`text-sm font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                    Descripción
                                </p>
                                <p className={darkMode ? "text-gray-200" : "text-gray-700"}>
                                    {tareaDetalle.descripcion && tareaDetalle.descripcion !== "Sin descripción" 
                                        ? tareaDetalle.descripcion 
                                        : "Sin descripción"}
                                </p>
                            </div>

                            {/* Horario */}
                            <div className={`p-4 rounded-xl mb-4 ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                                <p className={`text-sm font-medium mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                    Horario
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-cyan-500">🕒</span>
                                    <span className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                                        {new Date(tareaDetalle.fechaInicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                    <span className="text-gray-400">→</span>
                                    <span className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                                        {new Date(tareaDetalle.fechaFin).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                            </div>

                            {/* Recurrencia */}
                            {tareaDetalle.esRecurrente && (
                                <div className={`p-4 rounded-xl mb-4 ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                                    <p className={`text-sm font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                        Recurrencia
                                    </p>
                                    <p className="text-cyan-400 text-sm font-bold">
                                        🔄 {tareaDetalle.diasRecurrencia?.replace(/,/g, ' - ') || 'Diario'}
                                    </p>
                                </div>
                            )}

                            {/* Botones */}
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        setModalDetalle(false)
                                        abrirModalEditar(tareaDetalle)
                                    }}
                                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                                        darkMode 
                                            ? "bg-gray-800 hover:bg-gray-700 text-white" 
                                            : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                                    }`}
                                >
                                    ✏️ Editar
                                </button>
                                <button
                                    onClick={() => {
                                        setModalDetalle(false)
                                        intentarEliminar(tareaDetalle.id)
                                    }}
                                    className="flex-1 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold py-3 rounded-xl border border-red-500/20 transition-all"
                                >
                                    🗑️ Eliminar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MODAL PARA EDITAR TAREAS */}
            <AnimatePresence>
                {mostrarModalEditar && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setMostrarModalEditar(false)}>
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} onClick={e => e.stopPropagation()} className={`border rounded-2xl p-8 w-full max-w-md my-8 transition-colors ${darkMode ? "bg-gray-900 border-cyan-500/30 shadow-2xl" : "bg-white border-gray-200 shadow-xl"}`}>
                            <h2 className="text-2xl font-bold text-cyan-500 mb-6">Editar Tarea</h2>
                            <div className="mb-4">
                                <label className={`text-sm mb-1 block ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Nombre</label>
                                <input type="text" value={tareaEditando.nombre} onChange={(e) => setTareaEditando({...tareaEditando, nombre: e.target.value})} className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-300 text-gray-900"}`} />
                            </div>
                            <div className="mb-4">
                                <label className={`text-sm mb-1 block ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Descripción</label>
                                <textarea value={tareaEditando.descripcion === "Sin descripción" ? "" : tareaEditando.descripcion} onChange={(e) => setTareaEditando({...tareaEditando, descripcion: e.target.value})} className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all resize-none ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-300 text-gray-900"}`} rows={3} />
                            </div>
                            <div className="flex gap-4 mb-4">
                                <div className="w-1/2">
                                    <label className={`text-sm mb-1 block ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Hora inicio</label>
                                    <SelectorHora icono="🕒" valor={tareaEditando.fechaInicio.substring(11,16)} onChange={(val) => setTareaEditando({...tareaEditando, fechaInicio: `${fechaFormateada}T${val}:00`})} />
                                </div>
                                <div className="w-1/2">
                                    <label className={`text-sm mb-1 block ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Hora fin</label>
                                    <SelectorHora icono="🏁" valor={tareaEditando.fechaFin.substring(11,16)} onChange={(val) => setTareaEditando({...tareaEditando, fechaFin: `${fechaFormateada}T${val}:00`})} />
                                </div>
                            </div>
                            <div className="mb-4 flex items-center gap-3">
                                <input type="checkbox" checked={tareaEditando.esRecurrente} onChange={(e) => setTareaEditando({...tareaEditando, esRecurrente: e.target.checked, diasRecurrencia: e.target.checked ? tareaEditando.diasRecurrencia : ""})} className="w-5 h-5 accent-cyan-500 rounded bg-gray-800 border-gray-700 cursor-pointer" />
                                <label className={`text-sm cursor-pointer font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Hacer recurrente</label>
                            </div>
                            {tareaEditando.esRecurrente && (
                                <div className="mb-6">
                                    <label className={`text-xs mb-2 block ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Días seleccionados</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {diasSelector.map(dia => {
                                            const arrDias = tareaEditando.diasRecurrencia ? tareaEditando.diasRecurrencia.split(",") : [];
                                            const estaSeleccionado = arrDias.includes(dia);
                                            return (
                                                <button 
                                                    key={dia} 
                                                    type="button" 
                                                    onClick={() => { 
                                                        let arr = [...arrDias]; 
                                                        if (arr.includes(dia)) arr = arr.filter(d => d !== dia && d !== ""); 
                                                        else arr.push(dia); 
                                                        setTareaEditando({...tareaEditando, diasRecurrencia: arr.join(",")}); 
                                                    }} 
                                                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${estaSeleccionado ? 'bg-cyan-500 text-gray-950 shadow-md' : darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'}`}
                                                >
                                                    {dia}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setMostrarModalEditar(false)} className={`w-1/2 py-3 rounded-xl font-medium ${darkMode ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}>Cancelar</button>
                                <button onClick={guardarTareaEditada} className="w-1/2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold py-3 rounded-xl shadow-md">Actualizar</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Tablero