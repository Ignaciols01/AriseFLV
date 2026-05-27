import { useState, useEffect } from 'react';
import { X, Moon, Sun, Save, Lock, User as UserIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string;
  userId: string;
};

export default function SettingsModal({ isOpen, onClose, currentUsername, userId }: Props) {
  // Mis estados para la configuración
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Cuando abro el modal, cargo mis datos actuales y detecto si estoy en modo oscuro
  useEffect(() => {
    if (isOpen) {
      setUsername(currentUsername || '');
      setIsDarkMode(document.documentElement.classList.contains('dark'));
      setSuccessMsg('');
      setPassword('');
    }
  }, [isOpen, currentUsername]);

  // Mi función para alternar entre el lado luminoso y oscuro de la fuerza
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Mi función para guardar los cambios en Supabase
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg('');

    try {
      // Actualizo mi alias si lo he modificado
      if (username !== currentUsername) {
        await supabase.from('profiles').update({ username }).eq('id', userId);
      }
      
      // Actualizo mi contraseña solo si he escrito algo en la caja
      if (password.trim() !== '') {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
      }
      
      setSuccessMsg('¡Ajustes guardados con éxito!');
      // Cierro el modal automáticamente tras 2 segundos para dar buena experiencia
      setTimeout(() => {
        onClose();
        // Recargo la página suavemente para que el Navbar actualice el nombre si cambió
        if (username !== currentUsername) window.location.reload();
      }, 2000);
    } catch (error: any) {
      alert("Error al guardar: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-2 duration-300 border border-red-100 dark:border-zinc-800">
        
        <div className="flex justify-between items-center p-6 border-b border-zinc-100 dark:border-zinc-800 bg-red-50 dark:bg-red-950/30 transition-colors">
          <h2 className="text-lg font-black text-red-950 dark:text-red-100 uppercase tracking-widest">Configuración</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors" /></button>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-6">
          
          {/* MI INTERRUPTOR DE TEMA (MODO OSCURO/CLARO) */}
          <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 transition-colors">
            <div className="flex items-center gap-3">
              {isDarkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
              <div>
                <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase">Apariencia</p>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{isDarkMode ? 'Modo Oscuro activado' : 'Modo Claro activado'}</p>
              </div>
            </div>
            <button type="button" onClick={toggleTheme} className={`w-14 h-7 rounded-full relative transition-colors duration-300 ${isDarkMode ? 'bg-indigo-500' : 'bg-red-200'}`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform duration-300 ${isDarkMode ? 'translate-x-8' : 'translate-x-1'}`}></div>
            </button>
          </div>

          {/* CAMBIAR ALIAS */}
          <div>
            <label className="flex items-center gap-2 text-xs font-black text-zinc-800 dark:text-zinc-300 uppercase tracking-widest mb-2">
              <UserIcon className="w-4 h-4" /> Alias de Usuario
            </label>
            <input 
              type="text" 
              required
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold focus:border-red-500 dark:focus:border-red-500 rounded-xl outline-none transition-colors shadow-sm" 
            />
          </div>

          {/* CAMBIAR CONTRASEÑA */}
          <div>
             <label className="flex items-center gap-2 text-xs font-black text-zinc-800 dark:text-zinc-300 uppercase tracking-widest mb-2">
              <Lock className="w-4 h-4" /> Nueva Contraseña
            </label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Déjalo en blanco si no quieres cambiarla" 
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold focus:border-red-500 dark:focus:border-red-500 rounded-xl outline-none transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-sm" 
            />
          </div>

          {successMsg && (
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/50 animate-in fade-in zoom-in">
              <CheckCircle2 className="w-5 h-5" /> {successMsg}
            </div>
          )}

          <button type="submit" disabled={isLoading} className="w-full py-4 text-sm font-black text-white bg-red-600 hover:bg-red-700 rounded-xl uppercase tracking-widest shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Guardar Cambios</>}
          </button>
        </form>
      </div>
    </div>
  );
}