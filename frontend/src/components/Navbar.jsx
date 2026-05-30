import { useState, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate, useLocation } from "react-router-dom"
import logoVix from "../assets/Hero.png" 
import { ThemeContext } from "../context/ThemeContext"

function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()
    const nombre = localStorage.getItem("nombre")
    const token = localStorage.getItem("token")
    
    // 🔥 VALIDACIÓN INFALIBLE: Atrapa "ADMIN", '"ADMIN"' (con comillas) o "ROLE_ADMIN"
    const rolGuardado = localStorage.getItem("rol") || ""
    const esAdmin = rolGuardado.toUpperCase().includes("ADMIN")
    
    const [menuAbierto, setMenuAbierto] = useState(false)
    const { darkMode, setDarkMode } = useContext(ThemeContext)

    const cerrarSesion = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("nombre")
        localStorage.removeItem("email")
        localStorage.removeItem("rol")
        navigate("/login")
    }

    const links = [
        { nombre: "Calendario", ruta: "/calendario", emoji: "📅" },
        { nombre: "Tablero", ruta: "/tablero", emoji: "🗂️" },
        { nombre: "Hábitos", ruta: "/habitos", emoji: "🌱" },
        { nombre: "Amigos", ruta: "/amigos", emoji: "👥" },
        { nombre: "Proyectos", ruta: "/proyectos", emoji: "🚀" },
        { nombre: "Métricas", ruta: "/metricas", emoji: "📊" },
        { nombre: "Planes", ruta: "/plan", emoji: "💎" },
    ]

    // Agrega de forma condicional el acceso al panel si es ADMIN
    if (esAdmin) {
        links.push({ nombre: "Admin", ruta: "/admin", emoji: "👑" })
    }

    // Navegación inteligente para el logo
    const handleLogoClick = () => {
        if (token) {
            navigate("/calendario")
        } else {
            navigate("/")
        }
    }

    return (
        <nav className={`w-full sticky top-0 z-50 border-b transition-colors duration-300 ${
            darkMode ? 'bg-gray-900/90 border-cyan-500/20 text-white' : 'bg-white/90 border-gray-200 text-gray-900'
        } backdrop-blur-md`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    
                    {/* Logo e Identidad */}
                    <div className="flex items-center gap-2 cursor-pointer shrink-0 mr-2" onClick={handleLogoClick}>
                        <img src={logoVix} alt="Vix Logo" className="h-10 w-auto object-contain" />
                        <span className="hidden sm:block font-bold text-xl tracking-wider bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                            Vix-Flow
                        </span>
                    </div>

                    {/* Menú de Navegación de Escritorio - MÁRGENES REDUCIDOS (gap-1 xl:gap-3) PARA QUE QUEPA TODO */}
                    <div className="hidden lg:flex items-center justify-center flex-1 gap-1 xl:gap-3">
                        {links.map((link) => {
                            const isActive = location.pathname === link.ruta
                            return (
                                <button
                                    key={link.ruta}
                                    onClick={() => navigate(link.ruta)}
                                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                                        isActive 
                                            ? 'bg-cyan-500 text-gray-950 font-bold shadow-lg shadow-cyan-500/20' 
                                            : darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                                >
                                    <span className="text-base">{link.emoji}</span>
                                    <span>{link.nombre}</span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Acciones de Perfil / Sistema en Escritorio */}
                    <div className="hidden lg:flex items-center gap-2 ml-2 shrink-0">
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`p-2 rounded-xl transition-all ${darkMode ? 'hover:bg-gray-800 text-yellow-400' : 'hover:bg-gray-100 text-purple-600'}`}
                            title="Cambiar tema"
                        >
                            {darkMode ? "☀️" : "🌙"}
                        </button>
                        
                        {nombre && (
                            <button
                                onClick={() => navigate("/perfil")}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                                    location.pathname === "/perfil"
                                        ? 'bg-purple-500 text-white font-bold'
                                        : darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                <span className="text-base">👤</span>
                                <span className="max-w-[80px] xl:max-w-[120px] truncate">{nombre}</span>
                            </button>
                        )}

                        <button
                            onClick={cerrarSesion}
                            className="px-3 py-2 rounded-xl text-sm font-medium bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                        >
                            Salir
                        </button>
                    </div>

                    {/* Bloque Móvil (Theme toggle + Hamburguesa) */}
                    <div className="flex lg:hidden items-center gap-3">
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`p-2 rounded-xl ${darkMode ? 'text-yellow-400' : 'text-purple-600'}`}
                        >
                            {darkMode ? "☀️" : "🌙"}
                        </button>
                        <button
                            onClick={() => setMenuAbierto(!menuAbierto)}
                            className={`p-2 rounded-xl transition-all ${darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <span className="text-xl font-bold">{menuAbierto ? "❌" : "☰"}</span>
                        </button>
                    </div>

                </div>
            </div>

            {/* Menú Desplegable para Móviles / Tablets */}
            <AnimatePresence>
                {menuAbierto && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="lg:hidden border-t bg-white dark:bg-gray-900 px-4 pt-4 pb-6 space-y-2 shadow-xl overflow-hidden border-gray-200 dark:border-gray-800"
                    >
                        {links.map((link) => {
                            const isActive = location.pathname === link.ruta
                            return (
                                <button
                                    key={link.ruta}
                                    onClick={() => { navigate(link.ruta); setMenuAbierto(false) }}
                                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                                        isActive
                                            ? 'bg-cyan-500 text-gray-950 font-bold'
                                            : darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                                >
                                    <span className="text-xl">{link.emoji}</span>
                                    <span>{link.nombre}</span>
                                </button>
                            )
                        })}

                        {nombre && (
                            <button
                                onClick={() => { navigate("/perfil"); setMenuAbierto(false) }}
                                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium transition-all mt-2 ${
                                    location.pathname === "/perfil"
                                        ? 'bg-purple-500 text-white font-bold'
                                        : darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                <span className="text-xl">👤</span>
                                <span>Mi Perfil ({nombre})</span>
                            </button>
                        )}

                        <div className="pt-4 mt-2 border-t border-gray-200 dark:border-gray-800">
                            <button
                                onClick={cerrarSesion}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-medium bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                            >
                                Cerrar Sesión 🚪
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}

export default Navbar