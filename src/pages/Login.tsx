import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [emailError, setEmailError] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value.length > 0 && !value.includes('@')) {
      setEmailError('El correo electrónico debe incluir un @');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailError) return;
    setIsLoading(true);
    setAuthError('');

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setAuthError('Correo o contraseña incorrectos.');
        } else {
          setAuthError('Error al iniciar sesión. Inténtalo de nuevo.');
        }
        setIsLoading(false);
      } else {
        navigate('/dashboard');
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username: username }
        }
      });
      if (error) {
        setAuthError(error.message);
        setIsLoading(false);
      } else {
        alert('Registro completado. ¡Inicia sesión!');
        setIsLogin(true);
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 to-[#2a0808] flex flex-col items-center justify-center px-4 sm:px-6 relative font-sans">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

      <div 
        onClick={() => navigate('/')} 
        className="flex items-center gap-2 text-3xl font-black tracking-tighter text-white mb-8 cursor-pointer hover:scale-105 transition-transform relative z-10"
      >
        <Play className="w-8 h-7 text-red-500 fill-current" />
        <span>ARISE<span className="text-red-500">FLV</span></span>
      </div>

      <div className="w-full max-w-md bg-red-50 p-8 sm:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative z-10 rounded-xl">
        <h1 className="text-3xl font-black text-red-950 mb-8 text-center tracking-tight uppercase">
          {isLogin ? 'INICIA SESIÓN' : 'CREA TU CUENTA'}
        </h1>

        {authError && (
          <div className="bg-red-200 text-red-800 p-3 rounded-lg text-xs font-bold mb-4 uppercase tracking-wide">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-xs font-black text-red-800 uppercase tracking-widest mb-2">Nombre</label>
              <input 
                type="text" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-red-200 text-red-950 font-medium focus:border-red-600 focus:bg-white focus:outline-none transition-all placeholder:text-red-300 rounded-lg shadow-sm" 
                placeholder="Tu alias"
              />
            </div>
          )}
          
          <div>
            <label className="block text-xs font-black text-red-800 uppercase tracking-widest mb-2">Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={handleEmailChange}
              className={`w-full px-4 py-3 bg-white border-2 text-red-950 font-medium focus:bg-white focus:outline-none transition-all placeholder:text-red-300 rounded-lg shadow-sm ${emailError ? 'border-red-500 focus:border-red-500' : 'border-red-200 focus:border-red-600'}`} 
              placeholder="correo@ejemplo.com"
            />
            {emailError && (
              <p className="text-xs text-red-600 font-bold mt-2 flex items-center gap-1">
                {emailError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-black text-red-800 uppercase tracking-widest mb-2">Contraseña</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-red-200 text-red-950 font-medium focus:border-red-600 focus:bg-white focus:outline-none transition-all placeholder:text-red-300 rounded-lg shadow-sm" 
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading || !!emailError}
            className="w-full h-14 mt-2 bg-red-600 text-white font-black text-lg uppercase tracking-widest hover:bg-red-700 transition-all rounded-lg shadow-md hover:shadow-lg flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isLogin ? 'Entrar' : 'Registrarse')}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t-2 border-red-100 text-center">
          <p className="text-sm font-bold text-red-800/70 mb-2">
            {isLogin ? '¿Aún no eres miembro?' : '¿Ya formas parte de la bóveda?'}
          </p>
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setEmailError('');
              setAuthError('');
            }}
            className="text-sm font-black text-red-900 hover:text-red-600 transition-colors uppercase tracking-widest"
          >
            {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}