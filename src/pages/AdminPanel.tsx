import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabaseClient';
import { 
  Shield, Trash2, Users, Edit, X, AlertTriangle, Loader2, 
  Eye, Calendar, Hash, Activity, Server, Database, Settings, ShieldAlert 
} from 'lucide-react';

export default function AdminPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'stats' | 'settings'>('users');
  
  // Estados para métricas y roles reales
  const [catalogCount, setCatalogCount] = useState(0);
  const [currentUserRole, setCurrentUserRole] = useState('admin');
  
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: '' });
  const [editModal, setEditModal] = useState({ isOpen: false, user: { id: '', name: '', role: '' } });
  const [detailsModal, setDetailsModal] = useState({ isOpen: false, user: null as any });

  useEffect(() => {
    fetchUsersAndStats();
  }, []);

  const fetchUsersAndStats = async () => {
    setIsLoading(true);
    
    // Obtener rol del usuario actual
    const { data: authData } = await supabase.auth.getUser();
    
    // Obtener todos los usuarios
    const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (profiles) {
      setUsers(profiles);
      const myProfile = profiles.find(u => u.id === authData.user?.id);
      if (myProfile) setCurrentUserRole(myProfile.role);
    }

    // Obtener métrica real del catálogo
    const { count } = await supabase.from('catalog').select('*', { count: 'exact', head: true });
    if (count !== null) setCatalogCount(count);

    setIsLoading(false);
  };

  const confirmDelete = async () => {
    await supabase.from('profiles').delete().eq('id', deleteModal.userId);
    setUsers(users.filter(u => u.id !== deleteModal.userId));
    setDeleteModal({ isOpen: false, userId: '' });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('profiles').update({ role: editModal.user.role }).eq('id', editModal.user.id);
    setUsers(users.map(u => u.id === editModal.user.id ? { ...u, role: editModal.user.role } : u));
    setEditModal({ isOpen: false, user: { id: '', name: '', role: '' } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 to-[#2a0808] font-sans pb-20">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white tracking-tight uppercase flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-500" /> Control Global
          </h1>
        </div>

        <div className="flex gap-2 sm:gap-6 border-b-2 border-red-900/50 mb-8 overflow-x-auto">
          <button onClick={() => setActiveTab('users')} className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'users' ? 'text-red-500 border-b-2 border-red-500' : 'text-red-200/50 hover:text-red-200'}`}>
            <Users className="w-4 h-4" /> Directorio
          </button>
          <button onClick={() => setActiveTab('stats')} className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'stats' ? 'text-red-500 border-b-2 border-red-500' : 'text-red-200/50 hover:text-red-200'}`}>
            <Activity className="w-4 h-4" /> Métricas
          </button>
          <button onClick={() => setActiveTab('settings')} className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'settings' ? 'text-red-500 border-b-2 border-red-500' : 'text-red-200/50 hover:text-red-200'}`}>
            <Settings className="w-4 h-4" /> Ajustes
          </button>
        </div>

        {/* PESTAÑA: USUARIOS */}
        {activeTab === 'users' && (
          <div className="bg-red-50 rounded-xl shadow-2xl overflow-hidden border-2 border-red-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 border-b-2 border-red-100 bg-white flex justify-between items-center">
              <h2 className="text-lg font-black text-red-950 uppercase tracking-widest flex items-center gap-2">
                <Users className="w-5 h-5 text-red-600" /> Miembros
              </h2>
              <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Total: {users.length}
              </span>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-10 h-10 text-red-500 animate-spin" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white text-red-800 text-xs uppercase tracking-widest font-black border-b-2 border-red-100">
                      <th className="px-6 py-5">Identidad</th>
                      <th className="px-6 py-5">Rango</th>
                      <th className="px-6 py-5 text-right">Administración</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-red-100">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-red-50/50 transition-colors">
                        <td className="px-6 py-4 flex flex-col">
                          <span className="font-black text-lg text-red-950">{user.username || 'Usuario Anónimo'}</span>
                          <span className="text-xs text-red-400 uppercase font-bold">{user.email}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                            user.role === 'superadmin' ? 'bg-red-950 text-white shadow-sm' : 
                            user.role === 'admin' ? 'bg-red-600 text-white shadow-sm' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setDetailsModal({ isOpen: true, user })} className="p-2 text-indigo-500 hover:text-white hover:bg-indigo-500 bg-white border border-indigo-100 rounded-md transition-colors" title="Ficha Completa">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditModal({ isOpen: true, user: { id: user.id, name: user.username, role: user.role } })} className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 bg-white border border-zinc-200 rounded-md transition-colors" title="Gestionar Rol">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteModal({ isOpen: true, userId: user.id })} className="p-2 text-red-500 hover:text-white hover:bg-red-600 bg-white border border-red-200 rounded-md transition-colors" title="Purgar">
                              <Trash2 className="w-4 h-4" />
                            </button>
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

        {/* PESTAÑA: MÉTRICAS (100% REALES AHORA) */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-xl border-l-8 border-indigo-500 shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Base de Datos</p>
                  <h3 className="text-4xl font-black text-zinc-900 mt-1">{catalogCount}</h3>
                </div>
                <Database className="text-indigo-100 w-10 h-10" />
              </div>
              <p className="text-sm font-bold text-indigo-600 bg-indigo-50 inline-block px-3 py-1 rounded-md">Animes en catálogo</p>
            </div>

            <div className="bg-white p-6 rounded-xl border-l-8 border-red-500 shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Cuentas Creadas</p>
                  <h3 className="text-4xl font-black text-zinc-900 mt-1">{users.length}</h3>
                </div>
                <Users className="text-red-100 w-10 h-10" />
              </div>
              <p className="text-sm font-bold text-red-600 bg-red-50 inline-block px-3 py-1 rounded-md">Usuarios registrados</p>
            </div>

            <div className="bg-white p-6 rounded-xl border-l-8 border-emerald-500 shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Último Ingreso</p>
                  <h3 className="text-xl font-black text-zinc-900 mt-2">
                    {users.length > 0 ? new Date(users[0].created_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </h3>
                </div>
                <Calendar className="text-emerald-100 w-10 h-10" />
              </div>
              <p className="text-sm font-bold text-emerald-600 bg-emerald-50 inline-block px-3 py-1 rounded-md">Fecha de registro</p>
            </div>
          </div>
        )}

        {/* PESTAÑA: AJUSTES */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-red-100 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 border-b-2 border-red-100 bg-red-50 flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-red-600" />
              <h2 className="text-lg font-black text-red-950 uppercase tracking-widest">Seguridad del Sistema</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
                <div>
                  <p className="font-bold text-zinc-900">Modo Mantenimiento</p>
                  <p className="text-xs text-zinc-500 font-medium">Bloquea el acceso a clientes temporalmente.</p>
                </div>
                <div className={`w-12 h-6 rounded-full relative transition-colors ${currentUserRole === 'superadmin' ? 'bg-red-600 cursor-pointer shadow-lg' : 'bg-zinc-300 cursor-not-allowed opacity-50'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 ${currentUserRole === 'superadmin' ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>
              {currentUserRole === 'superadmin' ? (
                 <p className="text-xs font-bold text-emerald-600 text-center uppercase tracking-widest mt-4">Privilegios de SuperAdmin Activos</p>
              ) : (
                 <p className="text-xs font-bold text-red-500 text-center uppercase tracking-widest mt-4">Solo lectura. Requiere permisos SuperAdmin.</p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* --- MODALES --- */}
      {detailsModal.isOpen && detailsModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-in zoom-in-95">
            <div className="h-24 bg-gradient-to-r from-red-900 to-red-600 relative">
              <button onClick={() => setDetailsModal({ isOpen: false, user: null })} className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-1.5 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-8 pb-8">
              <div className="w-20 h-20 bg-zinc-900 border-4 border-white rounded-2xl flex items-center justify-center -mt-10 mb-4 shadow-lg">
                <span className="text-3xl font-black text-white uppercase">{detailsModal.user.username ? detailsModal.user.username.charAt(0) : '?'}</span>
              </div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black text-zinc-900">{detailsModal.user.username || 'Usuario Anónimo'}</h2>
                  <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider">{detailsModal.user.email}</p>
                </div>
                <span className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border-2 ${
                  detailsModal.user.role === 'superadmin' ? 'bg-red-950 text-white border-red-950' : 
                  detailsModal.user.role === 'admin' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-zinc-50 text-zinc-600 border-zinc-200'
                }`}>
                  {detailsModal.user.role}
                </span>
              </div>
              <div className="space-y-3">
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 flex items-center gap-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-zinc-100"><Calendar className="w-5 h-5 text-red-500" /></div>
                  <div>
                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Miembro desde</p>
                    <p className="font-bold text-zinc-900 text-sm">{new Date(detailsModal.user.created_at || new Date()).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 flex items-center gap-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-zinc-100"><Hash className="w-5 h-5 text-indigo-500" /></div>
                  <div className="w-full overflow-hidden">
                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Identificador Único</p>
                    <p className="font-mono font-bold text-zinc-700 text-xs truncate bg-zinc-200/50 px-2 py-1 rounded mt-1">{detailsModal.user.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
            <div className="flex justify-between items-center p-6 border-b border-zinc-100">
              <h2 className="text-lg font-black text-zinc-900 uppercase">Privilegios</h2>
              <button onClick={() => setEditModal({ isOpen: false, user: { id: '', name: '', role: '' } })}><X className="w-5 h-5 text-zinc-400 hover:text-zinc-900" /></button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6">
              <p className="text-sm text-zinc-500 font-medium mb-4">Modificando nivel de acceso para <span className="font-bold text-zinc-900">{editModal.user.name}</span>.</p>
              <select value={editModal.user.role} onChange={(e) => setEditModal({ ...editModal, user: { ...editModal.user, role: e.target.value } })} className="w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-200 text-zinc-900 font-bold focus:border-red-600 rounded-xl mb-6 outline-none transition-colors cursor-pointer">
                <option value="client">Cliente</option>
                <option value="admin">Administrador</option>
                {currentUserRole === 'superadmin' && <option value="superadmin">Super Administrador</option>}
              </select>
              <button type="submit" className="w-full py-4 text-sm font-black text-white bg-zinc-900 hover:bg-black rounded-xl uppercase tracking-widest shadow-lg transition-colors">Actualizar Permisos</button>
            </form>
          </div>
        </div>
      )}

      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden p-8 text-center animate-in zoom-in-95 border-b-4 border-red-600">
            <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight mb-3">¿Purgar Cuenta?</h2>
            <p className="text-sm font-medium text-zinc-500 mb-8">Esta acción destruirá todos los datos asociados a este usuario de forma permanente.</p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmDelete} className="w-full py-4 text-sm font-black text-white bg-red-600 hover:bg-red-700 rounded-xl uppercase tracking-widest shadow-lg shadow-red-600/30 transition-all">Destruir</button>
              <button onClick={() => setDeleteModal({ isOpen: false, userId: '' })} className="w-full py-4 text-sm font-black text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-xl uppercase tracking-widest transition-all">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}