import { useState, useRef, useEffect } from 'react';
import { X, Upload, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

type AnimeFormData = {
  id?: string;
  title: string;
  genre: string;
  status: string;
  rating: number;
  coverFile: File | null;
  cover_url: string;
};

type Props = {
  isOpen: boolean;
  animeToEdit?: AnimeFormData | null;
  onClose: () => void;
  onSave: (anime: AnimeFormData) => void;
};

export default function AddAnimeModal({ isOpen, animeToEdit, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<AnimeFormData>({
    title: '', genre: 'Shonen', status: 'Pendiente', rating: 5, coverFile: null, cover_url: ''
  });

  const [catalog, setCatalog] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCatalog = async () => {
      const { data } = await supabase.from('catalog').select('*');
      if (data) setCatalog(data);
    };
    fetchCatalog();
  }, []);

  useEffect(() => {
    if (animeToEdit) {
      setFormData(animeToEdit);
    } else {
      setFormData({ title: '', genre: 'Shonen', status: 'Pendiente', rating: 5, coverFile: null, cover_url: '' });
    }
  }, [animeToEdit, isOpen]);

  if (!isOpen) return null;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, title: e.target.value });
  };

  // El sistema de auto-completado mágico que se activa al terminar de escribir el título
  const handleTitleBlur = async () => {
    if (!formData.title) return;

    // 1. Búsqueda instantánea en tu propio catálogo local
    const matched = catalog.find(c => c.title.toLowerCase() === formData.title.toLowerCase());
    if (matched) {
      setFormData(prev => ({
        ...prev,
        genre: matched.genre,
        cover_url: prev.coverFile ? prev.cover_url : matched.cover_url
      }));
      return;
    }

    // 2. Si es un anime nuevo, buscamos en la base de datos mundial
    setIsSearching(true);
    try {
      const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(formData.title)}&limit=1`);
      const json = await res.json();

      if (json.data && json.data.length > 0) {
        const anime = json.data[0];

        const newCoverUrl = anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url || '';

        const allTags = [
          ...(anime.genres || []),
          ...(anime.themes || []),
          ...(anime.demographics || [])
        ].map((g: any) => g.name.toLowerCase());

        let detectedGenre = formData.genre;

        if (allTags.includes('shounen')) detectedGenre = 'Shonen';
        else if (allTags.includes('seinen')) detectedGenre = 'Seinen';
        else if (allTags.includes('shoujo')) detectedGenre = 'Shojo';
        else if (allTags.includes('isekai')) detectedGenre = 'Isekai';
        else if (allTags.includes('slice of life')) detectedGenre = 'Slice of Life';

        setFormData(prev => ({
          ...prev,
          genre: detectedGenre,
          cover_url: prev.coverFile ? prev.cover_url : newCoverUrl
        }));
      }
    } catch (error) {
      console.error("Error al buscar el anime:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, coverFile: file, cover_url: URL.createObjectURL(file) });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 transition-all animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden transform transition-all border border-red-100 dark:border-zinc-800 animate-in zoom-in-95">
        
        <div className="flex justify-between items-center p-6 border-b-2 border-red-50 dark:border-zinc-800 bg-red-50/30 dark:bg-black/20">
          <h2 className="text-xl font-black text-red-950 dark:text-white uppercase tracking-wide flex items-center gap-2">
            {animeToEdit ? 'Editar Anime' : 'Añadir a la bóveda'}
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1 rounded-md bg-white dark:bg-zinc-800 shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div>
            <label className="block text-xs font-black text-red-800 dark:text-red-300 uppercase tracking-widest mb-2">Portada</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-36 bg-red-50/50 dark:bg-black/20 border-2 border-dashed border-red-200 dark:border-red-900/50 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-red-500 dark:hover:border-red-500 overflow-hidden transition-colors relative group"
            >
              {formData.cover_url ? (
                <>
                  <img src={formData.cover_url} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-red-400 dark:text-red-500/50 mb-2" />
                  <span className="text-xs font-bold text-red-500 dark:text-red-400 uppercase">Subir Imagen</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-black text-red-800 dark:text-red-300 uppercase tracking-widest">Título</label>
              {isSearching && <span className="text-[10px] font-bold text-red-500 animate-pulse flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Detectando...</span>}
            </div>
            <div className="relative">
              <input 
                type="text" 
                required 
                list="catalog-titles"
                placeholder="Ej: Shingeki no Kyojin"
                value={formData.title} 
                onChange={handleTitleChange} 
                onBlur={handleTitleBlur}
                className="w-full px-4 py-3 bg-red-50/50 dark:bg-black/20 border-2 border-red-200 dark:border-red-900/50 text-red-950 dark:text-red-100 font-bold focus:border-red-600 dark:focus:border-red-500 focus:outline-none rounded-xl transition-colors" 
              />
              {!isSearching && formData.title && <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400/50" />}
            </div>
            <datalist id="catalog-titles">
              {catalog.map(c => <option key={c.id} value={c.title} />)}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-red-800 dark:text-red-300 uppercase tracking-widest mb-2">Género</label>
              <select value={formData.genre} onChange={(e) => setFormData({ ...formData, genre: e.target.value })} className="w-full px-4 py-3 bg-red-50/50 dark:bg-black/20 border-2 border-red-200 dark:border-red-900/50 text-red-950 dark:text-red-100 font-bold focus:border-red-600 dark:focus:border-red-500 focus:outline-none rounded-xl transition-colors cursor-pointer">
                <option value="Shonen">Shonen</option>
                <option value="Seinen">Seinen</option>
                <option value="Shojo">Shojo</option>
                <option value="Isekai">Isekai</option>
                <option value="Slice of Life">Slice of Life</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-red-800 dark:text-red-300 uppercase tracking-widest mb-2">Estado</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-3 bg-red-50/50 dark:bg-black/20 border-2 border-red-200 dark:border-red-900/50 text-red-950 dark:text-red-100 font-bold focus:border-red-600 dark:focus:border-red-500 focus:outline-none rounded-xl transition-colors cursor-pointer">
                <option value="Viendo">Viendo</option>
                <option value="Completado">Completado</option>
                <option value="Pendiente">Pendiente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-red-800 dark:text-red-300 uppercase tracking-widest mb-2">Nota (1-10)</label>
            <input type="number" min="1" max="10" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })} className="w-full px-4 py-3 bg-red-50/50 dark:bg-black/20 border-2 border-red-200 dark:border-red-900/50 text-red-950 dark:text-red-100 font-bold focus:border-red-600 dark:focus:border-red-500 focus:outline-none rounded-xl transition-colors" />
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button type="button" onClick={onClose} className="px-6 py-3 text-sm font-black text-red-800 dark:text-zinc-300 bg-transparent border-2 border-red-200 dark:border-zinc-700 rounded-xl hover:bg-red-50 dark:hover:bg-zinc-800 uppercase tracking-widest transition-colors">Cancelar</button>
            <button type="submit" className="px-6 py-3 text-sm font-black text-white bg-red-600 rounded-xl hover:bg-red-700 uppercase tracking-widest shadow-lg shadow-red-600/30 transition-all hover:-translate-y-0.5">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}