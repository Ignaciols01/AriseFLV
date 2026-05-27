import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Play, LogOut, Shield, User, Settings as SettingsIcon } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import SettingsModal from './SettingsModal';

export default function Navbar() {
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  
  // Mi nuevo estado para los datos del usuario y el modal de ajustes
  const [userData, setUserData] = useState({ id: '', username: '' });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserData(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserData(session.user.id);
      } else {
        setRole(null);
        setUserData({ id: '', username: '' });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Mi función para traerme el rol y el nombre de usuario
  const fetchUserData = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('role, username').eq('id', userId).single();
    if (data) {
      setRole(data.role);
      setUserData({ id: userId, username: data.username });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <>
      <nav className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white dark:bg-black border-b-2 border-red-100 dark:border-red-950 sticky top-0 z-40 transition-colors duration-300">
        
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 text-2xl font-black tracking-tighter text-red-950 dark:text-white hover:opacity-90 transition-opacity">
            <Play className="w-6 h-6 text-red-600 fill-current" />
            <span>ARISE<span className="text-red-600">FLV</span></span>
          </Link>

          {(role === 'admin' || role === 'superadmin') && (
            <span className="hidden sm:flex items-center gap-1 bg-red-600 text-white text-[10px] px-2.5 py-1 rounded-md font-black tracking-widest uppercase ml-2 shadow-sm animate-in fade-in zoom-in duration-300">
              <Shield className="w-3 h-3" /> {role === 'superadmin' ? 'SuperAdmin' : 'Admin'}
            </span>
          )}
          {role === 'client' && (
            <span className="hidden sm:flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] px-2.5 py-1 rounded-md font-black tracking-widest uppercase ml-2 animate-in fade-in zoom-in duration-300 transition-colors">
              <User className="w-3 h-3" /> Cliente
            </span>
          )}
        </div>
        
        <div className="flex gap-4 sm:gap-6 items-center">
          {!session ? (
            <>
              <Link to="/explore" className="hidden md:block text-sm font-bold text-red-800/60 dark:text-red-100/50 hover:text-red-600 dark:hover:text-white transition-colors uppercase tracking-widest">
                Explorar
              </Link>
              <Link to="/login" className="px-5 sm:px-6 py-2 text-xs sm:text-sm font-black text-white bg-red-600 hover:bg-red-700 transition-all uppercase tracking-wider rounded-lg shadow-md">
                Acceder
              </Link>
            </>
          ) : (
            <>
              {(role === 'admin' || role === 'superadmin') && location.pathname !== '/admin' && (
                <Link to="/admin" className="hidden md:block text-xs font-bold text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors uppercase tracking-widest">
                  Panel Admin
                </Link>
              )}
              {role === 'client' && location.pathname !== '/dashboard' && (
                <Link to="/dashboard" className="hidden md:block text-xs font-bold text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors uppercase tracking-widest">
                  Mi Catálogo
                </Link>
              )}
              
              <Link to="/explore" className="hidden md:block text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors uppercase tracking-widest border-l border-zinc-300 dark:border-zinc-800 pl-6 ml-2">
                Explorar
              </Link>

              {/* MI NUEVO BOTÓN DE CONFIGURACIÓN */}
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg ml-2 hover:bg-red-50 dark:hover:bg-red-950/30"
                title="Configuración de Cuenta"
              >
                <SettingsIcon className="w-5 h-5" />
              </button>

              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-black text-red-600 dark:text-red-400 border border-red-200 dark:border-red-950 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950 hover:text-red-700 dark:hover:text-red-300 transition-all uppercase tracking-wider rounded-lg ml-1"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Aquí inyecto mi modal de configuración de forma invisible hasta que se llame */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        currentUsername={userData.username} 
        userId={userData.id} 
      />
    </>
  );
}