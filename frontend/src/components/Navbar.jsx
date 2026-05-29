import { useState, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate, useLocation } from "react-router-dom"
import logoVix from "../assets/Hero.png" 
import { ThemeContext } from "../context/ThemeContext"

function Navbar(){
    const navigate = useNavigate()
    const location = useLocation()
    const nombre = localStorage.getItem("nombre")
    const [menuAbierto, setMenuAbierto] = useState(false)
    const { darkMode, setDarkMode } = useContext(ThemeContext)

    const cerrarSesion = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("nombre")
        localStorage.removeItem("email")
        navigate("/login")
    }

    const links = [
        { nombre: "Calendario", ruta: "/calendario", emoji: "📅" },
        { nombre: "Tablero", ruta: "/tablero", emoji: "🗂️" },
        { nombre: "Amigos", ruta: "/amigos", emoji: "👥" },
        { nombre: "Proyectos", ruta: "/proyectos", emoji: "🚀" },
        { nombre: "Métricas", ruta: "/metricas", emoji: "📊" },
    ]

    return (
        <nav className={`${darkMode ? 'bg-gray-900/90 border-cyan-500/20' : 'bg-white/90 border-gray-200'} backdrop-blur-md border-b px-6 py-2 sticky top-0 z-50 overflow-visible transition-colors duration-300`}>
            <div className="flex items-center justify-between max-w-7xl mx-auto h-16">

                {/* Contenedor del Logo */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="cursor-pointer relative w-fit h-full flex items-center"
                    onClick={() => navigate("/calendario")}
                >
                    <motion.img
                        src={logoVix}
                        alt="Vix-Flow Logo"
                        className="w-24 h-24 object-contain absolute top-1/2 -translate-y-1/2 left-2 select-none z-10"
                        animate={{ rotate: [0, 3, -3, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent select-none pl-28 z-0 relative">
                        Vix-Flow
                    </span>
                </motion.div>

                {/* Links de escritorio */}
                <div className="hidden md:flex items-center gap-1">
                    {links.map((link) => (
                        <motion.button
                            key={link.ruta}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(link.ruta)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all duration-300
                                ${location.pathname === link.ruta 
                                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" 
                                    : darkMode 
                                        ? "text-gray-400 hover:text-white hover:bg-gray-800" 
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
                        >
                            <span>{link.emoji}</span>
                            {link.nombre}
                        </motion.button>
                    ))}
                </div>

                {/* Sección de Usuario */}
                <div className="flex items-center gap-3">
                    {/* Botón de cambio de modo Sol / Luna */}
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`px-3 py-2 rounded-xl text-sm transition-all duration-300 ${
                            darkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        }`}
                        title={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                    >
                        {darkMode ? "☀️" : "🌙"}
                    </button>

                    {/* Botón del Perfil de Usuario */}
                    <div 
                        onClick={() => navigate("/perfil")}
                        className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all ${
                            darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        title="Ir a mi perfil"
                    >
                        <div className="w-7 h-7 bg-cyan-500/20 border border-cyan-500/30 rounded-full flex items-center justify-center text-cyan-400 text-xs font-bold">
                            {nombre?.charAt(0).toUpperCase()}
                        </div>
                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{nombre}</span>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={cerrarSesion}
                        className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-3 py-2 rounded-xl text-sm transition-all duration-300"
                    >
                        Salir 👋
                    </motion.button>

                    {/* Botón menú móvil */}
                    <button
                        onClick={() => setMenuAbierto(!menuAbierto)}
                        className={`md:hidden ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        ☰
                    </button>
                </div>
            </div>

            {/* Desplegable móvil */}
            <AnimatePresence>
                {menuAbierto && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`md:hidden mt-3 border-t pt-3 ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}
                    >
                        <button
                            onClick={() => { navigate("/perfil"); setMenuAbierto(false) }}
                            className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                                darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                            👤 Mi Perfil
                        </button>
                        
                        {links.map((link) => (
                            <button
                                key={link.ruta}
                                onClick={() => { navigate(link.ruta); setMenuAbierto(false) }}
                                className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                                    darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                {link.emoji} {link.nombre}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}

export default Navbar