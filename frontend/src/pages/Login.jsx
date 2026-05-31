import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { login, recuperarPasswordService } from "../services/authService"
import { useNavigate, Link } from "react-router-dom"
import logoVix from "../assets/hero.png"

function Login() {
    const navigate = useNavigate()
    
    // Estados del Login
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [darkMode, setDarkMode] = useState(true)
    const [error, setError] = useState("")
    const [cargando, setCargando] = useState(false)

    // 🔥 ESTADOS PARA RECUPERAR CONTRASEÑA 🔥
    const [mostrarModalRecuperar, setMostrarModalRecuperar] = useState(false)
    const [emailRecuperar, setEmailRecuperar] = useState("")
    const [mensajeRecuperar, setMensajeRecuperar] = useState({ tipo: "", texto: "" })
    const [cargandoRecuperar, setCargandoRecuperar] = useState(false)

    const handleLogin = async () => {
        if (!email || !password) {
            setError("Por favor, completa todos los campos.")
            return
        }

        setCargando(true)
        setError("")

        try {
            const datos = { email, password }
            const respuesta = await login(datos)
            
            localStorage.setItem("token", respuesta.token)
            localStorage.setItem("nombre", respuesta.nombre)
            localStorage.setItem("apellido", respuesta.apellido)
            localStorage.setItem("email", respuesta.email)
            localStorage.setItem("rol", respuesta.rol)
            localStorage.setItem("suscripcion", respuesta.estadoSuscripcion || "INACTIVO") 
            
            // Si en el futuro agregas la prueba, la guardamos aquí también
            if(respuesta.pruebaConsumida !== undefined) {
                localStorage.setItem("pruebaConsumida", respuesta.pruebaConsumida)
            }
            
            navigate("/calendario")
        } catch (err) {
            setError(err.response?.data?.mensaje || "Credenciales incorrectas")
        } finally {
            setCargando(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleLogin()
    }

    const handleRecuperarPassword = async (e) => {
        e.preventDefault()
        if (!emailRecuperar.trim()) return

        setCargandoRecuperar(true)
        setMensajeRecuperar({ tipo: "", texto: "" })

        try {
            // Asegúrate de tener exportada esta función en tu authService.js
            const res = await recuperarPasswordService(emailRecuperar)
            setMensajeRecuperar({ tipo: "exito", texto: res })
            setEmailRecuperar("") // Limpiamos el campo
            
            // Cerramos el modal automáticamente después de 4 segundos
            setTimeout(() => {
                setMostrarModalRecuperar(false)
                setMensajeRecuperar({ tipo: "", texto: "" })
            }, 4000)
        } catch (error) {
            setMensajeRecuperar({ 
                tipo: "error", 
                texto: error.response?.data || "Error al solicitar recuperación. Verifica tu correo." 
            })
        } finally {
            setCargandoRecuperar(false)
        }
    }

    return (
        <div className={`${darkMode ? "bg-gray-950" : "bg-gray-50"} min-h-screen flex relative overflow-hidden transition-colors duration-500`}>
            
            {/* Elementos decorativos de fondo interactivos */}
            <div className="absolute w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl top-[-100px] left-[-100px] animate-pulse pointer-events-none"></div>
            <div className="absolute w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl bottom-[-50px] right-[-50px] animate-pulse delay-700 pointer-events-none"></div>

            {/* Controles Superiores */}
            <div className="absolute top-6 left-6 right-6 flex justify-between z-20">
                <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${darkMode ? "bg-gray-900/80 text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800" : "bg-white/80 text-gray-600 hover:text-gray-900 border border-gray-200 shadow-sm"} backdrop-blur-md`}
                >
                    ← Volver
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setDarkMode(!darkMode)}
                    className={`p-3 rounded-xl transition-all duration-300 backdrop-blur-md ${darkMode ? "bg-gray-900/80 border border-gray-800 text-yellow-400 hover:bg-gray-800" : "bg-white/80 border border-gray-200 text-purple-600 shadow-sm hover:bg-gray-50"}`}
                >
                    {darkMode ? "☀️" : "🌙"}
                </motion.button>
            </div>

            {/* Caja de Login */}
            <div className="w-full max-w-md m-auto relative z-10 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
                    className={`${darkMode ? "bg-gray-900/60 border-gray-800" : "bg-white/80 border-gray-200 shadow-2xl"} backdrop-blur-2xl border p-8 rounded-[2rem]`}
                >
                    <div className="text-center mb-8">
                        <motion.img
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                            src={logoVix}
                            alt="Vix Logo"
                            className="w-16 h-16 mx-auto mb-4 drop-shadow-xl"
                        />
                        <h2 className={`text-3xl font-extrabold tracking-tight ${darkMode ? "text-white" : "text-gray-900"}`}>
                            Bienvenido de vuelta
                        </h2>
                        <p className={`mt-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            Ingresa tus credenciales para continuar
                        </p>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, y: -10 }}
                                animate={{ opacity: 1, height: "auto", y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -10 }}
                                className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm font-bold text-center"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mb-5">
                        <label className={`block text-sm font-bold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className={`w-full ${darkMode ? "bg-gray-950/50 border-gray-700 text-white focus:bg-gray-800 placeholder-gray-600" : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"} border rounded-xl px-4 py-3.5 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300`}
                            placeholder="tu@correo.com"
                        />
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <label className={`block text-sm font-bold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                Contraseña
                            </label>
                            
                            {/* 🔥 BOTÓN OLVIDÉ MI CONTRASEÑA 🔥 */}
                            <button 
                                type="button"
                                onClick={() => setMostrarModalRecuperar(true)}
                                className="text-xs font-bold text-cyan-500 hover:text-cyan-400 transition-colors"
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className={`w-full ${darkMode ? "bg-gray-950/50 border-gray-700 text-white focus:bg-gray-800 placeholder-gray-600" : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"} border rounded-xl px-4 py-3.5 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300`}
                            placeholder="••••••••"
                        />
                    </div>

                    <motion.button
                        onClick={handleLogin}
                        disabled={cargando}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all duration-300 text-base disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {cargando ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Conectando...
                            </>
                        ) : (
                            "Iniciar Sesión"
                        )}
                    </motion.button>

                    <p className={`text-center mt-8 text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        ¿No tienes cuenta?{" "}
                        <Link to="/registro" className="text-cyan-500 hover:text-cyan-400 transition-colors">
                            Regístrate gratis
                        </Link>
                    </p>
                </motion.div>
            </div>

            {/* 🔥 MODAL DE RECUPERACIÓN DE CONTRASEÑA 🔥 */}
            <AnimatePresence>
                {mostrarModalRecuperar && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
                        onClick={() => setMostrarModalRecuperar(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20, opacity: 0 }} 
                            animate={{ scale: 1, y: 0, opacity: 1 }} 
                            exit={{ scale: 0.9, y: 20, opacity: 0 }} 
                            onClick={e => e.stopPropagation()} 
                            className={`border rounded-3xl p-8 w-full max-w-sm shadow-2xl ${darkMode ? "bg-gray-900 border-cyan-500/30" : "bg-white border-gray-200"}`}
                        >
                            <div className="w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center mb-4 border border-cyan-500/20">
                                <span className="text-xl">📧</span>
                            </div>
                            <h2 className="text-2xl font-bold mb-2 text-cyan-500">Recuperar Cuenta</h2>
                            <p className={`text-sm mb-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                Ingresa tu correo electrónico y te enviaremos una contraseña temporal para que puedas acceder.
                            </p>

                            <AnimatePresence>
                                {mensajeRecuperar.texto && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                        className={`mb-5 p-3 rounded-xl text-xs font-bold text-center border ${
                                            mensajeRecuperar.tipo === "error" ? "bg-red-500/10 text-red-500 border-red-500/30" : "bg-green-500/10 text-green-500 border-green-500/30"
                                        }`}
                                    >
                                        {mensajeRecuperar.texto}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleRecuperarPassword}>
                                <input 
                                    type="email" required placeholder="Tu correo electrónico"
                                    value={emailRecuperar} onChange={(e) => setEmailRecuperar(e.target.value)}
                                    className={`w-full px-4 py-3.5 mb-6 rounded-xl border focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all ${
                                        darkMode ? "bg-gray-950/50 border-gray-700 text-white placeholder-gray-600" : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
                                    }`}
                                />
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setMostrarModalRecuperar(false)} className={`w-1/2 py-3 rounded-xl font-bold transition-colors ${darkMode ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}>
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={cargandoRecuperar} className="w-1/2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold py-3 rounded-xl shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                        {cargandoRecuperar ? (
                                            <span className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin"></span>
                                        ) : "Enviar Clave"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    )
}

export default Login