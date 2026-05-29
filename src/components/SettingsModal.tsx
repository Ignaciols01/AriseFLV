import { useState, useEffect } from 'react';
import { X, Save, Loader2, User as UserIcon, Moon, Sun, Key, Settings } from 'lucide-react';
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

  // Sincronizar el estado inicial cuando se abre el modal
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

  // Lógica para alternar el modo oscuro/claro
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
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. Actualizar Alias solo si el usuario lo ha modificado
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

      // 2. Actualizar Contraseña solo si ha escrito una nueva
      if (password) {
        const { error: passError } = await supabase.auth.updateUser({
          password: password
        });
        if (passError) throw passError;
      }

      setSuccessMsg('Ajustes actualizados correctamente.');
      
      // Cerrar y recargar si hubo cambio de nombre para que se vea reflejado
      setTimeout(() => {
        onClose();
        if (username !== currentUsername) {
          window.location.reload(); 
        }
      }, 2000);

    } catch (error: any) {
      console.error("Error al actualizar ajustes:", error);
      setErrorMsg(error.message || 'Error al guardar los cambios. Verifica tu conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-zinc-200 dark:border-zinc-800 transform transition-all animate-in zoom-in-95 duration-300">
        
        <div className="flex justify-between items-center p-6 border-b border-zinc-100 dark:border-zinc-800 bg-red-50 dark:bg-red-950/30 transition-colors">
          <h2 className="text-lg font-black text-red-950 dark:text-red-100 uppercase flex items-center gap-2">
            <Settings className="w-5 h-5 text-red-600" /> Ajustes
          </h2>
          <button onClick={onClose} className="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors p-1 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-5">
          
          {errorMsg && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-xs font-bold border border-red-200 dark:border-red-800 transition-colors">
              {errorMsg}
            </div>
          )}
          
          {successMsg && (
            <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 p-3 rounded-lg text-xs font-bold border border-emerald-200 dark:border-emerald-800 transition-colors">
              {successMsg}
            </div>
          )}

          {/* TEMA OSCURO */}
          <div className="flex justify-between items-center p-4 bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-colors">
            <div className="flex items-center gap-3">
              {isDarkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
              <div>
                <p className="font-bold text-sm text-zinc-900 dark:text-white">Modo Oscuro</p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Apariencia visual</p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={toggleDarkMode}
              className={`w-12 h-6 rounded-full relative transition-all duration-300 ${isDarkMode ? 'bg-red-600 shadow-md shadow-red-600/30' : 'bg-zinc-300'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 ${isDarkMode ? 'right-1' : 'left-1'}`}></div>
            </button>
          </div>
          
          {/* ALIAS */}
          <div>
            <label className="flex items-center gap-2 text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 transition-colors">
              <UserIcon className="w-4 h-4" /> Tu Alias
            </label>
            <input 
              type="text" 
              required 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-black/20 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold focus:border-red-600 dark:focus:border-red-500 rounded-xl outline-none transition-colors"
              placeholder="Ej: OtakuMaster99"
            />
          </div>

          {/* CONTRASEÑA */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <label className="flex items-center gap-2 text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 transition-colors">
              <Key className="w-4 h-4" /> Nueva Contraseña
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 mb-3 bg-zinc-50 dark:bg-black/20 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold focus:border-red-600 dark:focus:border-red-500 rounded-xl outline-none transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
              placeholder="Dejar en blanco para no cambiarla"
            />
            {password && (
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-black/20 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold focus:border-red-600 dark:focus:border-red-500 rounded-xl outline-none transition-colors animate-in fade-in slide-in-from-top-2"
                placeholder="Repite la nueva contraseña"
              />
            )}
          </div>

          <button 
            type="submit" 
            disabled={isLoading || (!password && username === currentUsername)}
            className="w-full py-4 mt-2 text-sm font-black text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:bg-zinc-400 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-xl uppercase tracking-widest shadow-lg transition-all hover:-translate-y-0.5 flex justify-center items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Guardar Cambios</>}
          </button>
        </form>
      </div>
    </div>
  );
}