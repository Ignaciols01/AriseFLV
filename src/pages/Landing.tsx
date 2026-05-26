import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { ChevronRight, LayoutGrid, Shield, Zap } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600">
      <Navbar />

      <main className="relative max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="max-w-3xl">
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.85] tracking-tighter">
            TU LISTA.<br />
            TU CONTROL.<br />
            <span className="text-red-600">SIN LÍMITES.</span>
          </h1>
          <p className="text-xl text-zinc-400 mb-12 max-w-lg font-medium leading-relaxed">
            La forma más sencilla de organizar tu colección de anime. Guarda lo que has visto, puntúa tus favoritos y gestiona tu catálogo personal con un diseño profesional.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/login" 
              className="px-10 py-4 bg-red-600 text-white font-black text-lg uppercase tracking-widest hover:bg-red-700 transition-colors rounded-sm text-center"
            >
              Empezar ahora
            </Link>
          </div>
        </div>

        <div className="mt-40">
          <div className="flex items-center justify-between mb-8 border-l-4 border-red-600 pl-4">
            <h2 className="text-3xl font-black uppercase tracking-tight">Funciones principales</h2>
            <button className="text-zinc-500 hover:text-red-600 font-bold flex items-center gap-1 transition-colors uppercase text-sm tracking-widest">
              Ver todo <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group cursor-pointer">
              <div className="aspect-video bg-zinc-900 mb-4 flex items-center justify-center border border-zinc-800 group-hover:border-red-600 transition-all relative overflow-hidden">
                <LayoutGrid className="w-12 h-12 text-zinc-700 group-hover:text-red-600 transition-colors" />
                <div className="absolute bottom-0 left-0 w-full h-1 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </div>
              <h3 className="text-xl font-bold mb-1">Gestión de Catálogo</h3>
              <p className="text-zinc-500 text-sm">Organiza tus series por géneros, temporadas o estado de visualización.</p>
            </div>

            <div className="group cursor-pointer">
              <div className="aspect-video bg-zinc-900 mb-4 flex items-center justify-center border border-zinc-800 group-hover:border-red-600 transition-all relative overflow-hidden">
                <Shield className="w-12 h-12 text-zinc-700 group-hover:text-red-600 transition-colors" />
                <div className="absolute bottom-0 left-0 w-full h-1 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </div>
              <h3 className="text-xl font-bold mb-1">Bóveda Privada</h3>
              <p className="text-zinc-500 text-sm">Tu cuenta es personal. Cada usuario gestiona su propia base de datos segura.</p>
            </div>

            <div className="group cursor-pointer">
              <div className="aspect-video bg-zinc-900 mb-4 flex items-center justify-center border border-zinc-800 group-hover:border-red-600 transition-all relative overflow-hidden">
                <Zap className="w-12 h-12 text-zinc-700 group-hover:text-red-600 transition-colors" />
                <div className="absolute bottom-0 left-0 w-full h-1 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </div>
              <h3 className="text-xl font-bold mb-1">Experiencia SPA</h3>
              <p className="text-zinc-500 text-sm">Navegación instantánea y fluida. Sin esperas, sin recargas de página.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}