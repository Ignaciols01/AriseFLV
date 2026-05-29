import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabaseClient';
import { Search, Loader2, Sparkles, AlertCircle } from 'lucide-react';

const AnimePoster = ({ title, fallbackUrl }: { title: string, fallbackUrl?: string }) => {
  const [img, setImg] = useState<string | null>(null);

  useEffect(() => {
    const isUserUploaded = fallbackUrl && fallbackUrl.includes('supabase.co');
    if (isUserUploaded) {
      setImg(fallbackUrl);
      return;
    }

    let isMounted = true;
    fetch(`https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(title)}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.data && data.data.length > 0) {
          setImg(data.data[0].attributes.posterImage.large);
        } else if (isMounted) {
          setImg('https://placehold.co/400x600/1a1a1a/ef4444?text=AriseFLV');
        }
      })
      .catch(() => {
        if (isMounted) setImg('https://placehold.co/400x600/1a1a1a/ef4444?text=AriseFLV');
      });

    return () => { isMounted = false };
  }, [title, fallbackUrl]);

  if (!img) return <div className="absolute inset-0 flex justify-center items-center bg-zinc-900"><Loader2 className="w-6 h-6 text-red-600 animate-spin" /></div>;

  return <img src={img} alt={title} className="w-full h-full object-cover relative z-10 transition-transform duration-500 group-hover:scale-110" loading="lazy" />;
};

export default function Explore() {
  const [catalog, setCatalog] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filterGenre, setFilterGenre] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  const genres = ['Todos', 'Shonen', 'Seinen', 'Shojo', 'Isekai', 'Slice of Life'];

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    let isTimeout = false;
    const timeoutId = setTimeout(() => {
      isTimeout = true;
      setErrorMsg("La conexión está tardando demasiado. Si estás en una red restrictiva, el cortafuegos podría estar bloqueando Supabase.");
      setIsLoading(false);
    }, 6000); 

    try {
      const { data, error } = await supabase.from('catalog').select('*').order('title');
      
      if (isTimeout) return; 
      clearTimeout(timeoutId);
      
      if (error) throw error;
      
      // BLINDAJE: Siempre array
      setCatalog(data || []);
      setIsLoading(false);
    } catch (err: any) {
      if (isTimeout) return;
      clearTimeout(timeoutId);
      console.error("Error al cargar el catálogo:", err);
      setErrorMsg("No se pudo conectar con la base de datos de AriseFLV.");
      setCatalog([]);
      setIsLoading(false);
    }
  };

  // BLINDAJE: Filtro seguro
  const filteredCatalog = (catalog || []).filter(c =>
    (filterGenre === 'Todos' || c.genre === filterGenre) &&
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-red-50 dark:bg-gradient-to-br dark:from-red-950 dark:to-[#2a0808] font-sans pb-12 transition-colors duration-300">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">

        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="w-8 h-8 text-red-500" />
          <h1 className="text-4xl font-black text-red-950 dark:text-white tracking-tight uppercase">Catálogo Global</h1>
        </div>

        <div className="mb-10 bg-white dark:bg-black/20 p-6 rounded-xl shadow-xl flex flex-col gap-6 border border-red-100 dark:border-red-900/50">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-red-400" />
            <input
              type="text"
              placeholder="Buscar serie en el catálogo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 rounded-lg border-2 border-red-100 dark:border-red-900/50 bg-red-50 dark:bg-black/20 px-12 text-sm text-red-950 dark:text-white font-bold focus:outline-none focus:border-red-500 dark:focus:border-red-500 shadow-sm transition-colors"
            />
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            {genres.map(genre => (
              <button
                key={genre}
                onClick={() => setFilterGenre(genre)}
                className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                  filterGenre === genre
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/40 transform scale-105'
                    : 'bg-red-50 dark:bg-black/20 border-2 border-red-100 dark:border-red-900/50 text-red-800 dark:text-red-300 hover:border-red-300 dark:hover:border-red-500'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-24 gap-4">
            <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
            <p className="text-red-800 dark:text-red-300 font-bold uppercase tracking-widest text-sm animate-pulse">Conectando con la bóveda...</p>
          </div>
        ) : errorMsg ? (
           <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-black/20 rounded-2xl border-2 border-red-200 dark:border-red-800 text-center px-4 shadow-xl">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h3 className="text-xl font-black text-red-950 dark:text-white uppercase tracking-wider mb-2">Conexión Interrumpida</h3>
            <p className="text-red-800/80 dark:text-red-200 font-medium max-w-lg mb-8">{errorMsg}</p>
            <button 
              onClick={fetchCatalog} 
              className="px-8 py-4 bg-red-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-red-700 transition-all shadow-lg hover:-translate-y-1"
            >
                Reintentar Conexión
            </button>
          </div>
        ) : filteredCatalog?.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredCatalog.map((anime) => (
              <div key={anime.id} className="group rounded-xl bg-white dark:bg-zinc-900 shadow-xl overflow-hidden relative flex flex-col border border-red-100 dark:border-zinc-800 hover:-translate-y-2 transition-all duration-300">
                <div className="aspect-[3/4] bg-zinc-100 dark:bg-zinc-900 relative overflow-hidden">
                  <AnimePoster title={anime.title} fallbackUrl={anime.cover_url} />
                </div>
                <div className="p-4 bg-white dark:bg-zinc-900 relative z-20">
                  <h3 className="font-black text-red-950 dark:text-white text-lg leading-tight truncate">{anime.title}</h3>
                  <p className="text-xs text-red-500 dark:text-red-400 font-bold uppercase mt-1">{anime.genre}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-black/20 rounded-2xl border-2 border-dashed border-red-200 dark:border-red-900/50">
            <h3 className="text-xl font-black text-red-950 dark:text-white uppercase tracking-wider">Sin resultados</h3>
          </div>
        )}
      </main>
    </div>
  );
}