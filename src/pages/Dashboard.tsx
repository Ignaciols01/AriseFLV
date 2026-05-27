import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AddAnimeModal from '../components/AddAnimeModal';
import { supabase } from '../lib/supabaseClient';
import { Plus, Search, Edit2, Trash2, Star, PlayCircle, CheckCircle2, Clock, ChevronRight, Loader2 } from 'lucide-react';

const AnimePoster = ({ title, fallbackUrl }: { title: string, fallbackUrl?: string }) => {
  const [img, setImg] = useState<string | null>(null);

  useEffect(() => {
    if (fallbackUrl) {
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
          setImg('https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80');
        }
      })
      .catch(() => {
        if (isMounted) setImg('https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80');
      });

    return () => { isMounted = false };
  }, [title, fallbackUrl]);

  if (!img) return <div className="absolute inset-0 flex justify-center items-center bg-zinc-100 dark:bg-zinc-900 transition-colors duration-300"><Loader2 className="w-6 h-6 text-red-600 animate-spin" /></div>;

  return <img src={img} alt={title} className="w-full h-full object-cover relative z-10 transition-transform duration-500 group-hover:scale-110" loading="lazy" />;
};

export default function Dashboard() {
  const [animes, setAnimes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGenre, setFilterGenre] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [animeToEdit, setAnimeToEdit] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, animeId: '' });

  const genres = ['Todos', 'Shonen', 'Seinen', 'Shojo', 'Isekai', 'Slice of Life'];

  useEffect(() => {
    fetchAnimes();
  }, []);

  const fetchAnimes = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('animes').select('*').order('created_at', { ascending: false });
    if (data) setAnimes(data);
    setIsLoading(false);
  };

  const openDeleteModal = (id: string) => {
    setDeleteModal({ isOpen: true, animeId: id });
  };

  const confirmDelete = async () => {
    await supabase.from('animes').delete().eq('id', deleteModal.animeId);
    setAnimes(animes.filter(a => a.id !== deleteModal.animeId));
    setDeleteModal({ isOpen: false, animeId: '' });
  };

  const handleSaveAnime = async (formData: any) => {
    let publicUrl = formData.cover_url;

    if (formData.coverFile) {
      const fileExt = formData.coverFile.name.split('.').pop();
      const filePath = `covers/${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('ariseflv_bucket').upload(filePath, formData.coverFile);
      if (uploadError) {
        alert("Error al subir: " + uploadError.message);
        return; 
      } else {
        const { data } = supabase.storage.from('ariseflv_bucket').getPublicUrl(filePath);
        publicUrl = data.publicUrl;
      }
    }

    const { data: userData } = await supabase.auth.getUser();

    if (formData.id) {
      const { data } = await supabase.from('animes').update({
        title: formData.title, genre: formData.genre, status: formData.status, rating: formData.rating, cover_url: publicUrl
      }).eq('id', formData.id).select();
      if (data) setAnimes(animes.map(a => a.id === formData.id ? data[0] : a));
    } else {
      const { data } = await supabase.from('animes').insert([{
        title: formData.title, genre: formData.genre, status: formData.status, rating: formData.rating, cover_url: publicUrl, user_id: userData.user?.id
      }]).select();
      if (data) setAnimes([data[0], ...animes]);
    }
    setIsModalOpen(false); 
  };

  const openEditModal = (anime: any) => {
    setAnimeToEdit(anime);
    setIsModalOpen(true);
  };

  const filteredAnimes = animes.filter((anime) => {
    return (filterGenre === 'Todos' || anime.genre === filterGenre) && 
           anime.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    // MI MAGIA DE COLORES: bg-red-50 para luz, bg-gradient-to-br oscuro para la noche
    <div className="min-h-screen bg-red-50 dark:bg-gradient-to-br dark:from-red-950 dark:to-[#2a0808] font-sans pb-12 transition-colors duration-300">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <nav className="flex items-center text-red-800/80 dark:text-red-300/80 text-xs font-black uppercase tracking-widest mb-6 transition-colors">
          <Link to="/" className="hover:text-red-950 dark:hover:text-white transition-colors">Inicio</Link>
          <ChevronRight className="w-3 h-3 mx-2" />
          <span className="text-red-600 dark:text-red-500">Mi Catálogo</span>
        </nav>

        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black text-red-950 dark:text-white tracking-tight uppercase transition-colors">Mi Catálogo</h1>
          <button 
            onClick={() => { setAnimeToEdit(null); setIsModalOpen(true); }}
            className="h-12 px-6 bg-red-600 text-white font-black uppercase tracking-widest rounded-lg flex items-center gap-2 hover:bg-red-500 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" /> Añadir
          </button>
        </div>

        <div className="mb-10 bg-white dark:bg-red-50/5 p-6 rounded-xl shadow-xl flex flex-col gap-6 transition-colors border border-red-100 dark:border-transparent">
          
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-red-400" />
            <input 
              type="text" 
              placeholder="Buscar en tu bóveda..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full h-12 rounded-lg border-2 border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-black/20 px-12 text-sm text-red-950 dark:text-red-100 font-bold focus:outline-none focus:border-red-500 dark:focus:border-red-500 shadow-sm transition-colors" 
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
                    : 'bg-red-50 dark:bg-black/20 border-2 border-red-100 dark:border-red-900/50 text-red-800 dark:text-red-200 hover:border-red-300 dark:hover:border-red-700'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-24"><Loader2 className="w-12 h-12 text-red-500 animate-spin" /></div>
        ) : filteredAnimes.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredAnimes.map((anime) => (
              <div key={anime.id} className="group rounded-xl bg-white dark:bg-zinc-900 shadow-xl hover:-translate-y-1 transition-all overflow-hidden relative flex flex-col border border-red-100 dark:border-zinc-800">
                <div className="aspect-[3/4] bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center border-b border-red-100 dark:border-zinc-800 relative overflow-hidden transition-colors">
                  <AnimePoster title={anime.title} fallbackUrl={anime.cover_url} />
                </div>
                <div className="p-5 flex flex-col flex-1 bg-white dark:bg-zinc-900 relative z-20 transition-colors">
                  <div className="flex justify-between mb-3">
                    <span className="text-xs font-bold text-blue-800 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-md transition-colors">
                      {anime.status === 'Viendo' && <><PlayCircle className="w-3 h-3 inline mr-1"/> Viendo</>}
                      {anime.status === 'Completado' && <><CheckCircle2 className="w-3 h-3 inline mr-1"/> Completado</>}
                      {anime.status === 'Pendiente' && <><Clock className="w-3 h-3 inline mr-1"/> Pendiente</>}
                    </span>
                    <span className="flex items-center text-red-600 text-xs font-black bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded-md border border-red-100 dark:border-red-900/30 transition-colors"><Star className="w-3 h-3 mr-1 fill-current" />{anime.rating}</span>
                  </div>
                  <h3 className="font-black text-red-950 dark:text-white text-lg leading-tight line-clamp-2 transition-colors">{anime.title}</h3>
                  <p className="text-xs text-red-400 dark:text-red-500 font-bold uppercase mt-auto pt-3 transition-colors">{anime.genre}</p>
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 dark:bg-black/90 backdrop-blur-sm rounded-lg shadow-lg flex border border-red-100 dark:border-zinc-700 z-30">
                  <button onClick={() => openEditModal(anime)} className="p-2.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"><Edit2 className="w-4 h-4" /></button>
                  <div className="w-px bg-red-100 dark:bg-zinc-700"></div>
                  <button onClick={() => openDeleteModal(anime.id)} className="p-2.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white/50 dark:bg-red-950/50 rounded-2xl border-2 border-dashed border-red-200 dark:border-red-800 transition-colors"><h3 className="text-xl font-black text-red-950 dark:text-white uppercase tracking-wider">Sin resultados</h3></div>
        )}
      </main>

      <AddAnimeModal isOpen={isModalOpen} animeToEdit={animeToEdit} onClose={() => setIsModalOpen(false)} onSave={handleSaveAnime} />
      
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm overflow-hidden p-8 text-center shadow-[0_10px_40px_rgba(0,0,0,0.5)] transform transition-all animate-in zoom-in-95 border-b-4 border-red-600">
            <div className="mx-auto w-20 h-20 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center mb-6 shadow-sm border-2 border-red-100 dark:border-red-900">
              <Trash2 className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-red-950 dark:text-white uppercase tracking-tight mb-3">¿Eliminar Anime?</h2>
            <p className="text-sm font-medium text-red-800/70 dark:text-red-200/70 mb-8">Esta acción quitará la serie de tu bóveda personal de forma permanente.</p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmDelete} className="w-full py-4 text-sm font-black text-white bg-red-600 hover:bg-red-700 rounded-xl uppercase tracking-widest shadow-md transition-all">Sí, Eliminar</button>
              <button onClick={() => setDeleteModal({ isOpen: false, animeId: '' })} className="w-full py-4 text-sm font-black text-red-800 dark:text-zinc-300 bg-white dark:bg-zinc-800 border-2 border-red-200 dark:border-zinc-700 hover:bg-red-50 dark:hover:bg-zinc-700 rounded-xl uppercase tracking-widest transition-all">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}