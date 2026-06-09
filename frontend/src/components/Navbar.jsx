import { useState, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate, useLocation, Link } from "react-router-dom"
import logoVix from "../assets/hero.png" 
import { ThemeContext } from "../context/ThemeContext"

function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()
    const nombre = localStorage.getItem("nombre")
    const token = localStorage.getItem("token")
    
    // 🔥 VALIDACIÓN INFALIBLE: Atrapa "ADMIN", '"ADMIN"' (con comillas) o "ROLE_ADMIN"
    const rolGuardado = localStorage.getItem("rol") || ""
    const esAdmin = rolGuardado.toUpperCase().includes("ADMIN")

    // 🔥 NUEVA VALIDACIÓN PREMIUM 🔥
    const suscripcion = localStorage.getItem("suscripcion") || "INACTIVO"
    const tieneAccesoPremium = suscripcion === "ACTIVO" || esAdmin
    
    const [menuAbierto, setMenuAbierto] = useState(false)
    const { darkMode, setDarkMode } = useContext(ThemeContext)

    const cerrarSesion = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("nombre")
        localStorage.removeItem("email")
        localStorage.removeItem("rol")
        navigate("/login")
    }

    // 🌟 SEPARAMOS LOS LINKS PARA CONTROLAR QUIÉN VE QUÉ
    const linksBase = [
        { nombre: "Calendario", ruta: "/calendario", emoji: "📅" },
        { nombre: "Tablero", ruta: "/tablero", emoji: "🗂️" },
        { nombre: "Proyectos", ruta: "/proyectos", emoji: "🚀" },
        { nombre: "Cuadernos", ruta: "/cuadernos", emoji: "📓" }, // ✨ NUEVA RUTA AGREGADA ✨
        { nombre: "Amigos", ruta: "/amigos", emoji: "👥" },
        { nombre: "Soporte", ruta: "/soporte", emoji: "🎧" }
    ]

    // Si no es premium, le ponemos el candado y la ruta lo enviará a comprar
    const linksPremium = [
        { 
            nombre: "Hábitos", 
            ruta: tieneAccesoPremium ? "/habitos" : "/plan", 
            emoji: tieneAccesoPremium ? "🌱" : "🔒" 
        },
        { 
            nombre: "Métricas", 
            ruta: tieneAccesoPremium ? "/metricas" : "/plan", 
            emoji: tieneAccesoPremium ? "📊" : "🔒" 
        }
    ]

    // Unimos todos los links en un solo arreglo
    const links = [...linksBase, ...linksPremium]

    return (
        <nav className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 ${
            darkMode ? "bg-gray-950/80 border-gray-800" : "bg-white/80 border-gray-200"
        }`}>
            {/* Contenedor más amplio para que respiren los elementos */}
            <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Layout distribuido en 3 columnas perfectas */}
                <div className="flex items-center justify-between h-16">
                    
                    {/* 1. IZQUIERDA: Logo (Toma 1/3 del espacio para empujar el centro) */}
                    <div className="flex-1 flex justify-start">
                        <div className="flex-shrink-0 flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate("/dashboard")}>
                            <img className="h-8 w-auto" src={logoVix} alt="VixCalendario" />
                            <span className="ml-2 text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent hidden sm:block">
                                Vix-Flow
                            </span>
                        </div>
                    </div>

                    {/* 2. CENTRO: Enlaces (Aparecen solo en pantallas grandes XL para evitar amontonarse) */}
                    <div className="hidden xl:flex items-center justify-center space-x-1">
                        {links.map((link) => (
                            <Link
                                key={link.nombre}
                                to={link.ruta}
                                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                                    location.pathname === link.ruta
                                        ? "bg-cyan-500/10 text-cyan-500"
                                        : darkMode
                                            ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                } ${link.emoji === "🔒" ? "opacity-60 hover:opacity-100" : ""}`}
                                title={link.emoji === "🔒" ? "Sube a Premium para desbloquear" : ""}
                            >
                                <span>{link.emoji}</span>
                                <span>{link.nombre}</span>
                            </Link>
                        ))}
                        
                        {esAdmin && (
                            <Link
                                to="/admin"
                                className="px-3 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-1.5 ml-2"
                            >
                                <span>🛡️</span> Admin
                            </Link>
                        )}
                    </div>

                    {/* 3. DERECHA: Controles (Toma 1/3 del espacio, se alinea al final) */}
                    <div className="flex-1 flex items-center justify-end gap-3 sm:gap-4">
                        
                        {/* Botón Tema Oscuro */}
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`p-2 rounded-full transition-colors ${
                                darkMode ? "bg-gray-800 text-yellow-400 hover:bg-gray-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            {darkMode ? "☀️" : "🌙"}
                        </button>

                        {/* Perfil o Login */}
                        {token ? (
                            <div className="relative group cursor-pointer hidden sm:block">
                                <div 
                                    onClick={() => navigate("/perfil")}
                                    className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-2 rounded-full font-medium shadow-md hover:shadow-lg transition-all"
                                >
                                    <span className="text-sm">👤 {nombre}</span>
                                </div>
                                {/* Dropdown menú */}
                                <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-lg py-1 border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ${
                                    darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
                                }`}>
                                    <button
                                        onClick={() => navigate("/perfil")}
                                        className={`block w-full text-left px-4 py-2 text-sm ${
                                            darkMode ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        Mi Perfil
                                    </button>
                                    <button
                                        onClick={cerrarSesion}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                    >
                                        Cerrar Sesión 🚪
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => navigate("/login")} className="hidden sm:block text-cyan-500 font-medium hover:text-cyan-600 px-2">
                                Iniciar Sesión
                            </button>
                        )}

                        {/* Botón Hamburger (Aparece en tablets y resoluciones de laptop bajas) */}
                        <button
                            onClick={() => setMenuAbierto(!menuAbierto)}
                            className={`xl:hidden p-2 rounded-lg ${darkMode ? "text-gray-300 bg-gray-800" : "text-gray-600 bg-gray-100"}`}
                        >
                            {menuAbierto ? "✖" : "☰"}
                        </button>

                    </div>
                </div>
            </div>

            {/* 🔥 MENÚ MÓVIL Y TABLET DESPLEGABLE 🔥 */}
            <AnimatePresence>
                {menuAbierto && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`xl:hidden border-t overflow-hidden ${darkMode ? "bg-gray-950 border-gray-800" : "bg-white border-gray-200"}`}
                    >
                        <div className="px-4 pt-3 pb-4 space-y-1">
                            {links.map((link) => (
                                <Link
                                    key={link.nombre}
                                    to={link.ruta}
                                    onClick={() => setMenuAbierto(false)}
                                    className={`flex items-center gap-3 px-3 py-3.5 rounded-xl text-base font-medium ${
                                        location.pathname === link.ruta
                                            ? "bg-cyan-500/10 text-cyan-500"
                                            : darkMode ? "text-gray-300 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-100"
                                    } ${link.emoji === "🔒" ? "opacity-60" : ""}`}
                                >
                                    <span>{link.emoji}</span>
                                    <span>{link.nombre}</span>
                                </Link>
                            ))}

                            {esAdmin && (
                                <Link
                                    to="/admin"
                                    onClick={() => setMenuAbierto(false)}
                                    className="flex items-center gap-3 px-3 py-3.5 rounded-xl text-base font-bold text-red-500 hover:bg-red-500/10 mt-2"
                                >
                                    <span>🛡️</span>
                                    <span>Panel Admin</span>
                                </Link>
                            )}
                        </div>

                        {/* Controles de Sesión en Móvil/Tablet */}
                        {token ? (
                            <div className="px-4 pb-4">
                                <div className="border-t mb-2 border-gray-200 dark:border-gray-800"></div>
                                <button
                                    onClick={() => { navigate("/perfil"); setMenuAbierto(false) }}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all ${
                                        location.pathname === "/perfil"
                                            ? 'bg-purple-500 text-white font-bold'
                                            : darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                                >
                                    <span className="text-xl">👤</span>
                                    <span>Mi Perfil ({nombre})</span>
                                </button>
                                <button
                                    onClick={cerrarSesion}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-base font-bold bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all mt-2"
                                >
                                    Cerrar Sesión 🚪
                                </button>
                            </div>
                        ) : (
                            <div className="px-4 pb-4">
                                <div className="border-t mb-2 border-gray-200 dark:border-gray-800"></div>
                                <button 
                                    onClick={() => { navigate("/login"); setMenuAbierto(false) }} 
                                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold py-3.5 rounded-xl transition-all"
                                >
                                    Iniciar Sesión
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}

export default Navbar