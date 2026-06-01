import { useContext, useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import { ThemeContext } from "../context/ThemeContext"
import axios from "axios"
import { crearSuscripcion } from "../services/authService"

function Plan() {
    const { darkMode } = useContext(ThemeContext)
    const navigate = useNavigate()
    const token = localStorage.getItem("token")
    const suscripcionActual = localStorage.getItem("suscripcion") || "INACTIVO"
    
    const [pruebaConsumida, setPruebaConsumida] = useState(
        () => localStorage.getItem("pruebaConsumida") === "true"
    )
    
    const [cargandoPago, setCargandoPago] = useState(false)
    const [cargandoPrueba, setCargandoPrueba] = useState(false)
    const [cargandoCancelar, setCargandoCancelar] = useState(false)

    const caracteristicasGratis = [
        "📅 Calendario personal interactivo",
        "📋 Tablero Kanban individual ilimitado",
        "🚀 Proyectos colaborativos ilimitados",
        "👥 Tableros grupales en tiempo real",
        "🤝 Buscador y lista de amigos unidos"
    ]

    const caracteristicasPremium = [
        "✨ Todo lo incluido en el plan Gratuito",
        "🔥 Seguimiento avanzado de Hábitos personales",
        "📊 Dashboard de Métricas y gráficos de productividad",
        "📄 Exportación formal de reportes a PDF",
        "🔗 Enlaces públicos para mostrar proyectos a clientes",
        "⚡ Soporte prioritario y alta disponibilidad"
    ]

    const iniciarPagoPremium = async () => {
        const email = localStorage.getItem("email")
        const tokenGuardado = localStorage.getItem("token")
        
        if (!email || !tokenGuardado) {
            alert("Debes iniciar sesión para suscribirte.")
            return
        }

        try {
            setCargandoPago(true)
            const respuesta = await crearSuscripcion(email, tokenGuardado)
            if (respuesta && respuesta.url) {
                window.location.href = respuesta.url
            } else {
                alert("No se pudo obtener el enlace de pago. Intenta de nuevo.")
            }
        } catch (error) {
            console.error("Error al iniciar suscripción:", error)
            alert("Error al conectar con Mercado Pago.")
        } finally {
            setCargandoPago(false)
        }
    }

    const canjearMesGratis = async () => {
        try {
            setCargandoPrueba(true)
            const res = await axios.post(
                "https://api.vix-flow.com/api/usuarios/canjear-prueba",
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            )
            alert(res.data || "¡Mes premium activado con éxito!")
            localStorage.setItem("suscripcion", "ACTIVO")
            localStorage.setItem("pruebaConsumida", "true")
            setPruebaConsumida(true)
            navigate("/calendario")
        } catch (error) {
            alert(error.response?.data || "No se pudo procesar la solicitud.")
        } finally {
            setCargandoPrueba(false)
        }
    }

    const handleCancelarSuscripcion = async () => {
        if (!window.confirm(
            "¿Estás seguro de cancelar tu suscripción Premium? Perderás acceso a las funciones Premium."
        )) return

        try {
            setCargandoCancelar(true)
            const res = await axios.post(
                "https://api.vix-flow.com/api/pagos/cancelar-suscripcion",
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            )
            alert(res.data)
            localStorage.setItem("suscripcion", "INACTIVO")
            navigate("/calendario")
        } catch (error) {
            alert(error.response?.data || "Error al cancelar la suscripción")
        } finally {
            setCargandoCancelar(false)
        }
    }

    return (
        <div className={`${darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"} min-h-screen transition-colors duration-300`}>
            <Navbar />

            {darkMode && (
                <>
                    <div className="fixed w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl top-10 left-10 pointer-events-none"></div>
                    <div className="fixed w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl bottom-10 right-10 pointer-events-none"></div>
                </>
            )}

            <div className="p-6 relative z-10 max-w-5xl mx-auto mt-10">
                
                <div className="text-center mb-16">
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent"
                    >
                        Elige tu camino hacia la productividad
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        transition={{ delay: 0.2 }}
                        className={`mt-4 text-lg font-medium max-w-xl mx-auto ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                        Trabaja en equipo de forma gratuita o desbloquea el control absoluto de tu rendimiento.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
                    
                    {/* PLAN GRATUITO */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }} 
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ y: -5 }}
                        className={`rounded-3xl border p-8 flex flex-col justify-between transition-all ${
                            darkMode ? "bg-gray-900/40 border-gray-800 hover:border-gray-700" : "bg-white border-gray-200 shadow-xl shadow-gray-100"
                        }`}
                    >
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold">Plan Esencial</h2>
                                    <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Para organizar tus equipos</p>
                                </div>
                                {suscripcionActual !== "ACTIVO" && (
                                    <span className="text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                        Plan Activo
                                    </span>
                                )}
                            </div>

                            <div className="my-6">
                                <span className="text-4xl font-extrabold">$0</span>
                                <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}> / para siempre</span>
                            </div>

                            <hr className={`my-6 ${darkMode ? "border-gray-800" : "border-gray-100"}`} />

                            <ul className="space-y-4">
                                {caracteristicasGratis.map((feat, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-medium">
                                        <span className="text-green-400 shrink-0">✓</span>
                                        <span className={darkMode ? "text-gray-300" : "text-gray-700"}>{feat}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-8">
                            <motion.button 
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate("/calendario")}
                                className={`w-full py-3 rounded-xl font-bold text-sm transition-all border ${
                                    darkMode 
                                        ? "bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-800" 
                                        : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                {suscripcionActual !== "ACTIVO" ? "Ir a mi espacio" : "Plan básico incluido"}
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* PLAN PREMIUM */}
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }} 
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ y: -5 }}
                        className={`rounded-3xl border p-8 flex flex-col justify-between relative transition-all overflow-hidden ${
                            darkMode 
                                ? "bg-gradient-to-b from-purple-500/10 to-purple-500/0 border-purple-500/30 hover:border-purple-500/50 shadow-xl shadow-purple-500/5" 
                                : "bg-white border-purple-200 shadow-xl shadow-purple-100/50"
                        }`}
                    >
                        <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-500 to-pink-500 text-white font-extrabold text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-bl-xl shadow-md">
                            Recomendado
                        </div>

                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-purple-400">Vix-Flow Premium</h2>
                                    <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Potencia total e informes</p>
                                </div>
                                {suscripcionActual === "ACTIVO" && (
                                    <span className="text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                        Premium Activo 💎
                                    </span>
                                )}
                            </div>

                            <div className="my-6">
                                <span className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                                    $3.000
                                </span>
                                <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}> CLP / mes</span>
                            </div>

                            <hr className={`my-6 ${darkMode ? "border-purple-500/20" : "border-gray-100"}`} />

                            <ul className="space-y-4">
                                {caracteristicasPremium.map((feat, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-medium">
                                        <span className="text-purple-400 font-bold shrink-0">★</span>
                                        <span className={darkMode ? "text-gray-300" : "text-gray-700"}>{feat}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-8 space-y-3">
                            {suscripcionActual === "ACTIVO" ? (
                                <>
                                    <motion.button 
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate("/calendario")}
                                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-xl text-sm shadow-lg shadow-purple-500/20 transition-all"
                                    >
                                        ¡Disfrutar de mi cuenta Premium!
                                    </motion.button>

                                    {/* BOTÓN CANCELAR */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleCancelarSuscripcion}
                                        disabled={cargandoCancelar}
                                        className={`w-full font-bold py-3 rounded-xl text-sm transition-all border flex items-center justify-center gap-2 disabled:opacity-50 ${
                                            darkMode
                                                ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white"
                                                : "bg-red-50 border-red-200 text-red-600 hover:bg-red-500 hover:text-white"
                                        }`}
                                    >
                                        {cargandoCancelar ? (
                                            <span className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></span>
                                        ) : (
                                            "Cancelar suscripción Premium"
                                        )}
                                    </motion.button>
                                </>
                            ) : (
                                <>
                                    <motion.button 
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={iniciarPagoPremium}
                                        disabled={cargandoPago || cargandoPrueba}
                                        className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white font-bold py-3 rounded-xl text-sm shadow-lg shadow-blue-500/20 hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        {cargandoPago ? ( 
                                            <>
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                                Conectando con Mercado Pago...
                                            </>
                                        ) : (
                                            "Mejorar a Premium con Mercado Pago"
                                        )}
                                    </motion.button>

                                    {!pruebaConsumida && (
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={canjearMesGratis}
                                            disabled={cargandoPago || cargandoPrueba}
                                            className={`w-full font-bold py-3 rounded-xl text-sm transition-all border flex items-center justify-center gap-2 disabled:opacity-50 ${
                                                darkMode 
                                                    ? "bg-gray-900 border-purple-500/40 text-purple-400 hover:bg-purple-500/10" 
                                                    : "bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100"
                                            }`}
                                        >
                                            {cargandoPrueba ? (
                                                <>
                                                    <span className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></span>
                                                    Validando cupón...
                                                </>
                                            ) : (
                                                "🎁 Canjea tu mes gratis de prueba"
                                            )}
                                        </motion.button>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>

                <p className={`text-center text-xs mt-12 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                    Pagos procesados de forma segura mediante Mercado Pago. Puedes cancelar tu renovación mensual en cualquier momento.
                </p>
            </div>
        </div>
    )
}

export default Plan