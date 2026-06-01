// src/components/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Btn } from '../ui';
import loginBg from '../../assets/login-bg.png'
import './Login.css'

export default function Login() {
 const [email, setEmail] = useState('giovanni@gmail.com');
const [senha, setSenha] = useState('123456');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, senha);
      toast.success('Bem-vindo ao FrotaPRO!');
      navigate('/dashboard');
   } catch {
  toast.error('E-mail ou senha inválidos');
} finally {
      setLoading(false);
    }
  }

 return (
  <div className="login-page">

    <img
      src={loginBg}
      alt="login"
      className="login-bg"
    />

    <form className="login-form" onSubmit={handleSubmit}>

      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        required
      />

      <Btn type="submit" loading={loading}>
        Entrar
      </Btn>

    </form>

  </div>
);
}