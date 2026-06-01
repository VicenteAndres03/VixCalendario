import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { ThemeContext } from '../context/ThemeContext';
import { motion } from 'framer-motion';

function AceptarInvitacion() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { darkMode } = useContext(ThemeContext);
    const [mensaje, setMensaje] = useState("Procesando tu invitación...");
    const [exito, setExito] = useState(null);
    
    useEffect(() => {
        const aceptar = async () => {
            const authToken = localStorage.getItem("token");
            
            // Si el usuario no está logueado, lo mandamos al login primero
            if (!authToken) {
                setExito(false);
                setMensaje("Debes iniciar sesión con tu cuenta para aceptar la invitación.");
                setTimeout(() => navigate('/login'), 3500);
                return;
            }

            try {
                const response = await axios.post(`https://api.vix-flow.com/api/proyectos/aceptar-invitacion/${token}`, {}, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                setExito(true);
                setMensaje("¡" + response.data + "!");
                setTimeout(() => navigate('/proyectos'), 3000);
            } catch (error) {
                setExito(false);
                setMensaje(error.response?.data?.mensaje || "Error al aceptar la invitación o enlace caducado.");
            }
        };
        aceptar();
    }, [token, navigate]);

    return (
        <div className={`${darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"} min-h-screen flex flex-col transition-colors duration-300`}>
            <Navbar />
            <div className="flex-1 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`p-8 rounded-2xl border text-center max-w-md w-full shadow-xl ${
                        darkMode ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"
                    }`}
                >
                    <div className="text-4xl mb-4">
                        {exito === null ? "⏳" : (exito ? "✅" : "❌")}
                    </div>
                    <h2 className="text-2xl font-bold mb-4 text-cyan-500">Invitación a Proyecto</h2>
                    <p className={darkMode ? "text-gray-300" : "text-gray-600"}>{mensaje}</p>
                    <p className="text-xs text-gray-500 mt-6">Serás redirigido automáticamente...</p>
                </motion.div>
            </div>
        </div>
    );
}

export default AceptarInvitacion;