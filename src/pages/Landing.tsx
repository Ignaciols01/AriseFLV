import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { LayoutGrid, Shield, Zap, ChevronRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans">
      <Navbar />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="max-w-3xl">
          <h1 className="text-6xl sm:text-7xl font-black text-white tracking-tighter leading-[1.1] mb-6 uppercase">
            Tu lista.<br />
            Tu control.<br />
            <span className="text-red-600">Sin límites.</span>
          </h1>
          <p className="text-lg text-zinc-400 font-medium mb-10 max-w-xl leading-relaxed">
            La forma más sencilla de organizar tu colección de anime. Guarda lo que has visto, puntúa tus favoritos y gestiona tu catálogo personal con un diseño profesional.
          </p>
          <Link 
            to="/login" 
            className="inline-block px-8 py-4 bg-red-600 text-white font-black uppercase tracking-widest hover:bg-red-700 transition-colors rounded-sm"
          >
            Empezar ahora
          </Link>
        </div>
      </main>

      {/* Funciones Principales Section (Basado en tu captura) */}
      <section className="bg-[#0f0f0f] py-24 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-4">
              <div className="w-1.5 h-8 bg-red-600"></div>
              Funciones Principales
            </h2>
            <Link to="/explore" className="text-red-600 font-bold uppercase tracking-widest text-sm hover:text-red-500 transition-colors flex items-center gap-1 group">
              Ver todo <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Tarjeta 1 */}
            <div className="flex flex-col">
              <div className="aspect-video bg-[#1a1a1a] rounded-sm flex items-center justify-center mb-6 border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                <LayoutGrid className="w-16 h-16 text-zinc-700 stroke-1" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Gestión de Catálogo</h3>
              <p className="text-sm text-zinc-500 leading-relaxed font-medium">Organiza tus series por géneros, temporadas o estado de visualización.</p>
            </div>

            {/* Tarjeta 2 */}
            <div className="flex flex-col">
              <div className="aspect-video bg-[#1a1a1a] rounded-sm flex items-center justify-center mb-6 border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                <Shield className="w-16 h-16 text-zinc-700 stroke-1" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Bóveda Privada</h3>
              <p className="text-sm text-zinc-500 leading-relaxed font-medium">Tu cuenta es personal. Cada usuario gestiona su propia base de datos segura.</p>
            </div>

            {/* Tarjeta 3 */}
            <div className="flex flex-col">
              <div className="aspect-video bg-[#1a1a1a] rounded-sm flex items-center justify-center mb-6 border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                <Zap className="w-16 h-16 text-zinc-700 stroke-1" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Experiencia SPA</h3>
              <p className="text-sm text-zinc-500 leading-relaxed font-medium">Navegación instantánea y fluida. Sin esperas, sin recargas de página.</p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}