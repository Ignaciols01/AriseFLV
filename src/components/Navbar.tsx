import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Play, LogOut, Shield, User } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Navbar() {
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. Obtenemos sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchRole(session.user.id);
    });

    // 2. Escuchamos cambios (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchRole(session.user.id);
      } else {
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Función para obtener el rol real desde la base de datos
  const fetchRole = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
    if (data) setRole(data.role);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="flex items-center justify-between px-4 sm:px-6 py-4 bg-black border-b-2 border-red-950 sticky top-0 z-50">
      
      {/* SECCIÓN IZQUIERDA: Logo y Etiqueta de Rol */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 text-2xl font-black tracking-tighter text-white hover:opacity-90 transition-opacity">
          <Play className="w-6 h-6 text-red-600 fill-current" />
          <span>ARISE<span className="text-red-600">FLV</span></span>
        </Link>

        {/* Indicadores visuales de rol */}
        {role === 'admin' && (
          <span className="hidden sm:flex items-center gap-1 bg-red-600 text-white text-[10px] px-2.5 py-1 rounded-md font-black tracking-widest uppercase ml-2 shadow-sm animate-in fade-in zoom-in duration-300">
            <Shield className="w-3 h-3" /> Admin
          </span>
        )}
        {role === 'client' && (
          <span className="hidden sm:flex items-center gap-1 bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] px-2.5 py-1 rounded-md font-black tracking-widest uppercase ml-2 animate-in fade-in zoom-in duration-300">
            <User className="w-3 h-3" /> Cliente
          </span>
        )}
      </div>
      
      {/* SECCIÓN DERECHA: Navegación y Acciones */}
      <div className="flex gap-4 sm:gap-6 items-center">
        {!session ? (
          <>
            <Link to="/explore" className="hidden md:block text-sm font-bold text-red-100/50 hover:text-white transition-colors uppercase tracking-widest">
              Explorar
            </Link>
            <Link 
              to="/login" 
              className="px-5 sm:px-6 py-2 text-xs sm:text-sm font-black text-white bg-red-600 hover:bg-red-700 transition-all uppercase tracking-wider rounded-lg shadow-md"
            >
              Acceder
            </Link>
          </>
        ) : (
          <>
            {/* Enlaces rápidos inteligentes (No se muestran si ya estás en esa página) */}
            {role === 'admin' && location.pathname !== '/admin' && (
              <Link to="/admin" className="hidden md:block text-xs font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest">
                Panel Admin
              </Link>
            )}
            {role === 'client' && location.pathname !== '/dashboard' && (
              <Link to="/dashboard" className="hidden md:block text-xs font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest">
                Mi Catálogo
              </Link>
            )}
            
            <Link to="/explore" className="hidden md:block text-xs font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest border-l border-zinc-800 pl-6 ml-2">
              Explorar
            </Link>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-black text-red-400 border border-red-950 bg-red-950/30 hover:bg-red-950 hover:text-red-300 transition-all uppercase tracking-wider rounded-lg ml-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
}