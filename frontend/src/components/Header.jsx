import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';
import { FiSearch, FiShoppingCart, FiLogOut, FiUser, FiMenu, FiX, FiLayers, FiCheck } from 'react-icons/fi';

// ----------------- STYLED COMPONENTS -----------------

const glassmorphism = `
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 4rem;
  ${glassmorphism}
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  @media (max-width: 1024px) {
    padding: 0.8rem 2rem;
  }
  @media (max-width: 768px) {
    padding: 0.8rem 1.5rem;
  }
`;

const NavLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 40px;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: 800;
  color: #2b3674;
  letter-spacing: -0.5px;
  
  span {
    color: #4318FF;
  }
  
  &:hover {
    transform: scale(1.02);
  }
  transition: transform 0.2s;
`;

const DesktopLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 25px;

  @media (max-width: 968px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: #64748b;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s ease;
  padding: 8px 12px;
  border-radius: 8px;

  &:hover { 
    color: #4318FF; 
    background: rgba(67, 24, 255, 0.05);
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 500px;
  margin: 0 40px;

  @media (max-width: 968px) {
    display: none;
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 16px;
  color: #a0aec0;
  font-size: 1.2rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 20px 12px 45px;
  border: 1px solid #e2e8f0;
  border-radius: 30px;
  font-size: 0.95rem;
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

const Suggestions = styled.ul`
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  right: 0;
  background: #ffffff;
  border-radius: 12px;
  list-style: none;
  padding: 8px 0;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1001;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid #f1f5f9;
`;

const SuggestionItem = styled.li`
  padding: 12px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #334155;
  font-size: 0.95rem;
  transition: background 0.2s ease;

  &:hover { 
    background: #f8fafc; 
    color: #4318FF; 
  }
`;

const SuggestionType = styled.span`
  font-size: 0.75rem;
  background: #e2e8f0;
  color: #64748b;
  padding: 2px 8px;
  border-radius: 12px;
  text-transform: capitalize;
  margin-left: auto;
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const IconButton = styled(Link)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  color: #64748b;
  background: #f8fafc;
  transition: all 0.2s ease;
  text-decoration: none;
  font-size: 1.2rem;

  &:hover {
    color: #4318FF;
    background: #eff0ff;
    transform: translateY(-2px);
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 0px;
  right: -2px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 11px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
`;

const ProfileContainer = styled.div`
  position: relative;
`;

const AvatarWrapper = styled.div`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  padding: 2px;
  background: linear-gradient(135deg, #4318FF, #868CFF);
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const Avatar = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ffffff;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 15px);
  right: 0;
  width: 280px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 20px;
  z-index: 1001;
  border: 1px solid #f1f5f9;
  opacity: 1;
  animation: ${keyframes`from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)}`} 0.2s ease;
`;

const DropdownHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 15px;
`;

const DropdownInfo = styled.div`
  display: flex;
  flex-direction: column;
  
  h4 { margin: 0; color: #1e293b; font-size: 1rem; }
  p { margin: 0; color: #64748b; font-size: 0.85rem; }
`;

const DropdownAction = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  border: none;
  background: none;
  color: ${props => props.$danger ? '#ef4444' : '#475569'};
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$danger ? '#fef2f2' : '#f8fafc'};
    color: ${props => props.$danger ? '#dc2626' : '#4318FF'};
  }
`;

const ActionButton = styled(Link)`
  padding: 10px 24px;
  background: linear-gradient(135deg, #4318FF 0%, #868CFF 100%);
  color: white;
  border-radius: 30px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(67, 24, 255, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(67, 24, 255, 0.3);
  }
`;

const MobileMenuToggle = styled.button`
  display: none;
  background: none;
  border: none;
  color: #1e293b;
  font-size: 1.8rem;
  cursor: pointer;

  @media (max-width: 968px) {
    display: block;
  }
`;

const MobileMenu = styled.div`
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: #ffffff;
  padding: 20px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  border-top: 1px solid #e2e8f0;
  flex-direction: column;
  gap: 15px;

  @media (max-width: 968px) {
    display: ${props => props.$isOpen ? 'flex' : 'none'};
  }
`;

// ----------------- COMPONENT -----------------

const Header = () => {
  const { user, logout, updateProfileImage } = useContext(AuthContext);
  const { cart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [newImage, setNewImage] = useState(null);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const defaultAvatar = 'https://via.placeholder.com/150';

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/courses');
        setCourses(res.data);
      } catch (err) {
        setError('Failed to load courses.');
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSuggestions([]);
      return;
    }
    const queryLower = searchQuery.toLowerCase();
    const titleMatches = courses
      .filter(course => course.title.toLowerCase().includes(queryLower))
      .map(course => ({ type: 'title', value: course.title, id: course.id }));
    const categoryMatches = [...new Set(courses
      .filter(course => course.category.toLowerCase().includes(queryLower))
      .map(course => course.category))]
      .map(category => ({ type: 'category', value: category }));
    
    setSuggestions([...titleMatches, ...categoryMatches].slice(0, 5));
  }, [searchQuery, courses]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setShowDropdown(false);
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}&type=any`);
      setSearchQuery('');
      setSuggestions([]);
      setMenuOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery('');
    navigate(`/?search=${encodeURIComponent(suggestion.value)}&type=${suggestion.type}`);
    setSuggestions([]);
    setMenuOpen(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setNewImage(file);
  };

  const handleSaveImage = async () => {
    if (!newImage) return;
    const formData = new FormData();
    formData.append('profileImage', newImage);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:5000/api/users/profile', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      updateProfileImage(res.data.user.profile_image);
      setNewImage(null);
      setShowUpload(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile image');
    }
  };

  return (
    <Nav>
      <NavLeft>
        <Logo to="/">
          <FiLayers size={28} color="#4318FF" /> E-<span>Learning</span>
        </Logo>

        <DesktopLinks>
          <NavLink to="/dashboard">Dashboard</NavLink>
          {user?.role === 'admin' && <NavLink to="/admin">Admin Hub</NavLink>}
        </DesktopLinks>
      </NavLeft>

      <SearchContainer>
        <form onSubmit={handleSearch}>
          <SearchWrapper>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder="Search for courses, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchWrapper>
        </form>
        {suggestions.length > 0 && (
          <Suggestions>
            {suggestions.map((suggestion, index) => (
              <SuggestionItem 
                key={index} 
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <FiSearch color="#94a3b8" />
                {suggestion.value}
                <SuggestionType>{suggestion.type}</SuggestionType>
              </SuggestionItem>
            ))}
          </Suggestions>
        )}
      </SearchContainer>

      <NavRight>
        {user ? (
          <>
            <IconButton to="/cart" aria-label="Cart">
              <FiShoppingCart />
              {cart.length > 0 && <Badge>{cart.length}</Badge>}
            </IconButton>

            <ProfileContainer>
              <AvatarWrapper onClick={() => setShowDropdown(!showDropdown)}>
                <Avatar src={user.profile_image || defaultAvatar} alt="Profile" />
              </AvatarWrapper>

              {showDropdown && (
                <DropdownMenu>
                  <DropdownHeader>
                    <Avatar src={user.profile_image || defaultAvatar} style={{ width: '50px', height: '50px' }} />
                    <DropdownInfo>
                      <h4>{user.username}</h4>
                      <p>{user.email}</p>
                    </DropdownInfo>
                  </DropdownHeader>

                  {!showUpload ? (
                    <>
                      <DropdownAction onClick={() => setShowUpload(true)}>
                        <FiUser /> Change Profile Picture
                      </DropdownAction>
                      {user.role === 'admin' && (
                        <DropdownAction as={Link} to="/admin" style={{ textDecoration: 'none' }}>
                          <FiLayers /> Admin Settings
                        </DropdownAction>
                      )}
                      <DropdownAction $danger onClick={handleLogout}>
                        <FiLogOut /> Logout
                      </DropdownAction>
                    </>
                  ) : (
                    <div style={{ padding: '10px 0' }}>
                      <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#64748b' }}>Select new picture:</p>
                      <input type="file" accept="image/*" onChange={handleImageChange} style={{ fontSize: '0.85rem', marginBottom: '15px' }} />
                      
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <ActionButton as="button" onClick={handleSaveImage} style={{ padding: '8px 15px', border: 'none', cursor: 'pointer', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                          <FiCheck /> Save
                        </ActionButton>
                        <button 
                          onClick={() => { setShowUpload(false); setNewImage(null); }}
                          style={{ padding: '8px 15px', border: '1px solid #e2e8f0', background: 'transparent', borderRadius: '30px', cursor: 'pointer', color: '#64748b', flex: 1 }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </DropdownMenu>
              )}
            </ProfileContainer>
          </>
        ) : (
          <DesktopLinks style={{ display: 'flex' }}>
            <NavLink to="/login" style={{ color: '#1e293b' }}>Sign In</NavLink>
            <ActionButton to="/login">Get Started</ActionButton>
          </DesktopLinks>
        )}

        <MobileMenuToggle onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX /> : <FiMenu />}
        </MobileMenuToggle>
      </NavRight>

      <MobileMenu $isOpen={menuOpen}>
        <form onSubmit={handleSearch} style={{ position: 'relative' }}>
          <SearchWrapper>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchWrapper>
          {suggestions.length > 0 && (
            <Suggestions style={{ position: 'relative', top: '5px', boxShadow: 'none', border: 'none', background: '#f8fafc' }}>
              {suggestions.map((suggestion, index) => (
                <SuggestionItem key={index} onClick={() => handleSuggestionClick(suggestion)}>
                  <FiSearch color="#94a3b8" /> {suggestion.value}
                </SuggestionItem>
              ))}
            </Suggestions>
          )}
        </form>
        
        <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
        {user?.role === 'admin' && <NavLink to="/admin" onClick={() => setMenuOpen(false)}>Admin Hub</NavLink>}
        {user ? (
          <DropdownAction $danger onClick={handleLogout} style={{ paddingLeft: '12px' }}>
            <FiLogOut /> Logout
          </DropdownAction>
        ) : (
          <>
            <NavLink to="/login" onClick={() => setMenuOpen(false)}>Sign In</NavLink>
          </>
        )}
      </MobileMenu>
    </Nav>
  );
};

export default Header;