import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { AuthContext } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.role, res.data.referenceID);
      if (res.data.role === 'Student') navigate('/student/dashboard');
      else if (res.data.role === 'Faculty') navigate('/faculty/attendance');
      else if (res.data.role === 'Finance') navigate('/finance/dashboard');
      else if (res.data.role === 'Admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5 py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="glass-card p-5">
            <div className="text-center mb-5">
              <h2 className="fw-bold mb-2" style={{ background: 'linear-gradient(135deg, #00a8cc, #8c52ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                HiSUP Portal
              </h2>
              <p className="text-secondary">Sign in to your academic account</p>
            </div>

            {error && (
              <div className="alert alert-danger border-0 text-white py-2 px-3 small" style={{ backgroundColor: 'rgba(255, 61, 0, 0.2)', borderLeft: '3px solid #ff3d00' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label text-secondary small fw-medium">Email Address</label>
                <input 
                  type="email"
                  className="form-control form-glass-control" 
                  placeholder="name@hitec.edu.pk"
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  disabled={loading}
                />
              </div>
              <div className="mb-4">
                <label className="form-label text-secondary small fw-medium">Password</label>
                <input 
                  type="password" 
                  className="form-control form-glass-control" 
                  placeholder="••••••••"
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  disabled={loading}
                />
              </div>

              <div className="d-grid mt-5">
                <button className="btn btn-glass py-3 fw-bold" type="submit" disabled={loading}>
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </div>
            </form>
            
            <div className="text-center mt-4 text-secondary small">
              Student portal login credentials: <br/>
              <code className="text-info">student1@hitec.edu.pk</code> / <code className="text-info">password</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
