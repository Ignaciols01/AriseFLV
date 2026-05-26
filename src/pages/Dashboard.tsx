import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AddAnimeModal from '../components/AddAnimeModal';
import { supabase } from '../lib/supabaseClient';
import { Plus, Search, Edit2, Trash2, Star, PlayCircle, CheckCircle2, Clock, Image as ImageIcon, ChevronRight, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [animes, setAnimes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGenre, setFilterGenre] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [animeToEdit, setAnimeToEdit] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Seguro que quieres eliminar este anime?")) {
      await supabase.from('animes').delete().eq('id', id);
      setAnimes(animes.filter(a => a.id !== id));
    }
  };

  const handleSaveAnime = async (formData: any) => {
    let publicUrl = formData.cover_url;

    if (formData.coverFile) {
      const fileExt = formData.coverFile.name.split('.').pop();
      const filePath = `covers/${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('ariseflv_bucket').upload(filePath, formData.coverFile);
      
      if (uploadError) {
        alert("Atención: No se pudo subir la imagen. Comprueba que el 'ariseflv_bucket' sea público en Supabase. Error: " + uploadError.message);
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
    <div className="min-h-screen bg-gradient-to-br from-red-950 to-[#2a0808] font-sans pb-12">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <nav className="flex items-center text-red-300/80 text-xs font-black uppercase tracking-widest mb-6">
          <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
          <ChevronRight className="w-3 h-3 mx-2" />
          <span className="text-red-500">Mi Catálogo</span>
        </nav>

        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black text-white tracking-tight uppercase">Mi Catálogo</h1>
          <button 
            onClick={() => { setAnimeToEdit(null); setIsModalOpen(true); }}
            className="h-12 px-6 bg-red-600 text-white font-black uppercase tracking-widest rounded-lg flex items-center gap-2 hover:bg-red-500 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" /> Añadir
          </button>
        </div>

        {/* NUEVO SISTEMA DE FILTROS */}
        <div className="mb-10 bg-red-50 p-6 rounded-xl shadow-xl flex flex-col gap-6">
          
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-red-400" />
            <input 
              type="text" 
              placeholder="Buscar en tu bóveda..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full h-12 rounded-lg border-2 border-red-200 bg-white px-12 text-sm text-red-950 font-bold focus:outline-none focus:border-red-500 shadow-sm transition-colors" 
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
                    : 'bg-white border-2 border-red-100 text-red-800 hover:border-red-300 hover:bg-red-50'
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
              <div key={anime.id} className="group rounded-xl bg-white shadow-xl hover:-translate-y-1 transition-all overflow-hidden relative flex flex-col border border-red-100">
                <div className="aspect-[3/4] bg-zinc-900 flex items-center justify-center border-b border-red-100 relative">
                  {anime.cover_url ? (
                    <img src={anime.cover_url} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-red-300" />
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1 bg-white">
                  <div className="flex justify-between mb-3">
                    <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-1 rounded-md">
                      {anime.status === 'Viendo' && <><PlayCircle className="w-3 h-3 inline mr-1"/> Viendo</>}
                      {anime.status === 'Completado' && <><CheckCircle2 className="w-3 h-3 inline mr-1"/> Completado</>}
                      {anime.status === 'Pendiente' && <><Clock className="w-3 h-3 inline mr-1"/> Pendiente</>}
                    </span>
                    <span className="flex items-center text-red-600 text-xs font-black bg-red-50 px-2 py-1 rounded-md border border-red-100"><Star className="w-3 h-3 mr-1 fill-current" />{anime.rating}</span>
                  </div>
                  <h3 className="font-black text-red-950 text-lg leading-tight line-clamp-2">{anime.title}</h3>
                  <p className="text-xs text-red-400 font-bold uppercase mt-auto pt-3">{anime.genre}</p>
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 rounded-lg shadow-lg flex border border-red-100">
                  <button onClick={() => openEditModal(anime)} className="p-2.5 text-red-400 hover:text-red-600"><Edit2 className="w-4 h-4" /></button>
                  <div className="w-px bg-red-100"></div>
                  <button onClick={() => handleDelete(anime.id)} className="p-2.5 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-red-950/50 rounded-2xl border-2 border-dashed border-red-800"><h3 className="text-xl font-black text-white uppercase tracking-wider">Sin resultados</h3></div>
        )}
      </main>

      <AddAnimeModal isOpen={isModalOpen} animeToEdit={animeToEdit} onClose={() => setIsModalOpen(false)} onSave={handleSaveAnime} />
    </div>
  );
}