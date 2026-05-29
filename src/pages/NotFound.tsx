import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0505] to-[#0a0a0a] flex flex-col items-center justify-center p-4 selection:bg-red-600 selection:text-white">
      <div className="text-center space-y-6 max-w-md animate-in fade-in zoom-in-95 duration-300">
        
        {/* Icono de Advertencia Estilizado */}
        <div className="mx-auto w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
          <ShieldAlert className="w-12 h-12 text-red-500 animate-pulse" />
        </div>

        {/* Textos de Error */}
        <div className="space-y-2">
          <h1 className="text-7xl font-black text-white tracking-tighter">404</h1>
          <h2 className="text-xl font-black text-red-500 uppercase tracking-widest">Dimensión Desconocida</h2>
          <p className="text-sm font-medium text-zinc-400 max-w-xs mx-auto">
            La página que buscas no existe o ha sido movida a otra bóveda del sistema.
          </p>
        </div>

        {/* Botones de Retorno Seguro */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Link 
            to="/" 
            className="h-12 px-6 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-red-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Volver al Inicio
          </Link>
          <button 
            onClick={() => window.history.back()} 
            className="h-12 px-6 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-black text-xs uppercase tracking-widest rounded-xl border border-zinc-800/80 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Regresar
          </button>
        </div>
      </div>
    </div>
  );
}