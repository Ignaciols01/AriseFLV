import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabaseClient';
import { Search, Loader2 } from 'lucide-react';

export default function Explore() {
  const [catalog, setCatalog] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterGenre, setFilterGenre] = useState('Todos');

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('catalog').select('*').order('title');
    if (data) setCatalog(data);
    setIsLoading(false);
  };

  const filteredCatalog = catalog.filter(c => filterGenre === 'Todos' || c.genre === filterGenre);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 to-[#2a0808] font-sans pb-12">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <h1 className="text-4xl font-black text-white tracking-tight uppercase mb-8">Catálogo Global</h1>
        
        <div className="mb-10 bg-red-50 p-4 rounded-xl shadow-xl flex gap-4">
          <select value={filterGenre} onChange={(e) => setFilterGenre(e.target.value)} className="h-12 w-[220px] rounded-lg border-2 border-red-200 bg-white px-4 text-sm text-red-950 font-black uppercase tracking-wider focus:outline-none focus:border-red-500">
            <option value="Todos">Todos los géneros</option><option value="Shonen">Shonen</option><option value="Seinen">Seinen</option><option value="Shojo">Shojo</option><option value="Isekai">Isekai</option><option value="Slice of Life">Slice of Life</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-24"><Loader2 className="w-12 h-12 text-red-500 animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredCatalog.map((anime) => (
              <div key={anime.id} className="group rounded-xl bg-white shadow-xl overflow-hidden relative flex flex-col border border-red-100">
                <div className="aspect-[3/4] bg-red-100"><img src={anime.cover_url} className="w-full h-full object-cover" /></div>
                <div className="p-4 bg-white">
                  <h3 className="font-black text-red-950 text-lg leading-tight truncate">{anime.title}</h3>
                  <p className="text-xs text-red-400 font-bold uppercase mt-1">{anime.genre}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}