import { useState, useContext } from "react"
import { motion } from "framer-motion"
import { registrar } from "../services/authService"
import { useNavigate } from "react-router-dom"
import { ThemeContext } from "../context/ThemeContext"

function Registro(){
    const [nombre, setNombre] = useState("")
    const [apellido, setApellido] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    
    // NUEVO ESTADO: Para el checkbox de los términos
    const [aceptaTerminos, setAceptaTerminos] = useState(false)
    
    const { darkMode, setDarkMode } = useContext(ThemeContext)
    const [mensaje, setMensaje] = useState("")
    const [error, setError] = useState("")
    
    const navigate = useNavigate()

    const handleRegistro = async () => {
        // NUEVA VALIDACIÓN: Revisar que los términos estén aceptados
        if (!aceptaTerminos) {
            setError("Debes aceptar los Términos y Condiciones para registrarte.")
            setMensaje("")
            return
        }

        try {
            const datos = { nombre, apellido, email, password }
            const respuesta = await registrar(datos)
            setMensaje(respuesta)
            setError("")
            
            setTimeout(() => {
                navigate("/login")
            }, 2000)

        } catch (err) {
            setError(err.response?.data?.mensaje || "Error al registrarse")
            setMensaje("")
        }
    }

    return (
        <div className={`${darkMode ? "bg-gray-950" : "bg-gray-100"} min-h-screen flex relative overflow-hidden transition-all duration-500`}>
            
            <div className="absolute w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl top-0 left-0"></div>
            <div className="absolute w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl bottom-0 right-0"></div>

            <button
                onClick={() => navigate("/")}
                className="absolute top-4 left-4 z-50 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-full text-sm transition-all duration-300 flex items-center gap-2 shadow-lg"
            >
                <span>←</span> Volver al inicio
            </button>

            <button
                onClick={() => setDarkMode(!darkMode)}
                className="absolute top-4 right-4 z-50 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-full text-sm transition-all duration-300 shadow-lg"
            >
                {darkMode ? "☀️ Modo Claro" : "🌙 Modo Oscuro"}
            </button>

            <div className="hidden md:flex w-1/2 flex-col items-center justify-center p-16 relative">
                <motion.div
                    animate={{ rotate: 360, y: [0, -20, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    className="text-9xl mb-8"
                >
                    🚀
                </motion.div>
                <h1 className={`text-5xl font-bold ${darkMode ? "text-white" : "text-gray-800"} mb-4 text-center transition-colors duration-500`}>
                    Vix-Flow
                </h1>
                <p className={`text-center text-lg ${darkMode ? "text-gray-400" : "text-gray-600"} transition-colors duration-500`}>
                    Comienza a organizar tu vida hoy mismo
                </p>
            </div>

            <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-16">
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className={`${darkMode ? "bg-gray-900/80 border-cyan-500/30" : "bg-white border-gray-200 shadow-xl"} backdrop-blur-sm border p-10 rounded-3xl w-full max-w-md shadow-cyan-500/10 transition-colors duration-500`}
                >
                    <h2 className={`text-3xl font-bold ${darkMode ? "text-cyan-400" : "text-cyan-600"} text-center mb-2`}>
                        Crear Cuenta
                    </h2>
                    <p className={`text-center mb-6 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Completa tus datos para registrarte
                    </p>

                    {mensaje && (
                        <div className="bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-3 rounded-xl mb-4 text-sm text-center font-medium">
                            {mensaje}. Redirigiendo a inicio de sesión...
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl mb-4 text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-4 mb-4">
                        <div className="w-1/2">
                            <label className={`text-sm mb-1 block font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Nombre</label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className={`w-full ${darkMode ? "bg-gray-950/50 border-gray-800 text-white focus:border-cyan-500" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-cyan-500"} border rounded-xl px-4 py-3 focus:outline-none transition-all duration-300`}
                                placeholder="Juan"
                            />
                        </div>
                        <div className="w-1/2">
                            <label className={`text-sm mb-1 block font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Apellido</label>
                            <input
                                type="text"
                                value={apellido}
                                onChange={(e) => setApellido(e.target.value)}
                                className={`w-full ${darkMode ? "bg-gray-950/50 border-gray-800 text-white focus:border-cyan-500" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-cyan-500"} border rounded-xl px-4 py-3 focus:outline-none transition-all duration-300`}
                                placeholder="Pérez"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className={`text-sm mb-1 block font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full ${darkMode ? "bg-gray-950/50 border-gray-800 text-white focus:border-cyan-500" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-cyan-500"} border rounded-xl px-4 py-3 focus:outline-none transition-all duration-300`}
                            placeholder="tucorreo@gmail.com"
                        />
                    </div>

                    <div className="mb-6">
                        <label className={`text-sm mb-1 block font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full ${darkMode ? "bg-gray-950/50 border-gray-800 text-white focus:border-cyan-500" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-cyan-500"} border rounded-xl px-4 py-3 focus:outline-none transition-all duration-300`}
                            placeholder="••••••••"
                        />
                    </div>

                    {/* NUEVO: Checkbox de Términos y Condiciones */}
                    <div className="mb-6 flex items-start gap-3">
                        <div className="flex items-center h-5">
                            <input
                                type="checkbox"
                                id="terminos"
                                checked={aceptaTerminos}
                                onChange={(e) => setAceptaTerminos(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-600 text-cyan-500 focus:ring-cyan-500 focus:ring-2 bg-gray-800 cursor-pointer transition-all"
                            />
                        </div>
                        <label htmlFor="terminos" className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"} cursor-pointer`}>
                            He leído y acepto los{" "}
                            <a href="#" className="text-cyan-500 hover:text-cyan-400 hover:underline transition-colors">Términos y Condiciones</a>
                            {" "}y la{" "}
                            <a href="#" className="text-cyan-500 hover:text-cyan-400 hover:underline transition-colors">Política de Privacidad</a>.
                        </label>
                    </div>

                    <motion.button
                        onClick={handleRegistro}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold py-3 rounded-xl transition-all duration-300 text-lg shadow-lg shadow-cyan-500/20"
                    >
                        Crear Cuenta
                    </motion.button>

                    <p className={`text-center mt-6 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        ¿Ya tienes cuenta?{" "}
                        <a href="/login" className="text-cyan-500 hover:text-cyan-400 font-medium transition-colors">
                            Inicia Sesión
                        </a>
                    </p>
                </motion.div>
            </div>
        </div>
    )
}

export default Registro