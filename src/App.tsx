import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Obtener la sesión actual al cargar la app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Escuchar cambios (cuando inician o cierran sesión)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Pantalla de carga mientras Supabase comprueba el usuario
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950 to-[#2a0808] flex items-center justify-center">
        <div className="text-red-500 font-black tracking-widest uppercase animate-pulse">Iniciando Sistema...</div>
      </div>
    );
  }

  // Variables reales de autenticación
  const isAuthenticated = !!session;
  
  // Lógica de roles: Si el email coincide, es Admin. Si no, es Cliente.
  const userRole = session?.user?.email === 'admin@ariseflv.com' ? 'admin' : 'client';

  return (
    <Router>
      <div className="min-h-screen bg-[#0a0a0a] text-white font-sans antialiased">
        <Routes>
          <Route path="/" element={<Landing />} />
          
          {/* Si ya está logueado, lo mandamos a su panel correspondiente en lugar de ver el login */}
          <Route 
            path="/login" 
            element={
              !isAuthenticated 
                ? <Login /> 
                : <Navigate to={userRole === 'admin' ? '/admin' : '/dashboard'} />
            } 
          />

          <Route 
            path="/dashboard" 
            element={
              isAuthenticated && userRole === 'client' 
                ? <Dashboard /> 
                : <Navigate to="/login" />
            } 
          />

          <Route 
            path="/admin" 
            element={
              isAuthenticated && userRole === 'admin' 
                ? <AdminPanel /> 
                : <Navigate to="/dashboard" /> /* Si un cliente intenta entrar al admin, lo devuelve a su dashboard */
            } 
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;