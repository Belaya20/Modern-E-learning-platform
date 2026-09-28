import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FiBookOpen, FiPieChart, FiChevronDown, FiChevronRight, FiPlus, FiCheckCircle,
  FiUsers, FiImage, FiEdit, FiTrash2, FiLayers, FiChevronLeft, FiMenu
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
  color: ${props => props.active ? 'white' : '#a3aed1'};
  background: ${props => props.active ? 'linear-gradient(135deg, #4318FF 0%, #868CFF 100%)' : 'transparent'};
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 1rem;

  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #4318FF 0%, #868CFF 100%)' : '#f4f7fe'};
    color: ${props => props.active ? 'white' : '#4318FF'};
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

// Card Components
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

// Forms and Inputs
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
  background: ${props => props.variant === 'outline' ? 'transparent' : props.variant === 'danger' ? '#EE5D50' : 'linear-gradient(135deg, #4318FF 0%, #868CFF 100%)'};
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
    box-shadow: ${props => props.variant === 'outline' ? 'none' : props.variant === 'danger' ? '0 8px 15px rgba(238, 93, 80, 0.25)' : '0 8px 15px rgba(67, 24, 255, 0.25)'};
    background: ${props => props.variant === 'outline' ? 'rgba(67, 24, 255, 0.05)' : ''};
  }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

// Lists and Tables
const List = styled.div` display: flex; flex-direction: column; gap: 15px; `;
const ListItem = styled.div`
  display: flex; justify-content: space-between; align-items: center; padding: 20px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; transition: all 0.2s;
  &:hover { border-color: #868CFF; box-shadow: 0 4px 12px rgba(67, 24, 255, 0.05); }
`;
const ItemDetails = styled.div` display: flex; flex-direction: column; gap: 5px; `;
const ItemTitle = styled.h4` margin: 0; font-size: 1.1rem; color: #2b3674; `;
const ItemSubtitle = styled.span` font-size: 0.9rem; color: #a3aed1; `;
const ActionButtons = styled.div` display: flex; gap: 10px; `;

// Accordion (Assessment List)
const AssessmentHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center; padding: 20px; background: #f8fafc; border-radius: 12px; cursor: pointer; transition: all 0.2s;
  margin-bottom: ${props => props.expanded ? '0' : '15px'};
  border-bottom-left-radius: ${props => props.expanded ? '0' : '12px'};
  border-bottom-right-radius: ${props => props.expanded ? '0' : '12px'};
  &:hover { background: #edf2f7; }
  h4 { margin: 0; font-size: 1.1rem; color: #2b3674; }
`;
const AssessmentBody = styled.div`
  background: white; border: 1px solid #f8fafc; border-top: none; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.02);
`;
const QuestionBlock = styled.div`
  margin-bottom: 25px; padding-bottom: 25px; border-bottom: 1px dashed #e2e8f0;
  &:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
`;
const QuestionTitle = styled.h5` font-size: 1.05rem; color: #2b3674; margin: 0 0 15px 0; display: flex; align-items: flex-start; gap: 10px; `;
const AnswerContainer = styled.div` display: flex; align-items: center; gap: 15px; `;
const FeedbackBadge = styled.span`
  display: inline-flex; align-items: center; gap: 5px; padding: 8px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;
  background: ${props => props.correct ? 'rgba(5, 205, 153, 0.1)' : 'rgba(238, 93, 80, 0.1)'};
  color: ${props => props.correct ? '#05CD99' : '#EE5D50'};
`;

// Progress Bars
const ProgressReportCard = styled(Card)` display: flex; flex-direction: column; gap: 15px; `;
const ProgressInfo = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;
  span { color: #a3aed1; font-size: 0.9rem; font-weight: 500; }
  strong { color: #4318FF; font-size: 1.2rem; }
`;
const ProgressBarContainer = styled.div` width: 100%; height: 12px; background: #e9edf7; border-radius: 20px; overflow: hidden; `;
const ProgressFill = styled.div` height: 100%; background: linear-gradient(90deg, #4318FF 0%, #868CFF 100%); width: ${props => props.percentage}%; border-radius: 20px; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); `;

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  
  // Default active tab based on role
  const getDefaultTab = () => {
    if (user?.role === 'admin') return 'users';
    if (user?.role === 'instructor') return 'courses';
    return 'assessments'; // student
  };
  
  const [activeTab, setActiveTab] = useState(getDefaultTab());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Data states
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [carouselImages, setCarouselImages] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [progress, setProgress] = useState([]);

  // Form states
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'student' });
  const [newCourse, setNewCourse] = useState({ title: '', description: '', instructorId: '', thumbnail: null, thumbnailUrl: '', category: '' });
  const [editCourse, setEditCourse] = useState(null);
  const [newCarouselImage, setNewCarouselImage] = useState(null);
  const [newAssessment, setNewAssessment] = useState({ courseId: '', title: '', questions: [{ question_text: '', correct_answer: '', type: 'short-answer', choices: [] }] });
  
  // Interaction states
  const [responses, setResponses] = useState({});
  const [submissionStatus, setSubmissionStatus] = useState({});
  const [expandedAssessments, setExpandedAssessments] = useState({});

  const categories = [
    'Grade Four Tutorial', 'Grade Five Tutorial', 'Grade Six Tutorial', 
    'Grade Seven Tutorial', 'Grade Eight Tutorial', 'Grade Nine Tutorial', 
    'Grade Ten Tutorial', 'Grade Eleven Tutorial', 'Grade Twelve Tutorial', 
    'Web Development', 'App Development'
  ];

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (user.role === 'admin') {
        const [usersRes, coursesRes, carouselRes, assessmentsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/users', { headers }),
          axios.get('http://localhost:5000/api/courses', { headers }), // Public actually
          axios.get('http://localhost:5000/api/carousel'),
          axios.get(`http://localhost:5000/api/assessments/course/1`, { headers }).catch(() => ({ data: [] })) // Mock courseId 1 for now or fetch all if endpoint exists
        ]);
        setUsers(usersRes.data);
        setCourses(coursesRes.data);
        setCarouselImages(carouselRes.data.slice(0, 6));
        setAssessments(assessmentsRes.data);
      } 
      else if (user.role === 'instructor') {
        const [coursesRes, assessmentsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/courses', { headers }),
          axios.get(`http://localhost:5000/api/assessments/course/1`, { headers }).catch(() => ({ data: [] }))
        ]);
        setCourses(coursesRes.data); // Ideally filter by instructor ID, but frontend filtering works for now
        setAssessments(assessmentsRes.data);
      }
      else {
        // Student
        const courseId = 1; // Assuming enrolled in course 1 for demo purposes
        const [assessmentsRes, progressRes, coursesRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/assessments/course/${courseId}`, { headers }),
          axios.get(`http://localhost:5000/api/assessments/progress/${courseId}`, { headers }),
          axios.get('http://localhost:5000/api/courses', { headers })
        ]);
        setAssessments(assessmentsRes.data);
        setProgress(progressRes.data);
        setCourses(coursesRes.data);
        
        const status = {};
        progressRes.data.forEach(a => {
          a.questions.forEach(q => {
            if (q.student_answer) status[q.id] = q.is_correct;
          });
        });
        setSubmissionStatus(status);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- ADMIN & INSTRUCTOR ACTIONS ---

  const handleAddUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/users/register', newUser, { headers: { Authorization: `Bearer ${token}` }});
      toast.success('User added successfully');
      setNewUser({ username: '', email: '', password: '', role: 'student' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      toast.success('User deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', newCourse.title);
      formData.append('description', newCourse.description);
      formData.append('instructorId', newCourse.instructorId || user.id);
      formData.append('category', newCourse.category);
      if (newCourse.thumbnailUrl) formData.append('thumbnail_url', newCourse.thumbnailUrl);
      else if (newCourse.thumbnail) formData.append('thumbnail', newCourse.thumbnail);
      else throw new Error('Thumbnail required');

      await axios.post('http://localhost:5000/api/courses', formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      toast.success('Course added successfully');
      setNewCourse({ title: '', description: '', instructorId: '', thumbnail: null, thumbnailUrl: '', category: '' });
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to add course');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/courses/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      toast.success('Course deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete course');
    }
  };

  const handleAddCarouselImage = async (e) => {
    e.preventDefault();
    if (!newCarouselImage) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', newCarouselImage);
      await axios.post('http://localhost:5000/api/carousel', formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      toast.success('Image added');
      setNewCarouselImage(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to add image');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCarouselImage = async (id) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/carousel/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      toast.success('Image deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete image');
    }
  };

  // --- ASSESSMENT & PROGRESS ACTIONS ---

  const handleAssessmentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/assessments', newAssessment, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      toast.success('Assessment created');
      setNewAssessment({ courseId: '', title: '', questions: [{ question_text: '', correct_answer: '', type: 'short-answer', choices: [] }] });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleResponseSubmit = async (questionId) => {
    const studentAnswer = responses[questionId];
    if (!studentAnswer) return;
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/assessments/response', { questionId, studentAnswer }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      toast.success('Answer submitted!');
      fetchData(); // Refresh progress
    } catch (err) {
      toast.error('Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  const toggleAssessment = (id) => setExpandedAssessments(prev => ({ ...prev, [id]: !prev[id] }));

  // Form helpers
  const handleQuestionChange = (index, field, value) => {
    const updated = [...newAssessment.questions];
    updated[index][field] = value;
    setNewAssessment({ ...newAssessment, questions: updated });
  };
  const addQuestionField = () => setNewAssessment(prev => ({ ...prev, questions: [...prev.questions, { question_text: '', correct_answer: '', type: 'short-answer', choices: [] }] }));
  const removeQuestionField = (index) => setNewAssessment(prev => ({ ...prev, questions: prev.questions.filter((_, i) => i !== index) }));

  // Titles for ContentHeader
  const getTabTitle = () => {
    switch (activeTab) {
      case 'users': return 'User Management';
      case 'courses': return 'Course Management';
      case 'carousel': return 'Carousel Settings';
      case 'assessments': return user?.role === 'student' ? 'Available Assessments' : 'Manage Assessments';
      case 'progress': return 'Your Progress';
      default: return 'Dashboard';
    }
  };

  return (
    <DashboardLayout>
      <Sidebar $isOpen={isSidebarOpen}>
        <SidebarHeader $isOpen={isSidebarOpen}>
          <div className="header-content">
            <h2>Dashboard</h2>
            <p>{user?.role} Portal</p>
          </div>
          <CollapseButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <FiChevronLeft /> : <FiMenu />}
          </CollapseButton>
        </SidebarHeader>
        
        {user?.role === 'admin' && (
          <>
            <SidebarItem $isOpen={isSidebarOpen} active={activeTab === 'users'} onClick={() => setActiveTab('users')}><FiUsers /> <span className="item-text">Users</span></SidebarItem>
            <SidebarItem $isOpen={isSidebarOpen} active={activeTab === 'courses'} onClick={() => setActiveTab('courses')}><FiLayers /> <span className="item-text">Courses</span></SidebarItem>
            <SidebarItem $isOpen={isSidebarOpen} active={activeTab === 'carousel'} onClick={() => setActiveTab('carousel')}><FiImage /> <span className="item-text">Carousel</span></SidebarItem>
            <SidebarItem $isOpen={isSidebarOpen} active={activeTab === 'assessments'} onClick={() => setActiveTab('assessments')}><FiBookOpen /> <span className="item-text">Assessments</span></SidebarItem>
          </>
        )}

        {user?.role === 'instructor' && (
          <>
            <SidebarItem $isOpen={isSidebarOpen} active={activeTab === 'courses'} onClick={() => setActiveTab('courses')}><FiLayers /> <span className="item-text">My Courses</span></SidebarItem>
            <SidebarItem $isOpen={isSidebarOpen} active={activeTab === 'assessments'} onClick={() => setActiveTab('assessments')}><FiBookOpen /> <span className="item-text">Assessments</span></SidebarItem>
          </>
        )}
        
        {user?.role === 'student' && (
          <>
            <SidebarItem $isOpen={isSidebarOpen} active={activeTab === 'courses'} onClick={() => setActiveTab('courses')}><FiLayers /> <span className="item-text">My Courses</span></SidebarItem>
            <SidebarItem $isOpen={isSidebarOpen} active={activeTab === 'assessments'} onClick={() => setActiveTab('assessments')}><FiBookOpen /> <span className="item-text">Assessments</span></SidebarItem>
            <SidebarItem $isOpen={isSidebarOpen} active={activeTab === 'progress'} onClick={() => setActiveTab('progress')}><FiPieChart /> <span className="item-text">Progress Reports</span></SidebarItem>
          </>
        )}
      </Sidebar>

      <MainContent>
        <ContentHeader>
          <h1>{getTabTitle()}</h1>
        </ContentHeader>

        {loading && <p style={{ color: '#a3aed1', fontWeight: 600 }}>Loading data...</p>}

        {/* ADMIN USERS TAB */}
        {activeTab === 'users' && user?.role === 'admin' && (
          <>
            <Card>
              <CardTitle>Register New User</CardTitle>
              <Form onSubmit={handleAddUser}>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <InputGroup style={{ flex: 1 }}>
                    <Label>Username</Label>
                    <Input type="text" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} required />
                  </InputGroup>
                  <InputGroup style={{ flex: 1 }}>
                    <Label>Email</Label>
                    <Input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required />
                  </InputGroup>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <InputGroup style={{ flex: 1 }}>
                    <Label>Password</Label>
                    <Input type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required />
                  </InputGroup>
                  <InputGroup style={{ flex: 1 }}>
                    <Label>Role</Label>
                    <Select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Admin</option>
                    </Select>
                  </InputGroup>
                </div>
                <Button type="submit" disabled={loading} style={{ alignSelf: 'flex-start' }}><FiPlus /> Add User</Button>
              </Form>
            </Card>

            <List>
              {users.map(u => (
                <ListItem key={u.id}>
                  <ItemDetails>
                    <ItemTitle>{u.username}</ItemTitle>
                    <ItemSubtitle>{u.email} • <strong style={{ color: '#4318FF' }}>{u.role.toUpperCase()}</strong></ItemSubtitle>
                  </ItemDetails>
                  <ActionButtons>
                    <Button variant="danger" onClick={() => handleDeleteUser(u.id)}><FiTrash2 /></Button>
                  </ActionButtons>
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* COURSES TAB (ADMIN & INSTRUCTOR) */}
        {activeTab === 'courses' && (user?.role === 'admin' || user?.role === 'instructor') && (
          <>
            <Card>
              <CardTitle>Create New Course</CardTitle>
              <Form onSubmit={handleAddCourse}>
                <InputGroup>
                  <Label>Course Title</Label>
                  <Input type="text" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} required />
                </InputGroup>
                <InputGroup>
                  <Label>Description</Label>
                  <Textarea value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} required />
                </InputGroup>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <InputGroup style={{ flex: 1 }}>
                    <Label>Category</Label>
                    <Select value={newCourse.category} onChange={e => setNewCourse({...newCourse, category: e.target.value})} required>
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </Select>
                  </InputGroup>
                  {user.role === 'admin' && (
                    <InputGroup style={{ flex: 1 }}>
                      <Label>Instructor ID</Label>
                      <Input type="number" value={newCourse.instructorId} onChange={e => setNewCourse({...newCourse, instructorId: e.target.value})} required />
                    </InputGroup>
                  )}
                </div>
                <InputGroup>
                  <Label>Thumbnail Image</Label>
                  <Input type="file" accept="image/jpeg,image/png" onChange={e => setNewCourse({...newCourse, thumbnail: e.target.files[0]})} />
                </InputGroup>
                <Button type="submit" disabled={loading} style={{ alignSelf: 'flex-start' }}><FiPlus /> Publish Course</Button>
              </Form>
            </Card>

            <List>
              {courses.filter(c => user.role === 'admin' || c.instructor_id === user.id).map(c => (
                <ListItem key={c.id}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    {c.thumbnail_url && <img src={c.thumbnail_url.startsWith('http') ? c.thumbnail_url : `http://localhost:5000${c.thumbnail_url}`} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />}
                    <ItemDetails>
                      <ItemTitle>{c.title}</ItemTitle>
                      <ItemSubtitle>{c.category} • ID: {c.id}</ItemSubtitle>
                    </ItemDetails>
                  </div>
                  <ActionButtons>
                    <Button variant="danger" onClick={() => handleDeleteCourse(c.id)}><FiTrash2 /></Button>
                  </ActionButtons>
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* COURSES TAB (STUDENT) */}
        {activeTab === 'courses' && user?.role === 'student' && (
          <List>
            {courses.map(c => (
              <ListItem key={c.id}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  {c.thumbnail_url && <img src={c.thumbnail_url.startsWith('http') ? c.thumbnail_url : `http://localhost:5000${c.thumbnail_url}`} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px' }} />}
                  <ItemDetails>
                    <ItemTitle style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{c.title}</ItemTitle>
                    <ItemSubtitle>{c.description}</ItemSubtitle>
                  </ItemDetails>
                </div>
                <ActionButtons>
                  <Button as="a" href={`/course/${c.id}`} style={{ textDecoration: 'none' }}><FiBookOpen /> Go to Course</Button>
                </ActionButtons>
              </ListItem>
            ))}
            {courses.length === 0 && <p style={{ color: '#a3aed1' }}>No courses available.</p>}
          </List>
        )}

        {/* CAROUSEL TAB (ADMIN ONLY) */}
        {activeTab === 'carousel' && user?.role === 'admin' && (
          <>
            <Card>
              <CardTitle>Add Carousel Image</CardTitle>
              <Form onSubmit={handleAddCarouselImage}>
                <Input type="file" accept="image/jpeg,image/png" onChange={e => setNewCarouselImage(e.target.files[0])} required />
                <Button type="submit" disabled={loading || !newCarouselImage} style={{ alignSelf: 'flex-start' }}><FiPlus /> Upload Image</Button>
              </Form>
            </Card>

            <List style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {carouselImages.map(img => (
                <ListItem key={img.id} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <img src={img.image_url} alt="" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} />
                  <Button variant="danger" onClick={() => handleDeleteCarouselImage(img.id)}><FiTrash2 /> Remove</Button>
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* ASSESSMENTS TAB (ALL ROLES) */}
        {activeTab === 'assessments' && (
          <>
            {(user?.role === 'admin' || user?.role === 'instructor') && (
              <Card>
                <CardTitle>Create Assessment</CardTitle>
                <Form onSubmit={handleAssessmentSubmit}>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <InputGroup style={{ flex: 1 }}>
                      <Label>Course ID</Label>
                      <Input type="number" value={newAssessment.courseId} onChange={e => setNewAssessment({...newAssessment, courseId: e.target.value})} required />
                    </InputGroup>
                    <InputGroup style={{ flex: 2 }}>
                      <Label>Assessment Title</Label>
                      <Input type="text" value={newAssessment.title} onChange={e => setNewAssessment({...newAssessment, title: e.target.value})} required />
                    </InputGroup>
                  </div>
                  
                  {newAssessment.questions.map((q, index) => (
                    <Card key={index} style={{ boxShadow: 'none', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '0' }}>
                      <CardTitle style={{ fontSize: '1.1rem', marginBottom: '15px' }}>Question {index + 1}</CardTitle>
                      <InputGroup style={{ marginBottom: '15px' }}>
                        <Label>Question Text</Label>
                        <Textarea value={q.question_text} onChange={e => handleQuestionChange(index, 'question_text', e.target.value)} required />
                      </InputGroup>
                      <InputGroup style={{ marginBottom: '15px' }}>
                        <Label>Correct Answer</Label>
                        <Input type="text" value={q.correct_answer} onChange={e => handleQuestionChange(index, 'correct_answer', e.target.value)} required />
                      </InputGroup>
                      {newAssessment.questions.length > 1 && (
                        <Button type="button" variant="outline" onClick={() => removeQuestionField(index)} style={{ color: '#EE5D50', borderColor: '#EE5D50' }}>Remove Question</Button>
                      )}
                    </Card>
                  ))}
                  
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <Button type="button" variant="outline" onClick={addQuestionField}><FiPlus /> Add Question</Button>
                    <Button type="submit">Publish Assessment</Button>
                  </div>
                </Form>
              </Card>
            )}

            <div>
              {assessments.length === 0 ? <p style={{ color: '#a3aed1' }}>No assessments found.</p> : assessments.map(assessment => (
                <div key={assessment.id}>
                  <AssessmentHeader expanded={expandedAssessments[assessment.id]} onClick={() => toggleAssessment(assessment.id)}>
                    <h4>{assessment.title}</h4>
                    {expandedAssessments[assessment.id] ? <FiChevronDown color="#a3aed1" size={24} /> : <FiChevronRight color="#a3aed1" size={24} />}
                  </AssessmentHeader>
                  
                  {expandedAssessments[assessment.id] && (
                    <AssessmentBody>
                      {assessment.questions.map((q, i) => (
                        <QuestionBlock key={q.id}>
                          <QuestionTitle><span style={{ color: '#4318FF', fontWeight: 800 }}>Q{i+1}.</span> {q.question_text}</QuestionTitle>
                          
                          {user?.role === 'student' && (
                            <AnswerContainer>
                              <Input
                                type="text"
                                value={responses[q.id] || ''}
                                onChange={e => setResponses(prev => ({ ...prev, [q.id]: e.target.value }))}
                                placeholder="Type your answer here..."
                                disabled={loading || submissionStatus[q.id] !== undefined}
                                style={{ flex: 1 }}
                              />
                              <Button onClick={() => handleResponseSubmit(q.id)} disabled={loading || !responses[q.id] || submissionStatus[q.id] !== undefined}>Submit</Button>
                              {submissionStatus[q.id] !== undefined && (
                                <FeedbackBadge correct={submissionStatus[q.id]}>
                                  {submissionStatus[q.id] ? <><FiCheckCircle /> Correct</> : 'Incorrect'}
                                </FeedbackBadge>
                              )}
                            </AnswerContainer>
                          )}
                        </QuestionBlock>
                      ))}
                    </AssessmentBody>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* PROGRESS TAB (STUDENT ONLY) */}
        {activeTab === 'progress' && user?.role === 'student' && (
          <div>
            {progress.length === 0 ? <p style={{ color: '#a3aed1' }}>No progress data available yet.</p> : progress.map(assessment => {
              const totalQuestions = assessment.questions.length;
              const answered = assessment.questions.filter(q => q.student_answer).length;
              const correct = assessment.questions.filter(q => q.is_correct).length;
              const percentage = totalQuestions ? (correct / totalQuestions) * 100 : 0;

              return (
                <ProgressReportCard key={assessment.id}>
                  <CardTitle>{assessment.title}</CardTitle>
                  <ProgressInfo>
                    <span>Completion ({answered}/{totalQuestions} answered)</span>
                    <strong>{percentage.toFixed(0)}% Score</strong>
                  </ProgressInfo>
                  <ProgressBarContainer><ProgressFill percentage={percentage} /></ProgressBarContainer>
                  <div style={{ marginTop: '15px', display: 'flex', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.85rem', color: '#a3aed1' }}>Correct</span>
                      <span style={{ fontWeight: 600, color: '#05CD99' }}>{correct}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.85rem', color: '#a3aed1' }}>Incorrect/Pending</span>
                      <span style={{ fontWeight: 600, color: '#EE5D50' }}>{totalQuestions - correct}</span>
                    </div>
                  </div>
                </ProgressReportCard>
              );
            })}
          </div>
        )}
      </MainContent>
      <ToastContainer />
    </DashboardLayout>
  );
};

export default UserDashboard;