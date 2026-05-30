import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { login } from "../services/authService"
import { useNavigate } from "react-router-dom"
import logoVix from "../assets/Hero.png"

function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [darkMode, setDarkMode] = useState(true)
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const handleLogin = async () => {
        try {
        const datos = { email, password }
        const respuesta = await login(datos)
        localStorage.setItem("token", respuesta.token)
        localStorage.setItem("nombre", respuesta.nombre)
        localStorage.setItem("email", respuesta.email)
        localStorage.setItem("rol", respuesta.rol)
        localStorage.setItem("suscripcion", respuesta.estadoSuscripcion || "INACTIVO") // ← usa estadoSuscripcion
        navigate("/calendario")
    } catch (err) {
        setError(err.response?.data?.mensaje || "Credenciales incorrectas")
    }
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleLogin()
    }

    return (
        <div className={`${darkMode ? "bg-gray-950" : "bg-gray-100"} min-h-screen flex relative overflow-hidden transition-all duration-500`}>
            
            {/* Elementos decorativos de fondo */}
            <div className="absolute w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl top-[-100px] left-[-100px] animate-pulse pointer-events-none"></div>
            <div className="absolute w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl bottom-[-50px] right-[-50px] animate-pulse delay-700 pointer-events-none"></div>

            {/* Botón Volver al Inicio */}
            <button
                onClick={() => navigate("/")}
                className={`absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${darkMode ? "bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800" : "bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-sm"}`}
            >
                ← Volver
            </button>

            {/* Toggle Dark Mode */}
            <button
                onClick={() => setDarkMode(!darkMode)}
                className={`absolute top-6 right-6 p-3 rounded-xl transition-all duration-300 ${darkMode ? "bg-gray-800 text-yellow-400 hover:bg-gray-700" : "bg-white text-gray-800 shadow-md hover:bg-gray-50"}`}
            >
                {darkMode ? "☀️" : "🌙"}
            </button>

            <div className="w-full max-w-md m-auto relative z-10 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`${darkMode ? "bg-gray-900/80 border-gray-800" : "bg-white border-gray-200 shadow-xl"} backdrop-blur-xl border p-8 rounded-3xl`}
                >
                    <div className="text-center mb-8">
                        <motion.img
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            src={logoVix}
                            alt="Vix Logo"
                            className="w-16 h-16 mx-auto mb-4"
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
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm font-medium text-center"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mb-5">
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className={`w-full ${darkMode ? "bg-gray-800 border-gray-700 text-white focus:bg-gray-800" : "bg-gray-100 border-gray-300 text-gray-800"} border rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all duration-300`}
                            placeholder="tu@correo.com"
                        />
                    </div>

                    <div className="mb-6">
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className={`w-full ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-100 border-gray-300 text-gray-800"} border rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all duration-300`}
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="text-right mb-6">
                        <a href="#" className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors">
                            ¿Olvidaste tu contraseña?
                        </a>
                    </div>

                    <motion.button
                        onClick={handleLogin}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold py-3 rounded-xl transition-all duration-300 text-lg"
                    >
                        Iniciar Sesión
                    </motion.button>

                    <p className="text-gray-400 text-center mt-6 text-sm">
                        ¿No tienes cuenta?{" "}
                        <a href="/registro" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                            Regístrate
                        </a>
                    </p>
                </motion.div>
            </div>
        </div>
    )
}

export default Login