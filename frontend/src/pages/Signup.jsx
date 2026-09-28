import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FiMail, FiLock, FiUser, FiUserPlus } from 'react-icons/fi';

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
  padding: 40px 20px;
`;

const SignupCard = styled.div`
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

const LoginLink = styled.p`
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

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/users/signup', { username, email, password });
      navigate('/login');
    } catch (err) {
      if (err.response) {
        switch (err.response.status) {
          case 400: setError('Please fill in all required fields'); break;
          case 409: setError('Username or email already exists'); break;
          case 500: setError('Server error - please try again later'); break;
          default: setError('Signup failed - please check your details');
        }
      } else {
        setError('Network error - please check your connection');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <SignupCard>
        <HeaderSection>
          <h2>Create Account</h2>
          <p>Join us today to unlock all courses.</p>
        </HeaderSection>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <InputGroup>
            <InputIcon><FiUser /></InputIcon>
            <Input 
              type="text" 
              placeholder="Username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              disabled={loading}
            />
          </InputGroup>
          
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
              placeholder="Create a password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              disabled={loading}
            />
          </InputGroup>
          
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating account...' : (
              <>
                Sign Up <FiUserPlus />
              </>
            )}
          </Button>
        </Form>
        
        <LoginLink>
          Already have an account? <Link to="/login">Login here</Link>
        </LoginLink>
      </SignupCard>
    </PageContainer>
  );
};

export default Signup;