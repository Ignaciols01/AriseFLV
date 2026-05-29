import { useState, useEffect } from 'react';
import { X, Save, Loader2, User as UserIcon, Moon, Sun, Key, Settings, Palette, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string;
  userId: string;
};

export default function SettingsModal({ isOpen, onClose, currentUsername, userId }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setUsername(currentUsername || '');
      setPassword('');
      setConfirmPassword('');
      setErrorMsg('');
      setSuccessMsg('');
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    }
  }, [isOpen, currentUsername]);

  if (!isOpen) return null;

  const toggleDarkMode = () => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password && password !== confirmPassword) {
      setErrorMsg('Las contraseñas de seguridad no coinciden.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. Sincronizar alias si ha cambiado
      if (username !== currentUsername) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ username })
          .eq('id', userId);

        if (profileError) throw profileError;

        const { error: authError } = await supabase.auth.updateUser({
          data: { username: username }
        });
        if (authError) throw authError;
      }

      // 2. Sincronizar nueva contraseña si se ha rellenado
      if (password) {
        const { error: passError } = await supabase.auth.updateUser({
          password: password
        });
        if (passError) throw passError;
      }

      setSuccessMsg('Configuración guardada de forma segura.');
      
      setTimeout(() => {
        onClose();
        if (username !== currentUsername) {
          window.location.reload(); 
        }
      }, 1500);

    } catch (error: any) {
      console.error("Error al actualizar ajustes:", error);
      setErrorMsg(error.message || 'No se pudieron guardar los cambios.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 transition-all duration-300 animate-in fade-in">
      <div className="bg-white dark:bg-[#121212] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-md overflow-hidden border border-zinc-200 dark:border-zinc-800/80 transform transition-all animate-in zoom-in-95 duration-200">
        
        {/* CABECERA */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-100 dark:border-zinc-800/60 bg-gradient-to-r from-red-50/50 to-transparent dark:from-red-950/20 dark:to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-600 dark:text-red-500">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-wide">Panel de Ajustes</h2>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest">Personalización y Seguridad</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {errorMsg && (
            <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs font-bold border border-red-200 dark:border-red-900/50 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
              {errorMsg}
            </div>
          )}
          
          {successMsg && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-900/30 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              {successMsg}
            </div>
          )}

          {/* BLOQUE 1: IDENTIFICACIÓN */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
              <UserIcon className="w-4 h-4 text-red-500" />
              <span className="text-xs font-black uppercase tracking-widest">Perfil</span>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/60 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Alias del usuario</label>
                <input 
                  type="text" 
                  required 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-11 px-4 bg-white dark:bg-black/40 border-2 border-zinc-200 dark:border-zinc-800/80 text-zinc-900 dark:text-zinc-100 font-bold focus:border-red-600 dark:focus:border-red-500 focus:outline-none rounded-xl transition-all text-sm"
                  placeholder="Introduce tu alias..."
                />
              </div>
            </div>
          </div>

          {/* BLOQUE 2: PREFERENCIAS VISUALES */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
              <Palette className="w-4 h-4 text-red-500" />
              <span className="text-xs font-black uppercase tracking-widest">Apariencia</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/60 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-black/40 rounded-lg border border-zinc-200 dark:border-zinc-800/60">
                  {isDarkMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                </div>
                <div>
                  <p className="font-bold text-sm text-zinc-900 dark:text-white">Modo Oscuro</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Cambiar paleta de colores</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={toggleDarkMode}
                className={`w-11 h-6 rounded-full relative transition-all duration-300 border ${isDarkMode ? 'bg-red-600 border-red-700 shadow-md shadow-red-600/20' : 'bg-zinc-200 border-zinc-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-300 ${isDarkMode ? 'right-0.5' : 'left-0.5'}`}></div>
              </button>
            </div>
          </div>
          
          {/* BLOQUE 3: SEGURIDAD DE LA CUENTA */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
              <ShieldCheck className="w-4 h-4 text-red-500" />
              <span className="text-xs font-black uppercase tracking-widest">Credenciales</span>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/60 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Key className="w-3 h-3 text-zinc-400" /> Nueva clave de acceso
                </label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-4 bg-white dark:bg-black/40 border-2 border-zinc-200 dark:border-zinc-800/80 text-zinc-900 dark:text-zinc-100 font-bold focus:border-red-600 dark:focus:border-red-500 focus:outline-none rounded-xl transition-all text-sm"
                  placeholder="Mantenla en blanco si no deseas cambiarla"
                />
              </div>
              
              {password && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                  <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Confirmar nueva clave</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-11 px-4 bg-white dark:bg-black/40 border-2 border-zinc-200 dark:border-zinc-800/80 text-zinc-900 dark:text-zinc-100 font-bold focus:border-red-600 dark:focus:border-red-500 focus:outline-none rounded-xl transition-all text-sm"
                    placeholder="Escribe de nuevo la contraseña"
                  />
                </div>
              )}
            </div>
          </div>

          {/* BOTÓN DE ACCIÓN */}
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isLoading || (!password && username === currentUsername)}
              className="w-full h-12 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:bg-zinc-400 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg hover:shadow-red-600/20 active:scale-[0.99] hover:-translate-y-0.5 disabled:translate-y-0 transition-all flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <><Save className="w-4 h-4" /> Aplicar Configuración</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}