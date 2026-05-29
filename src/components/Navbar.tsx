import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { LogOut, LayoutDashboard, Globe, Shield, Menu, X, Sparkles, User } from 'lucide-react';
import SettingsModal from './SettingsModal';

export default function Navbar() {
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<string>('client');
  const [username, setUsername] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && isMounted) {
          setSession(session);
          
          const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
          if (data && isMounted) {
            setRole(data.role || 'client');
            setUsername(data.username || session.user.email?.split('@')[0] || 'Usuario');
          }
        }
      } catch (err) {
        console.error("Error al sincronizar datos de navegación:", err);
      }
    };

    getUser();
    
    return () => { isMounted = false };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const isAdmin = role === 'admin' || role === 'superadmin';

  return (
    <>
      <nav className="bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md sticky top-0 z-40 border-b border-red-100 dark:border-red-900/30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-red-600 p-1.5 rounded-lg group-hover:scale-110 transition-transform shadow-lg shadow-red-600/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-xl text-red-950 dark:text-white tracking-widest uppercase">Arise<span className="text-red-600">FLV</span></span>
            </Link>

            {/* Menú de Escritorio */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/explore" className={`text-sm font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors ${location.pathname === '/explore' ? 'text-red-600 dark:text-red-500' : 'text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400'}`}>
                <Globe className="w-4 h-4" /> Explorar
              </Link>
              
              {/* Ajustado: La Bóveda ahora solo es visible si no es administrador */}
              {session && !isAdmin && (
                <Link to="/dashboard" className={`text-sm font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors ${location.pathname === '/dashboard' ? 'text-red-600 dark:text-red-500' : 'text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400'}`}>
                  <LayoutDashboard className="w-4 h-4" /> Bóveda
                </Link>
              )}

              {session && isAdmin && (
                <Link to="/admin" className={`text-sm font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors ${location.pathname === '/admin' ? 'text-red-600 dark:text-red-500' : 'text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400'}`}>
                  <Shield className="w-4 h-4" /> Admin
                </Link>
              )}
            </div>

            {/* Acciones de Usuario */}
            <div className="hidden md:flex items-center gap-4">
              {session ? (
                <>
                  <button onClick={() => setIsSettingsOpen(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-zinc-800/60 transition-colors border border-transparent hover:border-red-100 dark:hover:border-zinc-700">
                    <div className="w-7 h-7 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center font-black text-xs border border-red-200 dark:border-red-800">
                      {username ? username.charAt(0).toUpperCase() : <User className="w-3 h-3" />}
                    </div>
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{username}</span>
                  </button>
                  <button onClick={handleLogout} className="p-2 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <Link to="/login" className="px-5 py-2 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-red-700 shadow-md transition-all hover:-translate-y-0.5">
                  Acceder
                </Link>
              )}
            </div>

            {/* Menú Móvil */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-zinc-500 hover:text-red-600 dark:text-zinc-400 p-2">
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Desplegable Móvil */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-[#0a0a0a] border-b border-red-100 dark:border-red-900/30 px-4 pt-2 pb-6 shadow-xl animate-in slide-in-from-top-2">
            <div className="flex flex-col gap-4 mt-4">
              <Link to="/explore" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                <Globe className="w-4 h-4" /> Explorar
              </Link>
              
              {/* Ajustado en el menú desplegable móvil */}
              {session && !isAdmin && (
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                  <LayoutDashboard className="w-4 h-4" /> Bóveda
                </Link>
              )}
              
              {session && isAdmin && (
                <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                  <Shield className="w-4 h-4" /> Panel Admin
                </Link>
              )}
              {session ? (
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                  <button onClick={() => { setIsSettingsOpen(true); setIsMobileMenuOpen(false); }} className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                    <User className="w-4 h-4" /> Ajustes
                  </button>
                  <button onClick={handleLogout} className="text-sm font-black uppercase tracking-widest text-red-600 flex items-center gap-2">
                    Salir <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="w-full text-center py-3 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-lg shadow-md">
                  Acceder al Sistema
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {session && (
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
          currentUsername={username} 
          userId={session.user.id} 
        />
      )}
    </>
  );
}