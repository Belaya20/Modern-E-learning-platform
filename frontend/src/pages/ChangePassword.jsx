import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';
import { FiLock, FiCheckCircle } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

const FormCard = styled.div`
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
    line-height: 1.5;
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

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login } = useContext(AuthContext); // Re-trigger auth state if needed, though user should be logged in
  const navigate = useNavigate();

  useEffect(() => {
    // Basic protection: if not logged in, boot to login
    if (!localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:5000/api/users/change-password', 
        { newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(res.data.message || 'Password changed successfully!');
      
      // Update local storage / context user state to remove the flag so it doesn't trigger again
      if (user) {
         const updatedUser = { ...user, requires_password_change: false };
         login(token, updatedUser); // Assuming login updates the context
         
         // Redirect after a short delay so they see the toast
         setTimeout(() => {
           if (updatedUser.role === 'admin') {
             navigate('/admin');
           } else {
             navigate('/dashboard');
           }
         }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <FormCard>
        <HeaderSection>
          <h2>Action Required</h2>
          <p>For your security, you must update your default password before accessing your account.</p>
        </HeaderSection>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <InputGroup>
            <InputIcon><FiLock /></InputIcon>
            <Input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
            />
          </InputGroup>

          <InputGroup>
            <InputIcon><FiLock /></InputIcon>
            <Input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </InputGroup>

          <Button type="submit" disabled={loading}>
            {loading ? 'Updating Password...' : (
              <>
                Update Password <FiCheckCircle />
              </>
            )}
          </Button>
        </Form>
      </FormCard>
      <ToastContainer />
    </PageContainer>
  );
};

export default ChangePassword;
