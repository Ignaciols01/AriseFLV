import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { LayoutGrid, Shield, Zap, ChevronRight, Play } from 'lucide-react';

export default function Landing() {
  return (
    // Mi fondo adaptativo para modo claro y oscuro con una transición suave
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] font-sans transition-colors duration-500 overflow-hidden relative">
      
      {/* Un toque "shadcn": un resplandor de fondo sutil (glow) para darle profundidad */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-red-600/20 dark:bg-red-900/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-600/10 dark:bg-red-800/10 blur-[120px] rounded-full pointer-events-none"></div>

      <Navbar />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 relative z-10">
        <div className="max-w-4xl">
          {/* Mi animación de entrada estilo shadcn (deslizamiento desde abajo y fundido) */}
          <h1 className="text-6xl sm:text-8xl font-black text-zinc-900 dark:text-white tracking-tighter leading-[1.05] mb-8 uppercase animate-in fade-in slide-in-from-bottom-8 duration-700">
            Tu lista.<br />
            Tu control.<br />
            {/* Texto con gradiente para un toque más premium */}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">
              Sin límites.
            </span>
          </h1>
          
          {/* Hago que el párrafo tarde un poquito más en entrar para dar efecto cascada */}
          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 font-medium mb-12 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
            La forma más sencilla de organizar tu colección de anime. Guarda lo que has visto, puntúa tus favoritos y gestiona tu catálogo personal con un diseño a la altura de tus series.
          </p>
          
          {/* Botones rediseñados con sombras luminosas al pasar el ratón */}
          <div className="flex flex-wrap gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <Link 
              to="/login" 
              className="flex items-center gap-2 px-8 py-4 bg-red-600 text-white font-black uppercase tracking-widest hover:bg-red-700 hover:scale-105 hover:shadow-[0_0_30px_-5px_rgba(220,38,38,0.5)] transition-all duration-300 rounded-xl"
            >
              <Play className="w-5 h-5 fill-current" /> Empezar ahora
            </Link>
            <Link 
              to="/explore" 
              className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border-2 border-zinc-200 dark:border-zinc-800 font-black uppercase tracking-widest hover:border-red-500 dark:hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 hover:scale-105 transition-all duration-300 rounded-xl shadow-sm"
            >
              Explorar Catálogo
            </Link>
          </div>
        </div>
      </main>

      {/* Funciones Principales Section */}
      <section className="bg-white/50 dark:bg-[#0f0f0f]/80 backdrop-blur-xl py-24 border-t border-zinc-200 dark:border-zinc-900 relative z-10 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex justify-between items-end mb-16 animate-in fade-in duration-1000">
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-4">
              <div className="w-2 h-10 bg-gradient-to-b from-red-600 to-red-400 rounded-full"></div>
              El Sistema
            </h2>
            <Link to="/explore" className="text-red-600 dark:text-red-500 font-bold uppercase tracking-widest text-sm hover:text-red-700 dark:hover:text-red-400 transition-colors flex items-center gap-1 group">
              Ver catálogo <ChevronRight className="w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Mi Tarjeta 1 - Le pongo 'group' para animar elementos internos al hacer hover y un delay visual */}
            <div className="group bg-zinc-50 dark:bg-[#141414] p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 hover:border-red-500/50 dark:hover:border-red-500/50 hover:shadow-2xl hover:shadow-red-500/10 dark:hover:shadow-red-500/10 hover:-translate-y-2 transition-all duration-500 animate-in fade-in slide-in-from-bottom-12">
              <div className="w-16 h-16 bg-white dark:bg-[#1a1a1a] rounded-2xl flex items-center justify-center mb-8 border border-zinc-200 dark:border-zinc-800 group-hover:bg-red-50 dark:group-hover:bg-red-950/30 group-hover:scale-110 transition-all duration-500 shadow-sm">
                <LayoutGrid className="w-8 h-8 text-zinc-700 dark:text-zinc-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-500" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-3 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">Gestión de Catálogo</h3>
              <p className="text-base text-zinc-600 dark:text-zinc-500 leading-relaxed font-medium">Organiza tus series por géneros, temporadas o estado de visualización. Tu colección, tus reglas.</p>
            </div>

            {/* Mi Tarjeta 2 */}
            <div className="group bg-zinc-50 dark:bg-[#141414] p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 hover:border-red-500/50 dark:hover:border-red-500/50 hover:shadow-2xl hover:shadow-red-500/10 dark:hover:shadow-red-500/10 hover:-translate-y-2 transition-all duration-500 animate-in fade-in slide-in-from-bottom-12" style={{ animationDelay: '100ms' }}>
              <div className="w-16 h-16 bg-white dark:bg-[#1a1a1a] rounded-2xl flex items-center justify-center mb-8 border border-zinc-200 dark:border-zinc-800 group-hover:bg-red-50 dark:group-hover:bg-red-950/30 group-hover:scale-110 transition-all duration-500 shadow-sm">
                <Shield className="w-8 h-8 text-zinc-700 dark:text-zinc-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-500" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-3 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">Bóveda Privada</h3>
              <p className="text-base text-zinc-600 dark:text-zinc-500 leading-relaxed font-medium">Tu cuenta es personal y encriptada. Cada usuario gestiona su propia base de datos de forma 100% segura.</p>
            </div>

            {/* Mi Tarjeta 3 */}
            <div className="group bg-zinc-50 dark:bg-[#141414] p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 hover:border-red-500/50 dark:hover:border-red-500/50 hover:shadow-2xl hover:shadow-red-500/10 dark:hover:shadow-red-500/10 hover:-translate-y-2 transition-all duration-500 animate-in fade-in slide-in-from-bottom-12" style={{ animationDelay: '200ms' }}>
              <div className="w-16 h-16 bg-white dark:bg-[#1a1a1a] rounded-2xl flex items-center justify-center mb-8 border border-zinc-200 dark:border-zinc-800 group-hover:bg-red-50 dark:group-hover:bg-red-950/30 group-hover:scale-110 transition-all duration-500 shadow-sm">
                <Zap className="w-8 h-8 text-zinc-700 dark:text-zinc-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-500" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-3 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">Experiencia SPA</h3>
              <p className="text-base text-zinc-600 dark:text-zinc-500 leading-relaxed font-medium">Navegación instantánea y fluida impulsada por React. Sin tiempos de carga, sin recargas de página.</p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}