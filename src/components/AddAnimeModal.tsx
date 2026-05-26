import { useState, useRef, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargamos el catálogo global para el autocompletado
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

  // MAGIA: Si el título coincide con uno del catálogo, autorellenar
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const matched = catalog.find(c => c.title.toLowerCase() === val.toLowerCase());
    
    if (matched) {
      setFormData({ ...formData, title: matched.title, genre: matched.genre, cover_url: matched.cover_url });
    } else {
      setFormData({ ...formData, title: val });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-red-50 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden transform transition-all">
        <div className="flex justify-between items-center p-6 border-b-2 border-red-100">
          <h2 className="text-xl font-black text-red-950 uppercase tracking-wide">
            {animeToEdit ? 'Editar Anime' : 'Añadir a la bóveda'}
          </h2>
          <button onClick={onClose} className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-md">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-black text-red-800 uppercase tracking-widest mb-2">Portada</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 bg-white border-2 border-dashed border-red-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-red-500 overflow-hidden"
            >
              {formData.cover_url ? (
                <img src={formData.cover_url} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <><Upload className="w-6 h-6 text-red-400 mb-2" /><span className="text-xs font-bold text-red-500 uppercase">Subir Imagen</span></>
              )}
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-red-800 uppercase tracking-widest mb-2">Título</label>
            <input 
              type="text" 
              required 
              list="catalog-titles"
              placeholder="Ej: Shingeki no Kyojin"
              value={formData.title} 
              onChange={handleTitleChange} 
              className="w-full px-4 py-3 bg-white border-2 border-red-200 text-red-950 font-medium focus:border-red-600 focus:outline-none rounded-lg" 
            />
            {/* Lista de sugerencias nativa */}
            <datalist id="catalog-titles">
              {catalog.map(c => <option key={c.id} value={c.title} />)}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-red-800 uppercase tracking-widest mb-2">Género</label>
              <select value={formData.genre} onChange={(e) => setFormData({ ...formData, genre: e.target.value })} className="w-full px-4 py-3 bg-white border-2 border-red-200 text-red-950 font-medium focus:border-red-600 focus:outline-none rounded-lg">
                <option value="Shonen">Shonen</option><option value="Seinen">Seinen</option><option value="Shojo">Shojo</option><option value="Isekai">Isekai</option><option value="Slice of Life">Slice of Life</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-red-800 uppercase tracking-widest mb-2">Estado</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-3 bg-white border-2 border-red-200 text-red-950 font-medium focus:border-red-600 focus:outline-none rounded-lg">
                <option value="Viendo">Viendo</option><option value="Completado">Completado</option><option value="Pendiente">Pendiente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-red-800 uppercase tracking-widest mb-2">Nota (1-10)</label>
            <input type="number" min="1" max="10" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })} className="w-full px-4 py-3 bg-white border-2 border-red-200 text-red-950 font-medium focus:border-red-600 focus:outline-none rounded-lg" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t-2 border-red-100">
            <button type="button" onClick={onClose} className="px-6 py-3 text-sm font-black text-red-800 bg-white border-2 border-red-200 rounded-lg hover:bg-red-50 uppercase tracking-widest">Cancelar</button>
            <button type="submit" className="px-6 py-3 text-sm font-black text-white bg-red-600 rounded-lg hover:bg-red-700 uppercase tracking-widest shadow-md">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}