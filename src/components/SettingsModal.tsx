import { useState, useEffect } from 'react';
import { X, Save, Loader2, User as UserIcon } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string;
  userId: string;
};

export default function SettingsModal({ isOpen, onClose, currentUsername, userId }: Props) {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setUsername(currentUsername || '');
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, currentUsername]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. Actualizar la tabla pública de perfiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', userId);

      if (profileError) throw profileError;

      // 2. Actualizar los metadatos de sesión por seguridad
      const { error: authError } = await supabase.auth.updateUser({
        data: { username: username }
      });
      
      if (authError) throw authError;

      setSuccessMsg('Alias actualizado correctamente. Los cambios ya son visibles.');
      
      // Cerrar el modal automáticamente después de 2 segundos
      setTimeout(() => {
        onClose();
        window.location.reload(); // Recarga rápida para que el Navbar muestre el nuevo nombre
      }, 2000);

    } catch (error: any) {
      console.error("Error al actualizar alias:", error);
      setErrorMsg(error.message || 'Error al actualizar el alias. Verifica tu conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-zinc-200 dark:border-zinc-800 transform transition-all animate-in zoom-in-95 duration-300">
        
        <div className="flex justify-between items-center p-6 border-b border-zinc-100 dark:border-zinc-800 bg-red-50 dark:bg-red-950/30 transition-colors">
          <h2 className="text-lg font-black text-red-950 dark:text-red-100 uppercase flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-red-600" /> Ajustes de Cuenta
          </h2>
          <button onClick={onClose} className="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors p-1 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-4">
          
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
          
          <div>
            <label className="block text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 transition-colors">Tu Alias (Nombre visible)</label>
            <input 
              type="text" 
              required 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-black/20 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold focus:border-red-600 dark:focus:border-red-500 rounded-xl outline-none transition-colors"
              placeholder="Ej: OtakuMaster99"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading || !username.trim() || username === currentUsername}
            className="w-full py-4 mt-2 text-sm font-black text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:bg-zinc-400 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-xl uppercase tracking-widest shadow-lg transition-all hover:-translate-y-0.5 flex justify-center items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Guardar Cambios</>}
          </button>
        </form>
      </div>
    </div>
  );
}