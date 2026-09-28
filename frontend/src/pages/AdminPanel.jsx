import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FiUsers, FiLayers, FiImage, FiBookOpen, FiTrash2, FiEdit, FiPlus, FiVideo, FiChevronLeft, FiChevronRight, FiMenu
} from 'react-icons/fi';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Layout Components
const DashboardLayout = styled.div`
  display: flex;
  min-height: calc(100vh - 80px);
  background-color: #f4f7fe;
  font-family: 'Inter', 'Roboto', sans-serif;
`;

const Sidebar = styled.div`
  width: ${props => props.$isOpen ? '280px' : '90px'};
  background: white;
  padding: 30px ${props => props.$isOpen ? '20px' : '10px'};
  box-shadow: 4px 0 25px rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
  z-index: 10;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const SidebarHeader = styled.div`
  margin-bottom: 40px;
  padding: 0 10px;
  display: flex;
  justify-content: ${props => props.$isOpen ? 'space-between' : 'center'};
  align-items: center;
  
  .header-content {
    display: ${props => props.$isOpen ? 'block' : 'none'};
  }
  
  h2 { font-size: 1.5rem; color: #2b3674; font-weight: 700; margin: 0; white-space: nowrap; }
  p { color: #a3aed1; font-size: 0.9rem; margin-top: 5px; text-transform: capitalize; white-space: nowrap; }
`;

const CollapseButton = styled.button`
  background: #f4f7fe;
  border: none;
  color: #4318FF;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover { background: #e2e8f0; }
  svg { font-size: 1.2rem; margin: 0; }
`;

const SidebarItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${props => props.$isOpen ? 'flex-start' : 'center'};
  padding: 16px ${props => props.$isOpen ? '20px' : '0'};
  margin-bottom: 12px;
  border-radius: 12px;
  cursor: pointer;
  color: ${props => props.$active ? 'white' : '#a3aed1'};
  background: ${props => props.$active ? 'linear-gradient(135deg, #4318FF 0%, #868CFF 100%)' : 'transparent'};
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 1rem;

  &:hover {
    background: ${props => props.$active ? 'linear-gradient(135deg, #4318FF 0%, #868CFF 100%)' : '#f4f7fe'};
    color: ${props => props.$active ? 'white' : '#4318FF'};
    transform: ${props => props.$isOpen ? 'translateX(5px)' : 'scale(1.05)'};
  }
  
  .item-text {
    display: ${props => props.$isOpen ? 'block' : 'none'};
    white-space: nowrap;
  }

  svg { 
    margin-right: ${props => props.$isOpen ? '15px' : '0'}; 
    font-size: 1.3rem; 
  }
`;

const MainContent = styled.div`
  flex: 1;
  padding: 40px;
  overflow-y: auto;
`;

const ContentHeader = styled.div`
  margin-bottom: 30px;
  h1 { font-size: 2.2rem; color: #2b3674; font-weight: 700; margin: 0; }
`;

const Card = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.02);
  margin-bottom: 30px;
  animation: ${fadeIn} 0.5s ease-out;
`;

const CardTitle = styled.h3`
  font-size: 1.3rem;
  color: #2b3674;
  margin-top: 0;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Form = styled.form` display: flex; flex-direction: column; gap: 20px; `;
const InputGroup = styled.div` display: flex; flex-direction: column; gap: 8px; `;
const Label = styled.label` font-size: 0.9rem; font-weight: 600; color: #a3aed1; `;
const Input = styled.input`
  padding: 14px 18px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 1rem; background-color: #f8fafc; transition: all 0.2s ease;
  &:focus { outline: none; border-color: #4318FF; background-color: #fff; box-shadow: 0 0 0 3px rgba(67, 24, 255, 0.1); }
`;
const Select = styled.select`
  padding: 14px 18px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 1rem; background-color: #f8fafc; transition: all 0.2s ease;
  &:focus { outline: none; border-color: #4318FF; background-color: #fff; box-shadow: 0 0 0 3px rgba(67, 24, 255, 0.1); }
`;
const Textarea = styled.textarea`
  padding: 14px 18px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 1rem; background-color: #f8fafc; min-height: 100px; resize: vertical; transition: all 0.2s ease;
  &:focus { outline: none; border-color: #4318FF; background-color: #fff; box-shadow: 0 0 0 3px rgba(67, 24, 255, 0.1); }
`;

const Button = styled.button`
  padding: 14px 24px;
  background: ${props => props.variant === 'outline' ? 'transparent' : props.variant === 'danger' ? '#EE5D50' : props.variant === 'secondary' ? '#6c757d' : 'linear-gradient(135deg, #4318FF 0%, #868CFF 100%)'};
  color: ${props => props.variant === 'outline' ? '#4318FF' : 'white'};
  border: ${props => props.variant === 'outline' ? '2px solid #4318FF' : 'none'};
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${props => props.variant === 'outline' ? 'none' : props.variant === 'danger' ? '0 8px 15px rgba(238, 93, 80, 0.25)' : props.variant === 'secondary' ? '0 8px 15px rgba(108, 117, 125, 0.25)' : '0 8px 15px rgba(67, 24, 255, 0.25)'};
    background: ${props => props.variant === 'outline' ? 'rgba(67, 24, 255, 0.05)' : ''};
  }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const List = styled.div` display: flex; flex-direction: column; gap: 15px; `;
const ListItem = styled.div`
  display: flex; justify-content: space-between; align-items: center; padding: 20px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; transition: all 0.2s;
  &:hover { border-color: #868CFF; box-shadow: 0 4px 12px rgba(67, 24, 255, 0.05); }
`;
const ItemDetails = styled.div` display: flex; flex-direction: column; gap: 5px; `;
const ItemTitle = styled.h4` margin: 0; font-size: 1.1rem; color: #2b3674; `;
const ItemSubtitle = styled.span` font-size: 0.9rem; color: #a3aed1; `;
const ActionButtons = styled.div` display: flex; gap: 10px; `;

const Table = styled.table` width: 100%; border-collapse: collapse; `;
const Thead = styled.thead` background: #f8fafc; `;
const Tbody = styled.tbody` `;
const Tr = styled.tr` 
  border-bottom: 1px solid #e2e8f0; 
  transition: all 0.2s;
  &:hover { background: #f8fafc; }
`;
const Th = styled.th` padding: 15px; text-align: left; font-size: 0.9rem; color: #a3aed1; font-weight: 600; text-transform: uppercase; `;
const Td = styled.td` padding: 15px; font-size: 0.95rem; color: #2b3674; vertical-align: middle; `;

const QuestionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  margin-bottom: 20px;
`;

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [carouselImages, setCarouselImages] = useState([]);
  
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'student' });
  const [editUser, setEditUser] = useState(null);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', instructorId: '', thumbnail: null, thumbnailUrl: '', category: '' });
  const [editCourse, setEditCourse] = useState(null);
  
  const [newCarouselImage, setNewCarouselImage] = useState(null);
  const [editCarouselImage, setEditCarouselImage] = useState(null);
  
  const [newVideo, setNewVideo] = useState({ courseId: '', title: '', externalVideoUrl: '' });
  const [videoFile, setVideoFile] = useState(null);
  const [videoUploadType, setVideoUploadType] = useState('file'); // 'file' or 'url'
  
  const [newAssessment, setNewAssessment] = useState({ 
    courseId: '', 
    title: '', 
    questions: [{ question_text: '', correct_answer: '', type: 'short-answer', choices: [] }] 
  });
  
  const [loading, setLoading] = useState(false);

  const categories = [
    'Grade Four Tutorial', 'Grade Five Tutorial', 'Grade Six Tutorial', 
    'Grade Seven Tutorial', 'Grade Eight Tutorial', 'Grade Nine Tutorial', 
    'Grade Ten Tutorial', 'Grade Eleven Tutorial', 'Grade Twelve Tutorial', 
    'Web Development', 'App Development'
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
  
      const [userRes, courseRes, carouselRes] = await Promise.all([
        axios.get('http://localhost:5000/api/users', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/courses', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/carousel')
      ]);
      setUsers(userRes.data);
      setCourses(courseRes.data);
      setCarouselImages(carouselRes.data.slice(0, 6));
    } catch (err) {
      toast.error(err.response?.status === 404 ? 'API endpoint not found' : err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Handlers ---
  const handleAddUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/users/register', newUser, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('User added successfully');
      setNewUser({ username: '', email: '', password: '', role: 'student' });
      setShowAddUserForm(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', newCourse.title);
      formData.append('description', newCourse.description);
      formData.append('instructorId', newCourse.instructorId);
      formData.append('category', newCourse.category);
      if (newCourse.thumbnailUrl) {
        formData.append('thumbnail_url', newCourse.thumbnailUrl);
      } else if (newCourse.thumbnail) {
        formData.append('thumbnail', newCourse.thumbnail);
      } else {
        throw new Error('Please provide either a thumbnail file or URL');
      }

      await axios.post('http://localhost:5000/api/courses', formData, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Course added');
      setNewCourse({ title: '', description: '', instructorId: '', thumbnail: null, thumbnailUrl: '', category: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to add course');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', editCourse.title);
      formData.append('description', editCourse.description);
      formData.append('instructorId', editCourse.instructorId);
      formData.append('category', editCourse.category);
      if (editCourse.thumbnailUrl) {
        formData.append('thumbnail_url', editCourse.thumbnailUrl);
      } else if (editCourse.thumbnail) {
        formData.append('thumbnail', editCourse.thumbnail);
      } else {
        formData.append('thumbnail_url', editCourse.thumbnail_url || null);
      }

      await axios.put(`http://localhost:5000/api/courses/${editCourse.id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Course updated');
      setEditCourse(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to update course');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/courses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Course deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete course');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCarouselImage = async (e) => {
    e.preventDefault();
    if (!newCarouselImage) return toast.error('Please select an image');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', newCarouselImage);
      await axios.post('http://localhost:5000/api/carousel', formData, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Image added');
      setNewCarouselImage(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to add carousel image');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCarouselImage = async (e) => {
    e.preventDefault();
    if (!editCarouselImage?.image) return toast.error('Please select an image');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', editCarouselImage.image);
      await axios.put(`http://localhost:5000/api/carousel/${editCarouselImage.id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Image updated');
      setEditCarouselImage(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to update image');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCarouselImage = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/carousel/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Image deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete image');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUploadSubmit = async (e) => {
    e.preventDefault();
    if (videoUploadType === 'file' && !videoFile) return toast.warning('Please select a video file');
    if (videoUploadType === 'url' && !newVideo.externalVideoUrl) return toast.warning('Please enter a video URL');
    if (!newVideo.courseId) return toast.warning('Please select a course');

    setLoading(true);
    const formData = new FormData();
    formData.append('courseId', newVideo.courseId);
    formData.append('title', newVideo.title);
    
    if (videoUploadType === 'file') {
      formData.append('video', videoFile);
    } else {
      formData.append('externalVideoUrl', newVideo.externalVideoUrl);
    }

    try {
      await axios.post('http://localhost:5000/api/lessons', formData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Video lesson uploaded successfully!');
      setNewVideo({ courseId: '', title: '', externalVideoUrl: '' });
      setVideoFile(null);
      e.target.reset();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to upload video');
    } finally {
      setLoading(false);
    }
  };

  const handleAssessmentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const invalidQuestions = newAssessment.questions.filter(q => 
        q.type === 'multiple-choice' && (!q.choices || q.choices.length < 2 || !q.choices.includes(q.correct_answer))
      );
      if (invalidQuestions.length > 0) throw new Error('Multiple-choice questions must have valid options');
      
      await axios.post('http://localhost:5000/api/assessments', newAssessment, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Assessment added successfully');
      setNewAssessment({ courseId: '', title: '', questions: [{ question_text: '', correct_answer: '', type: 'short-answer', choices: [] }] });
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to add assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      if (isEdit) setEditCourse({ ...editCourse, thumbnail: file, thumbnailUrl: '' });
      else setNewCourse({ ...newCourse, thumbnail: file, thumbnailUrl: '' });
    }
  };

  const handleUrlChange = (e, isEdit = false) => {
    const url = e.target.value;
    if (isEdit) setEditCourse({ ...editCourse, thumbnailUrl: url, thumbnail: null });
    else setNewCourse({ ...newCourse, thumbnailUrl: url, thumbnail: null });
  };

  const handleCarouselFileChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      if (isEdit) setEditCarouselImage({ ...editCarouselImage, image: file });
      else setNewCarouselImage(file);
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...newAssessment.questions];
    updated[index][field] = value;
    if (field === 'type' && value === 'short-answer') updated[index].choices = [];
    setNewAssessment({ ...newAssessment, questions: updated });
  };

  const handleChoiceChange = (qIndex, cIndex, value) => {
    const updated = [...newAssessment.questions];
    const choices = updated[qIndex].choices || [];
    choices[cIndex] = value;
    updated[qIndex].choices = choices;
    setNewAssessment({ ...newAssessment, questions: updated });
  };

  const handleAddChoice = (qIndex) => {
    const updated = [...newAssessment.questions];
    updated[qIndex].choices = [...(updated[qIndex].choices || []), ''];
    setNewAssessment({ ...newAssessment, questions: updated });
  };

  const handleRemoveChoice = (qIndex, cIndex) => {
    const updated = [...newAssessment.questions];
    updated[qIndex].choices = updated[qIndex].choices.filter((_, i) => i !== cIndex);
    if (updated[qIndex].correct_answer === updated[qIndex].choices[cIndex]) updated[qIndex].correct_answer = '';
    setNewAssessment({ ...newAssessment, questions: updated });
  };

  const handleAddQuestion = () => {
    setNewAssessment(prev => ({
      ...prev, questions: [...prev.questions, { question_text: '', correct_answer: '', type: 'short-answer', choices: [] }]
    }));
  };

  const handleRemoveQuestion = (index) => {
    setNewAssessment(prev => ({
      ...prev, questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  // Titles for ContentHeader
  const getTabTitle = () => {
    switch (activeTab) {
      case 'users': return 'User Management';
      case 'courses': return 'Course Management';
      case 'carousel': return 'Carousel Configuration';
      case 'videoUpload': return 'Video Lesson Upload';
      case 'assessments': return 'Assessments Builder';
      default: return 'Admin Panel';
    }
  };

  return (
    <DashboardLayout>
      <Sidebar $isOpen={isSidebarOpen}>
        <SidebarHeader $isOpen={isSidebarOpen}>
          <div className="header-content">
            <h2>Admin Panel</h2>
            <p>Platform Management</p>
          </div>
          <CollapseButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <FiChevronLeft /> : <FiMenu />}
          </CollapseButton>
        </SidebarHeader>
        
        <SidebarItem $isOpen={isSidebarOpen} $active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
          <FiUsers /> <span className="item-text">Users</span>
        </SidebarItem>
        <SidebarItem $isOpen={isSidebarOpen} $active={activeTab === 'courses'} onClick={() => setActiveTab('courses')}>
          <FiLayers /> <span className="item-text">Courses</span>
        </SidebarItem>
        <SidebarItem $isOpen={isSidebarOpen} $active={activeTab === 'carousel'} onClick={() => setActiveTab('carousel')}>
          <FiImage /> <span className="item-text">Carousel</span>
        </SidebarItem>
        <SidebarItem $isOpen={isSidebarOpen} $active={activeTab === 'videoUpload'} onClick={() => setActiveTab('videoUpload')}>
          <FiVideo /> <span className="item-text">Video Upload</span>
        </SidebarItem>
        <SidebarItem $isOpen={isSidebarOpen} $active={activeTab === 'assessments'} onClick={() => setActiveTab('assessments')}>
          <FiBookOpen /> <span className="item-text">Assessments</span>
        </SidebarItem>
      </Sidebar>

      <MainContent>
        <ContentHeader>
          <h1>{getTabTitle()}</h1>
        </ContentHeader>

        {loading && <p style={{ color: '#a3aed1', fontWeight: 600 }}>Loading data...</p>}

        {activeTab === 'users' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
              {!showAddUserForm && (
                <Button onClick={() => setShowAddUserForm(true)}>
                  <FiPlus /> Add New User
                </Button>
              )}
            </div>

            {showAddUserForm && !editUser && (
              <Card>
                <CardTitle>Register New User</CardTitle>
                <Form onSubmit={handleAddUser}>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <InputGroup style={{ flex: 1 }}>
                      <Label>Username</Label>
                      <Input type="text" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} required disabled={loading} />
                    </InputGroup>
                    <InputGroup style={{ flex: 1 }}>
                      <Label>Email</Label>
                      <Input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required disabled={loading} />
                    </InputGroup>
                  </div>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <InputGroup style={{ flex: 1 }}>
                      <Label>Password</Label>
                      <Input type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required disabled={loading} />
                    </InputGroup>
                    <InputGroup style={{ flex: 1 }}>
                      <Label>Role</Label>
                      <Select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} disabled={loading}>
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                      </Select>
                    </InputGroup>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Button type="submit" disabled={loading} style={{ alignSelf: 'flex-start' }}><FiPlus /> Add User</Button>
                    <Button type="button" variant="secondary" onClick={() => setShowAddUserForm(false)} disabled={loading}>Cancel</Button>
                  </div>
                </Form>
              </Card>
            )}

            {editUser && (
              <Card>
                <CardTitle>Edit User</CardTitle>
                <Form onSubmit={handleEditUserSubmit}>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <InputGroup style={{ flex: 1 }}>
                      <Label>Username</Label>
                      <Input type="text" value={editUser.username} onChange={e => setEditUser({...editUser, username: e.target.value})} required disabled={loading} />
                    </InputGroup>
                    <InputGroup style={{ flex: 1 }}>
                      <Label>Email</Label>
                      <Input type="email" value={editUser.email} onChange={e => setEditUser({...editUser, email: e.target.value})} required disabled={loading} />
                    </InputGroup>
                  </div>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <InputGroup style={{ flex: 1 }}>
                      <Label>Role</Label>
                      <Select value={editUser.role} onChange={e => setEditUser({...editUser, role: e.target.value})} disabled={loading}>
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                      </Select>
                    </InputGroup>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Button type="submit" disabled={loading} style={{ alignSelf: 'flex-start' }}><FiEdit /> Save Changes</Button>
                    <Button type="button" variant="secondary" onClick={() => setEditUser(null)} disabled={loading}>Cancel</Button>
                  </div>
                </Form>
              </Card>
            )}
            
            <Card>
              <CardTitle>Existing Users</CardTitle>
              <div style={{ overflowX: 'auto' }}>
                <Table>
                  <Thead>
                    <Tr>
                      <Th>ID</Th>
                      <Th>Username</Th>
                      <Th>Email</Th>
                      <Th>Role</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {users.map((u) => (
                      <Tr key={u.id}>
                        <Td>{u.id}</Td>
                        <Td>{u.username}</Td>
                        <Td>{u.email}</Td>
                        <Td><strong style={{ color: '#4318FF' }}>{u.role.toUpperCase()}</strong></Td>
                        <Td>
                          <ActionButtons>
                            <Button variant="outline" onClick={() => setEditUser(u)} style={{ padding: '8px 12px' }}><FiEdit /></Button>
                            <Button variant="danger" onClick={() => handleDeleteUser(u.id)} style={{ padding: '8px 12px' }}><FiTrash2 /></Button>
                          </ActionButtons>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </div>
            </Card>
          </>
        )}

        {activeTab === 'courses' && (
          <>
            {!editCourse ? (
              <Card>
                <CardTitle>Create New Course</CardTitle>
                <Form onSubmit={handleAddCourse}>
                  <InputGroup>
                    <Label>Course Title</Label>
                    <Input type="text" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} required disabled={loading} />
                  </InputGroup>
                  <InputGroup>
                    <Label>Description</Label>
                    <Textarea value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} required disabled={loading} />
                  </InputGroup>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <InputGroup style={{ flex: 1 }}>
                      <Label>Category</Label>
                      <Select value={newCourse.category} onChange={e => setNewCourse({...newCourse, category: e.target.value})} required disabled={loading}>
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </Select>
                    </InputGroup>
                    <InputGroup style={{ flex: 1 }}>
                      <Label>Instructor ID</Label>
                      <Input type="number" value={newCourse.instructorId} onChange={e => setNewCourse({...newCourse, instructorId: e.target.value})} required disabled={loading} />
                    </InputGroup>
                  </div>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <InputGroup style={{ flex: 1 }}>
                      <Label>Thumbnail URL (Optional)</Label>
                      <Input type="url" value={newCourse.thumbnailUrl} onChange={handleUrlChange} disabled={loading} />
                    </InputGroup>
                    <InputGroup style={{ flex: 1 }}>
                      <Label>Or Upload Image</Label>
                      <Input type="file" accept="image/jpeg,image/png" onChange={handleFileChange} disabled={loading || newCourse.thumbnailUrl} />
                    </InputGroup>
                  </div>
                  <Button type="submit" disabled={loading || (!newCourse.thumbnail && !newCourse.thumbnailUrl)} style={{ alignSelf: 'flex-start' }}><FiPlus /> Add Course</Button>
                </Form>
              </Card>
            ) : (
              <Card>
                <CardTitle>Edit Course</CardTitle>
                <Form onSubmit={handleEditCourse}>
                  <InputGroup>
                    <Label>Course Title</Label>
                    <Input type="text" value={editCourse.title} onChange={e => setEditCourse({...editCourse, title: e.target.value})} required disabled={loading} />
                  </InputGroup>
                  <InputGroup>
                    <Label>Description</Label>
                    <Textarea value={editCourse.description} onChange={e => setEditCourse({...editCourse, description: e.target.value})} required disabled={loading} />
                  </InputGroup>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <InputGroup style={{ flex: 1 }}>
                      <Label>Category</Label>
                      <Select value={editCourse.category} onChange={e => setEditCourse({...editCourse, category: e.target.value})} required disabled={loading}>
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </Select>
                    </InputGroup>
                    <InputGroup style={{ flex: 1 }}>
                      <Label>Instructor ID</Label>
                      <Input type="number" value={editCourse.instructorId} onChange={e => setEditCourse({...editCourse, instructorId: e.target.value})} required disabled={loading} />
                    </InputGroup>
                  </div>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <InputGroup style={{ flex: 1 }}>
                      <Label>Thumbnail URL</Label>
                      <Input type="url" value={editCourse.thumbnailUrl} onChange={e => handleUrlChange(e, true)} disabled={loading} />
                    </InputGroup>
                    <InputGroup style={{ flex: 1 }}>
                      <Label>Upload Image</Label>
                      <Input type="file" accept="image/jpeg,image/png" onChange={e => handleFileChange(e, true)} disabled={loading || editCourse.thumbnailUrl} />
                    </InputGroup>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Button type="submit" disabled={loading}><FiEdit /> Save Changes</Button>
                    <Button type="button" variant="secondary" onClick={() => setEditCourse(null)} disabled={loading}>Cancel</Button>
                  </div>
                </Form>
              </Card>
            )}

            <Card>
              <CardTitle>Existing Courses</CardTitle>
              <List>
                {courses.map(c => (
                  <ListItem key={c.id}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      {c.thumbnail_url && <img src={c.thumbnail_url.startsWith('http') ? c.thumbnail_url : `http://localhost:5000${c.thumbnail_url}`} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />}
                      <ItemDetails>
                        <ItemTitle>{c.title}</ItemTitle>
                        <ItemSubtitle>{c.category} • Instructor ID: {c.instructorId || c.instructor_id}</ItemSubtitle>
                      </ItemDetails>
                    </div>
                    <ActionButtons>
                      <Button variant="outline" onClick={() => setEditCourse({ ...c, thumbnail: null, thumbnailUrl: c.thumbnail_url || '' })}><FiEdit /></Button>
                      <Button variant="danger" onClick={() => handleDeleteCourse(c.id)}><FiTrash2 /></Button>
                    </ActionButtons>
                  </ListItem>
                ))}
              </List>
            </Card>
          </>
        )}

        {activeTab === 'carousel' && (
          <>
            {!editCarouselImage ? (
              <Card>
                <CardTitle>Add Carousel Image</CardTitle>
                <Form onSubmit={handleAddCarouselImage}>
                  <InputGroup>
                    <Label>Upload Image</Label>
                    <Input type="file" accept="image/jpeg,image/png" onChange={e => handleCarouselFileChange(e)} required disabled={loading} />
                  </InputGroup>
                  <Button type="submit" disabled={loading || !newCarouselImage} style={{ alignSelf: 'flex-start' }}><FiPlus /> Upload Image</Button>
                </Form>
              </Card>
            ) : (
              <Card>
                <CardTitle>Edit Carousel Image</CardTitle>
                <Form onSubmit={handleEditCarouselImage}>
                  <InputGroup>
                    <Label>Upload New Image</Label>
                    <Input type="file" accept="image/jpeg,image/png" onChange={e => handleCarouselFileChange(e, true)} required disabled={loading} />
                  </InputGroup>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Button type="submit" disabled={loading}><FiEdit /> Save Changes</Button>
                    <Button type="button" variant="secondary" onClick={() => setEditCarouselImage(null)} disabled={loading}>Cancel</Button>
                  </div>
                </Form>
              </Card>
            )}

            <Card>
              <CardTitle>Manage Carousel</CardTitle>
              <List style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {carouselImages.map(img => (
                  <ListItem key={img.id} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    <img src={img.image_url} alt="Carousel" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', margin: '0 0 15px 0' }} />
                    <ActionButtons style={{ justifyContent: 'center' }}>
                      <Button variant="outline" onClick={() => setEditCarouselImage({ id: img.id, image_url: img.image_url, image: null })}><FiEdit /> Edit</Button>
                      <Button variant="danger" onClick={() => handleDeleteCarouselImage(img.id)}><FiTrash2 /> Remove</Button>
                    </ActionButtons>
                  </ListItem>
                ))}
              </List>
            </Card>
          </>
        )}

        {activeTab === 'videoUpload' && (
          <Card>
            <CardTitle>Upload Course Video</CardTitle>
            <Form onSubmit={handleVideoUploadSubmit}>
              <div style={{ display: 'flex', gap: '20px' }}>
                <InputGroup style={{ flex: 1 }}>
                  <Label>Select Course</Label>
                  <Select value={newVideo.courseId} onChange={e => setNewVideo({...newVideo, courseId: e.target.value})} required disabled={loading}>
                    <option value="">Select a Course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </Select>
                </InputGroup>
                <InputGroup style={{ flex: 2 }}>
                  <Label>Lesson Title</Label>
                  <Input type="text" placeholder="e.g. Introduction to React" value={newVideo.title} onChange={e => setNewVideo({...newVideo, title: e.target.value})} required disabled={loading} />
                </InputGroup>
              </div>

              <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="uploadType" 
                    value="file" 
                    checked={videoUploadType === 'file'} 
                    onChange={() => setVideoUploadType('file')} 
                  />
                  Upload File
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="uploadType" 
                    value="url" 
                    checked={videoUploadType === 'url'} 
                    onChange={() => setVideoUploadType('url')} 
                  />
                  Video URL
                </label>
              </div>

              {videoUploadType === 'file' ? (
                <InputGroup>
                  <Label>Video File</Label>
                  <Input 
                    type="file" 
                    accept="video/mp4,video/mkv,video/avi,video/mov" 
                    onChange={e => setVideoFile(e.target.files[0])} 
                    required 
                    disabled={loading}
                  />
                </InputGroup>
              ) : (
                <InputGroup>
                  <Label>Video URL</Label>
                  <Input 
                    type="url" 
                    placeholder="e.g. https://www.youtube.com/watch?v=..." 
                    value={newVideo.externalVideoUrl} 
                    onChange={e => setNewVideo({...newVideo, externalVideoUrl: e.target.value})} 
                    required 
                    disabled={loading}
                  />
                </InputGroup>
              )}
              
              <Button type="submit" disabled={loading}>
                {loading ? 'Uploading...' : 'Upload Video Lesson'}
              </Button>
            </Form>
          </Card>
        )}

        {activeTab === 'assessments' && (
          <Card>
            <CardTitle>Create Assessment</CardTitle>
            <Form onSubmit={handleAssessmentSubmit}>
              <div style={{ display: 'flex', gap: '20px' }}>
                <InputGroup style={{ flex: 1 }}>
                  <Label>Course</Label>
                  <Select value={newAssessment.courseId} onChange={e => setNewAssessment({...newAssessment, courseId: e.target.value})} required disabled={loading}>
                    <option value="">Select a Course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </Select>
                </InputGroup>
                <InputGroup style={{ flex: 2 }}>
                  <Label>Assessment Title</Label>
                  <Input type="text" value={newAssessment.title} onChange={e => setNewAssessment({...newAssessment, title: e.target.value})} required disabled={loading} />
                </InputGroup>
              </div>
              
              {newAssessment.questions.map((q, index) => (
                <QuestionContainer key={index}>
                  <CardTitle style={{ fontSize: '1.1rem', marginBottom: '0' }}>Question {index + 1}</CardTitle>
                  <InputGroup>
                    <Label>Question Text</Label>
                    <Textarea value={q.question_text} onChange={e => handleQuestionChange(index, 'question_text', e.target.value)} required disabled={loading} />
                  </InputGroup>
                  <InputGroup>
                    <Label>Question Type</Label>
                    <Select value={q.type} onChange={e => handleQuestionChange(index, 'type', e.target.value)} disabled={loading}>
                      <option value="short-answer">Short Answer</option>
                      <option value="multiple-choice">Multiple Choice</option>
                    </Select>
                  </InputGroup>
                  
                  {q.type === 'short-answer' ? (
                    <InputGroup>
                      <Label>Correct Answer</Label>
                      <Input type="text" value={q.correct_answer} onChange={e => handleQuestionChange(index, 'correct_answer', e.target.value)} required disabled={loading} />
                    </InputGroup>
                  ) : (
                    <>
                      <Label>Options</Label>
                      {q.choices.map((choice, choiceIndex) => (
                        <div key={choiceIndex} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <Input type="text" style={{ flex: 1 }} placeholder={`Option ${choiceIndex + 1}`} value={choice} onChange={e => handleChoiceChange(index, choiceIndex, e.target.value)} required disabled={loading} />
                          <Button type="button" variant="danger" onClick={() => handleRemoveChoice(index, choiceIndex)} disabled={loading || q.choices.length <= 2}>Remove</Button>
                        </div>
                      ))}
                      <Button type="button" variant="outline" onClick={() => handleAddChoice(index)} disabled={loading} style={{ alignSelf: 'flex-start' }}>Add Option</Button>
                      <InputGroup style={{ marginTop: '10px' }}>
                        <Label>Correct Answer</Label>
                        <Select value={q.correct_answer} onChange={e => handleQuestionChange(index, 'correct_answer', e.target.value)} disabled={loading || !q.choices.length} required>
                          <option value="">Select Correct Answer</option>
                          {q.choices.map((choice, i) => (
                            <option key={i} value={choice}>{choice || `Option ${i + 1}`}</option>
                          ))}
                        </Select>
                      </InputGroup>
                    </>
                  )}
                  {newAssessment.questions.length > 1 && (
                    <Button type="button" variant="outline" onClick={() => handleRemoveQuestion(index)} style={{ color: '#EE5D50', borderColor: '#EE5D50', alignSelf: 'flex-start' }} disabled={loading}>Remove Question</Button>
                  )}
                </QuestionContainer>
              ))}
              
              <div style={{ display: 'flex', gap: '15px' }}>
                <Button type="button" variant="outline" onClick={handleAddQuestion} disabled={loading}><FiPlus /> Add Question</Button>
                <Button type="submit" disabled={loading}>Publish Assessment</Button>
              </div>
            </Form>
          </Card>
        )}
      </MainContent>
      <ToastContainer />
    </DashboardLayout>
  );
};

export default AdminPanel;