import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabaseClient';
import { Shield, Trash2, Users, Edit, X, AlertTriangle, Loader2 } from 'lucide-react';

export default function AdminPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: '' });
  const [editModal, setEditModal] = useState({ isOpen: false, user: { id: '', name: '', role: '' } });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setUsers(data);
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
        
        <div className="mb-10">
          <h1 className="text-4xl font-black text-white tracking-tight uppercase flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-500" /> Directorio Global
          </h1>
        </div>

        <div className="bg-red-50 rounded-xl shadow-2xl overflow-hidden border-2 border-red-100">
          <div className="p-6 border-b-2 border-red-100 bg-white flex justify-between items-center">
            <h2 className="text-lg font-black text-red-950 uppercase tracking-widest flex items-center gap-2">
              <Users className="w-5 h-5 text-red-600" /> Usuarios Registrados
            </h2>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-10 h-10 text-red-500 animate-spin" /></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-red-800 text-xs uppercase tracking-widest font-black border-b-2 border-red-100">
                  <th className="px-6 py-5">Identidad</th>
                  <th className="px-6 py-5">Rol</th>
                  <th className="px-6 py-5 text-right">Gestión</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-red-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-red-50/50 transition-colors">
                    <td className="px-6 py-4 flex flex-col">
                      <span className="font-black text-lg text-red-950">{user.username || 'Sin Nombre'}</span>
                      <span className="text-xs text-red-400 uppercase font-bold">{user.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase ${user.role === 'admin' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button onClick={() => setEditModal({ isOpen: true, user: { id: user.id, name: user.username, role: user.role } })} className="p-2 text-zinc-400 hover:text-zinc-900"><Edit className="w-5 h-5" /></button>
                      <button onClick={() => setDeleteModal({ isOpen: true, userId: user.id })} className="p-2 text-red-400 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* --- MODAL DE EDICIÓN --- */}
      {editModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b-2 border-zinc-100">
              <h2 className="text-lg font-black text-zinc-900 uppercase">Editar Rol</h2>
              <button onClick={() => setEditModal({ isOpen: false, user: { id: '', name: '', role: '' } })}><X className="w-5 h-5 text-zinc-400" /></button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6">
              <select value={editModal.user.role} onChange={(e) => setEditModal({ ...editModal, user: { ...editModal.user, role: e.target.value } })} className="w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-200 text-zinc-900 font-bold focus:border-red-600 rounded-lg mb-6">
                <option value="client">Cliente</option>
                <option value="admin">Administrador</option>
              </select>
              <div className="flex justify-end gap-3">
                <button type="submit" className="px-5 py-2.5 text-sm font-black text-white bg-zinc-900 hover:bg-black rounded-lg uppercase">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DE ELIMINACIÓN --- */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-red-50 rounded-xl w-full max-w-sm overflow-hidden border-2 border-red-100 p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-black text-red-950 uppercase mb-2">¿Purgar Usuario?</h2>
            <div className="flex justify-center gap-3 mt-6">
              <button onClick={() => setDeleteModal({ isOpen: false, userId: '' })} className="w-full px-5 py-3 text-sm font-black text-red-900 bg-white border-2 border-red-200 rounded-lg uppercase">Cancelar</button>
              <button onClick={confirmDelete} className="w-full px-5 py-3 text-sm font-black text-white bg-red-600 hover:bg-red-700 rounded-lg uppercase">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}