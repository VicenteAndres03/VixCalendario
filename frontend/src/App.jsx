import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Registro from "./pages/Registro"
import Calendario from "./pages/Calendario"
import Tablero from "./pages/Tablero"
import Perfil from "./pages/Perfil"
import Amigos from "./pages/Amigos"
import Proyectos from "./pages/Proyectos"
import TableroProyecto from "./pages/TableroProyecto"
import AceptarInvitacion from "./pages/AceptarInvitacion"
import Metricas from "./pages/Metricas"
import DashboardAdmin from "./pages/DashboardAdmin"
import Dashboard from "./pages/Dashboard"
import Plan from "./pages/Plan" 
import Habitos from "./pages/Habitos" 
import TableroPublico from "./pages/TableroPublico"
import Soporte from "./pages/Soporte"
import Cuadernos from "./pages/Cuadernos"
import CuadernoDetalle from "./pages/CuadernoDetalle"

import Terminos from "./pages/Terminos"
import Privacidad from "./pages/Privacidad"
import Cookies from "./pages/Cookies"
import Nosotros from "./pages/Nosotros"

import RutaProtegida from "./components/RutaProtegida"
import RutaPremium from "./components/RutaPremium"
import Footer from "./components/Footer"
import AvisoLegal from "./components/AvisoLegal"

import { useSyncSuscripcion } from "./hooks/useSyncSuscripcion"

function App() {
  useSyncSuscripcion()
  return (
    <Router>
      <AvisoLegal />

      <div className="flex flex-col min-h-screen">
        
        <div className="flex-grow">
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/aceptar-invitacion/:token" element={<AceptarInvitacion />} />
            <Route path="/shared/proyecto/:tokenPublico" element={<TableroPublico />} />
            <Route path="/soporte" element={<Soporte />} />

            {/* Rutas Legales e Informativas */}
            <Route path="/terminos" element={<Terminos />} />
            <Route path="/privacidad" element={<Privacidad />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/nosotros" element={<Nosotros />} />

            {/* 🔥 RUTAS BÁSICAS GRATUITAS 🔥 */}
            <Route path="/dashboard" element={<RutaProtegida><Dashboard /></RutaProtegida>} />
            <Route path="/calendario" element={<RutaProtegida><Calendario /></RutaProtegida>} />
            <Route path="/tablero" element={<RutaProtegida><Tablero /></RutaProtegida>} />
            <Route path="/tablero/:fecha" element={<RutaProtegida><Tablero /></RutaProtegida>} />
            <Route path="/amigos" element={<RutaProtegida><Amigos /></RutaProtegida>} />
            <Route path="/proyectos" element={<RutaProtegida><Proyectos /></RutaProtegida>} />
            <Route path="/proyecto/:id/tablero" element={<RutaProtegida><TableroProyecto /></RutaProtegida>} />
            <Route path="/perfil" element={<RutaProtegida><Perfil /></RutaProtegida>} />
            <Route path="/plan" element={<RutaProtegida><Plan /></RutaProtegida>} />
            <Route path="/cuadernos" element={<RutaProtegida><Cuadernos /></RutaProtegida>} />
            <Route path="/cuadernos/:id" element={<RutaProtegida><CuadernoDetalle /></RutaProtegida>} />

            {/* 💎 RUTAS EXCLUSIVAS PREMIUM 💎 */}
            <Route path="/habitos" element={
              <RutaProtegida>
                <RutaPremium>
                  <Habitos />
                </RutaPremium>
              </RutaProtegida>
            } />

            <Route path="/metricas" element={
              <RutaProtegida>
                <RutaPremium>
                  <Metricas />
                </RutaPremium>
              </RutaProtegida>
            } />
            
            {/* 👑 Panel de Administración */}
            <Route path="/admin" element={<RutaProtegida><DashboardAdmin /></RutaProtegida>} />
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  )
}

export default App