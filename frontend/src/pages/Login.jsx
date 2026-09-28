import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';

// ----------------- STYLED COMPONENTS -----------------

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageContainer = styled.div`
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f4f7fe 0%, #e2e8f0 100%);
  padding: 20px;
`;

const LoginCard = styled.div`
  background: #ffffff;
  width: 100%;
  max-width: 450px;
  padding: 50px 40px;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  animation: ${fadeIn} 0.6s ease-out;
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 40px;

  h2 {
    font-size: 2rem;
    color: #1e293b;
    font-weight: 800;
    margin-bottom: 10px;
  }

  p {
    color: #64748b;
    font-size: 0.95rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 16px;
  color: #94a3b8;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 20px 14px 48px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  background: #f8fafc;
  color: #1e293b;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    background: #ffffff;
    border-color: #4318FF;
    box-shadow: 0 0 0 4px rgba(67, 24, 255, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const Button = styled.button`
  margin-top: 10px;
  padding: 15px;
  background: linear-gradient(135deg, #4318FF 0%, #868CFF 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(67, 24, 255, 0.2);

  &:hover:not(:disabled) { 
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(67, 24, 255, 0.3);
  }
  
  &:disabled { 
    background: #cbd5e1;
    box-shadow: none;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  background: #fee2e2;
  color: #ef4444;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
  font-weight: 500;
`;

const SignupLink = styled.p`
  text-align: center;
  font-size: 0.95rem;
  color: #64748b;
  margin-top: 25px;

  a { 
    color: #4318FF; 
    font-weight: 600;
    text-decoration: none; 
    transition: color 0.2s ease;
  }
  
  a:hover { 
    color: #2b3674;
    text-decoration: underline; 
  }
`;

// ----------------- COMPONENT -----------------

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/users/login', { email, password });
      login(res.data.token, res.data.user);
      
      // Check if user requires a forced password change
      if (res.data.user.requires_password_change) {
        navigate('/change-password');
      } else {
        // Normal routing
        if (res.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <LoginCard>
        <HeaderSection>
          <h2>Welcome Back</h2>
          <p>Please enter your details to sign in.</p>
        </HeaderSection>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <InputGroup>
            <InputIcon><FiMail /></InputIcon>
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </InputGroup>

          <InputGroup>
            <InputIcon><FiLock /></InputIcon>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </InputGroup>

          <Button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : (
              <>
                Sign In <FiLogIn />
              </>
            )}
          </Button>
        </Form>

        <SignupLink>
          Don’t have an account? <Link to="/signup">Sign up here</Link>
        </SignupLink>
      </LoginCard>
    </PageContainer>
  );
};

export default Login;