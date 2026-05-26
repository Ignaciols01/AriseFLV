import { Link } from 'react-router-dom';
import { Home, Search, AlertTriangle } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 to-[#2a0808] font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center relative z-10">
        <AlertTriangle className="w-24 h-24 text-red-500 mb-6 drop-shadow-lg" />
        
        <h1 className="text-7xl font-black text-white mb-4 tracking-tighter">ERROR 404</h1>
        
        <p className="text-lg text-red-200/80 font-medium mb-10 max-w-md">
          Parece que te has perdido en la bóveda. La página que buscas no existe o ha sido movida a otro directorio.
        </p>

        <div className="relative w-full max-w-md mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-red-400" />
          <input 
            type="text" 
            placeholder="Buscar en el catálogo..." 
            className="w-full h-14 bg-red-50 rounded-xl border-2 border-red-200 px-12 text-red-950 font-bold focus:outline-none focus:border-red-500 shadow-lg"
          />
        </div>

        <Link 
          to="/" 
          className="px-8 py-4 bg-red-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-red-700 transition-all shadow-xl hover:-translate-y-1 flex items-center gap-3"
        >
          <Home className="w-5 h-5" />
          Volver al Inicio
        </Link>
      </main>
    </div>
  );
}