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

import Terminos from "./pages/Terminos"
import Privacidad from "./pages/Privacidad"
import Cookies from "./pages/Cookies"
import Nosotros from "./pages/Nosotros"

import RutaProtegida from "./components/RutaProtegida"
import Footer from "./components/Footer"
import AvisoLegal from "./components/AvisoLegal"

function App() {
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

            {/* Rutas Legales e Informativas */}
            <Route path="/terminos" element={<Terminos />} />
            <Route path="/privacidad" element={<Privacidad />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/nosotros" element={<Nosotros />} />

            {/* Rutas Protegidas */}
            <Route path="/calendario" element={<RutaProtegida><Calendario /></RutaProtegida>} />
            <Route path="/tablero" element={<RutaProtegida><Tablero /></RutaProtegida>} />
            <Route path="/tablero/:fecha" element={<RutaProtegida><Tablero /></RutaProtegida>} />
            <Route path="/amigos" element={<RutaProtegida><Amigos /></RutaProtegida>} />
            <Route path="/proyectos" element={<RutaProtegida><Proyectos /></RutaProtegida>} />
            <Route path="/proyecto/:id/tablero" element={<RutaProtegida><TableroProyecto /></RutaProtegida>} />
            <Route path="/perfil" element={<RutaProtegida><Perfil /></RutaProtegida>} />
            <Route path="/metricas" element={<RutaProtegida><Metricas /></RutaProtegida>} />
          </Routes>
        </div>

        <Footer />
        
      </div>
    </Router>
  )
}

export default App