import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ReactPlayer from 'react-player';
import styled from 'styled-components';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Styled Components
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'Inter', sans-serif;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #4318FF;
  text-decoration: none;
  font-weight: 600;
  margin-bottom: 20px;
  transition: all 0.2s;
  &:hover { transform: translateX(-5px); }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
`;

const PlayerWrapper = styled.div`
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
  background: #000;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #2b3674;
  margin-bottom: 10px;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #2b3674;
  margin-top: 30px;
  margin-bottom: 20px;
  border-bottom: 2px solid #f4f7fe;
  padding-bottom: 10px;
`;

const AssessmentCard = styled.div`
  background: #f4f7fe;
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 20px;
`;

const QuestionBlock = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.02);
`;

const QuestionText = styled.h4`
  margin: 0 0 15px 0;
  color: #2b3674;
  font-size: 1.1rem;
`;

const ChoiceLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 15px;
  background: ${props => props.selected ? 'rgba(67, 24, 255, 0.1)' : '#f8fafc'};
  border: 1px solid ${props => props.selected ? '#4318FF' : '#e2e8f0'};
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #4318FF;
    background: rgba(67, 24, 255, 0.05);
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  &:focus { outline: none; border-color: #4318FF; box-shadow: 0 0 0 3px rgba(67, 24, 255, 0.1); }
`;

const Button = styled.button`
  padding: 12px 24px;
  background: linear-gradient(135deg, #4318FF 0%, #868CFF 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 15px;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(67, 24, 255, 0.25);
  }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const CoursePlayer = () => {
  const { id } = useParams();
  const [lessons, setLessons] = useState([]);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Fetch lesson and assessments simultaneously
    Promise.all([
      axios.get(`http://localhost:5000/api/lessons?courseId=${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => { console.error('Lesson fetch error:', err); return { data: [] }; }),
      
      axios.get(`http://localhost:5000/api/assessments/course/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => { console.error('Assessment fetch error:', err); return { data: [] }; })
    ])
    .then(([lessonRes, assessmentRes]) => {
      setLessons(lessonRes.data);
      if (lessonRes.data.length > 0) {
        setActiveLessonId(lessonRes.data[0].id);
      }
      setAssessments(assessmentRes.data);
    })
    .finally(() => {
      setLoading(false);
    });
      
  }, [id]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmitResponse = async (questionId) => {
    if (!answers[questionId]) {
      return toast.warning('Please provide an answer first');
    }
    
    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/assessments/response', {
        questionId: questionId,
        studentAnswer: answers[questionId]
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Answer submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageContainer><h3 style={{color: '#a3aed1'}}>Loading content...</h3></PageContainer>;
  }

  const activeLesson = lessons.find(l => l.id === activeLessonId);

  return (
    <PageContainer>
      <BackLink to="/dashboard"><FiArrowLeft /> Back to Dashboard</BackLink>
      
      <ContentGrid>
        <MainContent>
          {activeLesson ? (
            <>
              <Title>{activeLesson.title}</Title>
              <PlayerWrapper>
                <ReactPlayer url={activeLesson.video_url} controls width="100%" height="500px" />
              </PlayerWrapper>
              <SectionTitle>Lesson Overview</SectionTitle>
              <p style={{color: '#475569', lineHeight: '1.6'}}>{activeLesson.content || 'Enjoy this lesson video.'}</p>
            </>
          ) : (
            <Title>No video lessons found for this course.</Title>
          )}

          {assessments.length > 0 && (
            <div style={{ marginTop: '50px' }}>
              <SectionTitle>Course Assessments</SectionTitle>
              
              {assessments.map(assessment => (
                <AssessmentCard key={assessment.id}>
                  <h3 style={{ color: '#2b3674', marginTop: 0, marginBottom: '20px' }}>{assessment.title}</h3>
                  
                  {assessment.questions && assessment.questions.map((q, idx) => (
                    <QuestionBlock key={q.id}>
                      <QuestionText>{idx + 1}. {q.question_text}</QuestionText>
                      
                      {q.type === 'multiple-choice' && q.choices && q.choices.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          {q.choices.map((choice, cIdx) => (
                            <ChoiceLabel key={cIdx} selected={answers[q.id] === choice}>
                              <input 
                                type="radio" 
                                name={`question-${q.id}`} 
                                value={choice}
                                checked={answers[q.id] === choice}
                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                style={{ accentColor: '#4318FF' }}
                              />
                              {choice}
                            </ChoiceLabel>
                          ))}
                        </div>
                      ) : (
                        <Input 
                          type="text" 
                          placeholder="Type your answer here..." 
                          value={answers[q.id] || ''}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        />
                      )}
                      
                      <Button 
                        onClick={() => handleSubmitResponse(q.id)} 
                        disabled={!answers[q.id] || submitting}
                      >
                        <FiCheckCircle /> Submit Answer
                      </Button>
                    </QuestionBlock>
                  ))}
                </AssessmentCard>
              ))}
            </div>
          )}
        </MainContent>
        
        <div>
          <MainContent style={{ padding: '20px' }}>
            <h3 style={{ marginTop: 0, color: '#2b3674' }}>Course Content</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {lessons.map(l => (
                <li 
                  key={l.id} 
                  onClick={() => setActiveLessonId(l.id)}
                  style={{ 
                    padding: '15px', 
                    background: activeLessonId === l.id ? '#f4f7fe' : 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px', 
                    color: activeLessonId === l.id ? '#4318FF' : '#64748b', 
                    fontWeight: activeLessonId === l.id ? '600' : '400', 
                    marginBottom: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  🎥 {l.title}
                </li>
              ))}
              {assessments.map(a => (
                <li key={a.id} style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#64748b', marginBottom: '10px' }}>
                  📝 {a.title}
                </li>
              ))}
            </ul>
          </MainContent>
        </div>
      </ContentGrid>
      
      <ToastContainer />
    </PageContainer>
  );
};

export default CoursePlayer;