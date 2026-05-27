import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabaseClient';
import { 
  Shield, Trash2, Users, Edit, X, AlertTriangle, Loader2, 
  Eye, Calendar, Hash, Activity, Database, Settings, ShieldAlert, Film, Plus 
} from 'lucide-react';

export default function AdminPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'catalog' | 'stats' | 'settings'>('users');
  
  const [catalogCount, setCatalogCount] = useState(0);
  const [currentUserRole, setCurrentUserRole] = useState('admin');
  const [currentUserId, setCurrentUserId] = useState('');
  
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: '' });
  const [editModal, setEditModal] = useState({ isOpen: false, user: { id: '', name: '', role: '' } });
  const [detailsModal, setDetailsModal] = useState({ isOpen: false, user: null as any });
  const [catalogModal, setCatalogModal] = useState({ isOpen: false, anime: null as any });
  const [deleteCatalogModal, setDeleteCatalogModal] = useState({ isOpen: false, animeId: '' });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData.user && isMounted) setCurrentUserId(authData.user.id);
        
        const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (profiles && isMounted) {
          setUsers(profiles);
          const myProfile = profiles.find(u => u.id === authData.user?.id);
          if (myProfile) setCurrentUserRole(myProfile.role);
        }

        const { data: catalogData } = await supabase.from('catalog').select('*').order('title', { ascending: true });
        if (catalogData && isMounted) {
          setCatalog(catalogData);
          setCatalogCount(catalogData.length);
        }
      } catch (error) {
        console.error("Error al cargar datos del panel:", error);
      } finally {
        if (isMounted) setIsLoading(false); // ESTO EVITA QUE SE QUEDE CONGELADO
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, []);

  const confirmDelete = async () => {
    await supabase.from('profiles').delete().eq('id', deleteModal.userId);
    setUsers(users.filter(u => u.id !== deleteModal.userId));
    setDeleteModal({ isOpen: false, userId: '' });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('profiles').update({ role: editModal.user.role }).eq('id', editModal.user.id);
    if (editModal.user.id === currentUserId && editModal.user.role === 'client') {
      window.location.href = '/dashboard';
      return;
    }
    setUsers(users.map(u => u.id === editModal.user.id ? { ...u, role: editModal.user.role } : u));
    setEditModal({ isOpen: false, user: { id: '', name: '', role: '' } });
  };

  const handleSaveCatalog = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const animeData = { title: formData.get('title'), genre: formData.get('genre') };

    if (catalogModal.anime) {
      const { data } = await supabase.from('catalog').update(animeData).eq('id', catalogModal.anime.id).select();
      if (data) setCatalog(catalog.map(a => a.id === catalogModal.anime.id ? data[0] : a));
    } else {
      const { data } = await supabase.from('catalog').insert([animeData]).select();
      if (data) { setCatalog([...catalog, data[0]]); setCatalogCount(prev => prev + 1); }
    }
    setCatalogModal({ isOpen: false, anime: null });
  };

  const confirmDeleteCatalog = async () => {
    await supabase.from('catalog').delete().eq('id', deleteCatalogModal.animeId);
    setCatalog(catalog.filter(a => a.id !== deleteCatalogModal.animeId));
    setCatalogCount(prev => prev - 1);
    setDeleteCatalogModal({ isOpen: false, animeId: '' });
  };

  return (
    <div className="min-h-screen bg-red-50 dark:bg-gradient-to-br dark:from-red-950 dark:to-[#2a0808] font-sans pb-20 selection:bg-red-500 selection:text-white transition-colors duration-300">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 animate-in fade-in duration-500">
        
        <div className="mb-8">
          <h1 className="text-4xl font-black text-red-950 dark:text-white tracking-tight uppercase flex items-center gap-3 transition-colors">
            <Shield className="w-8 h-8 text-red-500 animate-pulse" /> Control Global
          </h1>
        </div>

        <div className="flex gap-2 sm:gap-6 border-b border-red-200 dark:border-red-900/50 mb-8 overflow-x-auto pb-1 transition-colors">
          {[
            { id: 'users', icon: Users, label: 'Directorio' },
            { id: 'catalog', icon: Film, label: 'Catálogo' },
            { id: 'stats', icon: Activity, label: 'Métricas' },
            { id: 'settings', icon: Settings, label: 'Ajustes' },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)} 
              className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 whitespace-nowrap border-b-2 ${
                activeTab === tab.id 
                  ? 'text-red-600 dark:text-red-500 border-red-600 dark:border-red-500' 
                  : 'text-red-800/50 dark:text-red-200/50 border-transparent hover:text-red-950 dark:hover:text-red-200 hover:border-red-300 dark:hover:border-red-200/30'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'animate-bounce' : ''}`} /> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'users' && (
          <div className="bg-white dark:bg-red-50/5 rounded-xl shadow-2xl overflow-hidden border border-red-200 dark:border-red-100/20 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">
            <div className="p-6 border-b border-red-100 dark:border-zinc-800 bg-red-50/50 dark:bg-black/20 flex justify-between items-center transition-colors">
              <h2 className="text-lg font-black text-red-950 dark:text-white uppercase tracking-widest flex items-center gap-2">
                <Users className="w-5 h-5 text-red-600" /> Miembros
              </h2>
              <span className="bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-red-200 dark:border-red-900/50">
                Total: {users.length}
              </span>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-10 h-10 text-red-500 animate-spin" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white dark:bg-zinc-900 text-red-800 dark:text-red-400 text-xs uppercase tracking-widest font-black border-b border-red-100 dark:border-zinc-800 transition-colors">
                      <th className="px-6 py-5">Identidad</th>
                      <th className="px-6 py-5">Rango</th>
                      <th className="px-6 py-5 text-right">Administración</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-zinc-900 divide-y divide-red-50 dark:divide-zinc-800/50 transition-colors">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-red-50 dark:hover:bg-zinc-800/50 transition-colors duration-200 group">
                        <td className="px-6 py-4 flex flex-col">
                          <span className="font-black text-lg text-red-950 dark:text-white">{user.username || 'Usuario Anónimo'} {user.id === currentUserId && <span className="text-xs text-red-500 ml-2">(Tú)</span>}</span>
                          <span className="text-xs text-red-500/70 dark:text-red-400/70 uppercase font-bold">{user.email}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-transform duration-300 group-hover:scale-105 inline-block ${
                            user.role === 'superadmin' ? 'bg-red-950 dark:bg-red-900 text-white shadow-sm' : 
                            user.role === 'admin' ? 'bg-red-600 text-white shadow-sm' : 'bg-red-100 dark:bg-zinc-800 text-red-800 dark:text-zinc-300 border border-transparent dark:border-zinc-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setDetailsModal({ isOpen: true, user })} className="p-2 text-indigo-600 dark:text-indigo-400 hover:text-white hover:bg-indigo-500 bg-indigo-50 dark:bg-zinc-800 border border-indigo-200 dark:border-zinc-700 rounded-md transition-all duration-300"><Eye className="w-4 h-4" /></button>
                            <button onClick={() => setEditModal({ isOpen: true, user: { id: user.id, name: user.username, role: user.role } })} className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-white hover:bg-zinc-800 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md transition-all duration-300"><Edit className="w-4 h-4" /></button>
                            {user.id !== currentUserId && (
                              <button onClick={() => setDeleteModal({ isOpen: true, userId: user.id })} className="p-2 text-red-600 dark:text-red-500 hover:text-white hover:bg-red-600 bg-red-50 dark:bg-zinc-800 border border-red-200 dark:border-zinc-700 rounded-md transition-all duration-300"><Trash2 className="w-4 h-4" /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- CATÁLOGO --- */}
        {activeTab === 'catalog' && (
          <div className="bg-white dark:bg-red-50/5 rounded-xl shadow-2xl overflow-hidden border border-red-200 dark:border-red-100/20 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">
            <div className="p-6 border-b border-red-100 dark:border-zinc-800 bg-red-50/50 dark:bg-black/20 flex justify-between items-center transition-colors">
              <h2 className="text-lg font-black text-red-950 dark:text-white uppercase tracking-widest flex items-center gap-2">
                <Film className="w-5 h-5 text-red-600" /> Base de Datos de Animes
              </h2>
              <button onClick={() => setCatalogModal({ isOpen: true, anime: null })} className="px-4 py-2 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-red-700 transition-all shadow-md flex items-center gap-2">
                <Plus className="w-4 h-4" /> Añadir
              </button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-10 h-10 text-red-500 animate-spin" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white dark:bg-zinc-900 text-red-800 dark:text-red-400 text-xs uppercase tracking-widest font-black border-b border-red-100 dark:border-zinc-800 transition-colors">
                      <th className="px-6 py-5">Título Original</th>
                      <th className="px-6 py-5">Género</th>
                      <th className="px-6 py-5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-zinc-900 divide-y divide-red-50 dark:divide-zinc-800/50 transition-colors">
                    {catalog.map((anime) => (
                      <tr key={anime.id} className="hover:bg-red-50 dark:hover:bg-zinc-800/50 transition-colors duration-200 group">
                        <td className="px-6 py-4 font-black text-red-950 dark:text-white">{anime.title}</td>
                        <td className="px-6 py-4"><span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded border border-red-100 dark:border-red-900/50">{anime.genre}</span></td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setCatalogModal({ isOpen: true, anime })} className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-white hover:bg-zinc-800 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md transition-all duration-300"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => setDeleteCatalogModal({ isOpen: true, animeId: anime.id })} className="p-2 text-red-600 dark:text-red-500 hover:text-white hover:bg-red-600 bg-red-50 dark:bg-zinc-800 border border-red-200 dark:border-zinc-700 rounded-md transition-all duration-300"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- MÉTRICAS --- */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {[
              { label: 'Base de Datos', value: catalogCount, sub: 'Animes en catálogo', icon: Database, color: 'indigo' },
              { label: 'Cuentas Creadas', value: users.length, sub: 'Usuarios registrados', icon: Users, color: 'red' },
              { label: 'Último Ingreso', value: users.length > 0 ? new Date(users[0].created_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) : 'N/A', sub: 'Fecha de registro', icon: Calendar, color: 'emerald' },
            ].map((stat, i) => (
              <div key={i} className={`bg-white dark:bg-zinc-900 p-6 rounded-xl border-l-8 border-${stat.color}-500 shadow-xl hover:-translate-y-1 transition-all duration-300`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{stat.label}</p>
                    <h3 className="text-4xl font-black text-zinc-900 dark:text-white mt-1">{stat.value}</h3>
                  </div>
                  <stat.icon className={`text-${stat.color}-500 opacity-20 w-10 h-10`} />
                </div>
                <p className={`text-sm font-bold text-${stat.color}-700 dark:text-${stat.color}-400 bg-${stat.color}-50 dark:bg-${stat.color}-950/30 inline-block px-3 py-1 rounded-md border border-${stat.color}-100 dark:border-transparent`}>{stat.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* --- AJUSTES DE ADMIN --- */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden border border-red-100 dark:border-zinc-800 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">
            <div className="p-6 border-b border-red-100 dark:border-zinc-800 bg-red-50 dark:bg-black/20 flex items-center gap-3 transition-colors">
              <ShieldAlert className="w-6 h-6 text-red-600" />
              <h2 className="text-lg font-black text-red-950 dark:text-white uppercase tracking-widest">Seguridad del Sistema</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg transition-colors">
                <div>
                  <p className="font-bold text-zinc-900 dark:text-white">Modo Mantenimiento</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Bloquea el acceso a clientes temporalmente.</p>
                </div>
                <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${currentUserRole === 'superadmin' ? 'bg-red-600 cursor-pointer shadow-lg' : 'bg-zinc-300 dark:bg-zinc-700 cursor-not-allowed opacity-50'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 ${currentUserRole === 'superadmin' ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>
              {currentUserRole === 'superadmin' ? (
                 <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 text-center uppercase tracking-widest mt-4 animate-pulse">Privilegios de SuperAdmin Activos</p>
              ) : (
                 <p className="text-xs font-bold text-red-500 dark:text-red-400 text-center uppercase tracking-widest mt-4">Solo lectura. Requiere permisos SuperAdmin.</p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* LOS MODALES MANTIENEN SU ESTÉTICA CLARA/OSCURA DE FORMA NATIVA */}
      
      {detailsModal.isOpen && detailsModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-in zoom-in-95 duration-300 border border-transparent dark:border-zinc-800">
            <div className="h-24 bg-gradient-to-r from-red-900 to-red-600 relative">
              <button onClick={() => setDetailsModal({ isOpen: false, user: null })} className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-1.5 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-8 pb-8">
              <div className="w-20 h-20 bg-zinc-900 dark:bg-black border-4 border-white dark:border-zinc-800 rounded-2xl flex items-center justify-center -mt-10 mb-4 shadow-lg transform rotate-3">
                <span className="text-3xl font-black text-white uppercase">{detailsModal.user.username ? detailsModal.user.username.charAt(0) : '?'}</span>
              </div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white">{detailsModal.user.username || 'Usuario Anónimo'}</h2>
                  <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{detailsModal.user.email}</p>
                </div>
                <span className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border-2 ${
                  detailsModal.user.role === 'superadmin' ? 'bg-red-950 dark:bg-red-900 text-white border-red-950 dark:border-red-900' : 
                  detailsModal.user.role === 'admin' ? 'bg-red-50 dark:bg-red-950/30 text-red-600 border-red-200 dark:border-red-900/50' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                }`}>
                  {detailsModal.user.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {editModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-2 duration-300 border border-transparent dark:border-zinc-800">
            <div className="flex justify-between items-center p-6 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase">Privilegios</h2>
              <button onClick={() => setEditModal({ isOpen: false, user: { id: '', name: '', role: '' } })}><X className="w-5 h-5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors" /></button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6">
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mb-4">Modificando nivel de acceso para <span className="font-bold text-zinc-900 dark:text-white">{editModal.user.name || 'este usuario'}</span>.</p>
              <select value={editModal.user.role} onChange={(e) => setEditModal({ ...editModal, user: { ...editModal.user, role: e.target.value } })} className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold focus:border-red-600 dark:focus:border-red-500 rounded-xl mb-6 outline-none transition-colors cursor-pointer shadow-sm">
                <option value="client">Cliente</option>
                <option value="admin">Administrador</option>
                {currentUserRole === 'superadmin' && <option value="superadmin">Super Administrador</option>}
              </select>
              <button type="submit" className="w-full py-4 text-sm font-black text-white bg-zinc-900 dark:bg-red-600 hover:bg-black dark:hover:bg-red-700 rounded-xl uppercase tracking-widest shadow-lg transition-all hover:-translate-y-0.5">Actualizar Permisos</button>
            </form>
          </div>
        </div>
      )}

      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm overflow-hidden p-8 text-center animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border-b-4 border-red-600 shadow-2xl">
            <div className="mx-auto w-20 h-20 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center mb-6 border border-red-100 dark:border-red-900/50">
              <AlertTriangle className="w-10 h-10 text-red-600 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-3">¿Purgar Cuenta?</h2>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-8">Esta acción destruirá todos los datos asociados a este usuario de forma permanente.</p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmDelete} className="w-full py-4 text-sm font-black text-white bg-red-600 hover:bg-red-700 rounded-xl uppercase tracking-widest shadow-lg transition-all hover:-translate-y-0.5">Destruir</button>
              <button onClick={() => setDeleteModal({ isOpen: false, userId: '' })} className="w-full py-4 text-sm font-black text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl uppercase tracking-widest transition-all">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {deleteCatalogModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm overflow-hidden p-8 text-center animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border-b-4 border-red-600 shadow-2xl">
            <div className="mx-auto w-20 h-20 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center mb-6 border border-red-100 dark:border-red-900/50">
              <AlertTriangle className="w-10 h-10 text-red-600 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-3">¿Borrar del Catálogo?</h2>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-8">Esta acción eliminará la serie de la base de datos global.</p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmDeleteCatalog} className="w-full py-4 text-sm font-black text-white bg-red-600 hover:bg-red-700 rounded-xl uppercase tracking-widest shadow-lg transition-all hover:-translate-y-0.5">Destruir</button>
              <button onClick={() => setDeleteCatalogModal({ isOpen: false, animeId: '' })} className="w-full py-4 text-sm font-black text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl uppercase tracking-widest transition-all">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {catalogModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-2 duration-300 border border-transparent dark:border-zinc-800">
            <div className="flex justify-between items-center p-6 border-b border-zinc-100 dark:border-zinc-800 bg-red-50 dark:bg-red-950/30">
              <h2 className="text-lg font-black text-red-950 dark:text-red-100 uppercase">{catalogModal.anime ? 'Editar Anime' : 'Nuevo Anime Global'}</h2>
              <button onClick={() => setCatalogModal({ isOpen: false, anime: null })}><X className="w-5 h-5 text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors" /></button>
            </div>
            <form onSubmit={handleSaveCatalog} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-red-800 dark:text-red-300 uppercase tracking-widest mb-2">Título Exacto</label>
                <input name="title" type="text" required defaultValue={catalogModal.anime?.title || ''} className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold focus:border-red-600 dark:focus:border-red-500 rounded-xl outline-none transition-colors" placeholder="Ej: Naruto Shippuden" />
              </div>
              <div>
                <label className="block text-xs font-black text-red-800 dark:text-red-300 uppercase tracking-widest mb-2">Género Primario</label>
                <select name="genre" defaultValue={catalogModal.anime?.genre || 'Shonen'} className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold focus:border-red-600 dark:focus:border-red-500 rounded-xl outline-none transition-colors cursor-pointer">
                  <option value="Shonen">Shonen</option><option value="Seinen">Seinen</option><option value="Shojo">Shojo</option><option value="Isekai">Isekai</option><option value="Slice of Life">Slice of Life</option>
                </select>
              </div>
              <button type="submit" className="w-full py-4 mt-2 text-sm font-black text-white bg-red-600 hover:bg-red-700 rounded-xl uppercase tracking-widest shadow-lg transition-all hover:-translate-y-0.5">Guardar en Bóveda</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}