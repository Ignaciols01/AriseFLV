import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import Explore from './pages/Explore';
import NotFound from './pages/NotFound';

function App() {
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initSession = async () => {
      try {
        // 1. Obtenemos la sesión local (esto no requiere red, es instantáneo)
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (isMounted) {
          setSession(session);
          
          if (session) {
            // 2. Asignación rápida (optimista) por correo para no bloquear la carga
            const email = session.user.email;
            if (email === 'superadmin@ariseflv.com') setUserRole('superadmin');
            else if (email === 'admin@ariseflv.com') setUserRole('admin');
            else setUserRole('client');

            // 3. Comprobación en la sombra: pregunta a Supabase el rol real sin que la pantalla espere
            supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle()
              .then(({ data }) => {
                if (isMounted && data) setUserRole(data.role);
              })
              .catch(err => console.error("Error al sincronizar rol:", err));
          }
        }
      } catch (error) {
        console.error("Error al cargar la sesión:", error);
      } finally {
        // 4. Quitamos la pantalla de carga INMEDIATAMENTE
        if (isMounted) setLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setSession(session);
      
      if (session) {
        const email = session.user.email;
        if (email === 'superadmin@ariseflv.com') setUserRole('superadmin');
        else if (email === 'admin@ariseflv.com') setUserRole('admin');
        else setUserRole('client');
        
        supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle()
          .then(({ data }) => {
            if (isMounted && data) setUserRole(data.role);
          });
      } else {
        setUserRole(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950 to-[#2a0808] flex flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-red-500 font-black tracking-widest uppercase animate-pulse">Iniciando Sistema...</div>
      </div>
    );
  }

  const isAuthenticated = !!session;
  const currentRole = userRole || 'client'; 
  const isAdminOrSuper = currentRole === 'admin' || currentRole === 'superadmin';

  return (
    <Router>
      <div className="min-h-screen bg-[#0a0a0a] text-white font-sans antialiased">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/explore" element={<Explore />} />

          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to={isAdminOrSuper ? '/admin' : '/dashboard'} replace />} 
          />

          <Route 
            path="/dashboard" 
            element={isAuthenticated ? (isAdminOrSuper ? <Navigate to="/admin" replace /> : <Dashboard />) : <Navigate to="/login" replace />} 
          />

          <Route 
            path="/admin" 
            element={isAuthenticated ? (isAdminOrSuper ? <AdminPanel /> : <Navigate to="/dashboard" replace />) : <Navigate to="/login" replace />} 
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;