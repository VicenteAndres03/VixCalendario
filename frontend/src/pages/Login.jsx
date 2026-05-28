import { useState } from "react"
import { motion } from "framer-motion"
import { login } from "../services/authService"
import { useNavigate } from "react-router-dom"

function Login(){
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
            
            <div className="absolute w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl top-0 left-0"></div>
            <div className="absolute w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl bottom-0 right-0"></div>

            <button
                onClick={() => setDarkMode(!darkMode)}
                className="absolute top-4 right-4 z-50 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-full text-sm transition-all duration-300"
            >
                {darkMode ? "☀️ Modo Claro" : "🌙 Modo Oscuro"}
            </button>

            {/* Lado izquierdo */}
            <div className="hidden md:flex w-1/2 flex-col items-center justify-center p-16 relative">
                <motion.div
                    animate={{ rotate: 360, y: [0, -20, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    className="text-9xl mb-8"
                >
                    📅
                </motion.div>
                <h1 className={`text-5xl font-bold ${darkMode ? "text-white" : "text-gray-800"} mb-4 text-center`}>
                    Vix-Flow
                </h1>
                <p className="text-gray-400 text-center text-lg">
                    Organiza tu día, semana y mes de manera inteligente
                </p>
            </div>

            {/* Formulario */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-16">
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className={`${darkMode ? "bg-gray-900/80 border-cyan-500/30" : "bg-white border-gray-200"} backdrop-blur-sm border p-10 rounded-3xl w-full max-w-md shadow-2xl shadow-cyan-500/10`}
                >
                    <h2 className={`text-3xl font-bold ${darkMode ? "text-cyan-400" : "text-cyan-600"} text-center mb-2`}>
                        Bienvenido
                    </h2>
                    <p className="text-gray-400 text-center mb-8 text-sm">
                        Ingresa tus credenciales para continuar
                    </p>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded-xl mb-4 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="text-gray-400 text-sm mb-1 block">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className={`w-full ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-100 border-gray-300 text-gray-800"} border rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all duration-300`}
                            placeholder="tucorreo@gmail.com"
                        />
                    </div>

                    <div className="mb-2">
                        <label className="text-gray-400 text-sm mb-1 block">Contraseña</label>
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