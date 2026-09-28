import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';
import Carousel from '../components/Carousel';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiShoppingCart, FiPlayCircle, FiBookOpen, FiUser, FiChevronDown, FiChevronUp } from 'react-icons/fi';

// ----------------- STYLED COMPONENTS -----------------

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const CatalogContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'Inter', sans-serif;
`;

const HeaderSection = styled.div`
  text-align: center;
  margin: 40px 0 60px 0;
  animation: ${fadeIn} 0.6s ease-out;

  h1 {
    font-size: 3rem;
    color: #1e293b;
    font-weight: 800;
    margin-bottom: 15px;
    letter-spacing: -1px;

    span {
      background: linear-gradient(135deg, #4318FF 0%, #868CFF 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }

  p {
    font-size: 1.1rem;
    color: #64748b;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }
`;

const CategorySection = styled.div`
  margin-bottom: 60px;
  animation: ${fadeIn} 0.8s ease-out;
`;

const CategoryTitle = styled.h2`
  font-size: 1.8rem;
  color: #1e293b;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 12px;
  
  &::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 30px;
    background: linear-gradient(180deg, #4318FF, #868CFF);
    border-radius: 4px;
  }
`;

const CourseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
`;

const CourseCard = styled.div`
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  flex-direction: column;
  position: relative;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(67, 24, 255, 0.15);
    border-color: #e2e8f0;
  }
`;

const ThumbnailContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
  overflow: hidden;
  background: #f8fafc;
`;

const Thumbnail = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;

  ${CourseCard}:hover & {
    transform: scale(1.05);
  }
`;

const CardContent = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const CourseCategory = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: #4318FF;
  background: rgba(67, 24, 255, 0.1);
  padding: 4px 10px;
  border-radius: 12px;
  align-self: flex-start;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CourseTitle = styled.h3`
  font-size: 1.15rem;
  color: #1e293b;
  margin: 0 0 10px 0;
  line-height: 1.4;
  font-weight: 700;
  
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CourseDescription = styled.p`
  color: #64748b;
  font-size: 0.9rem;
  margin: 0 0 15px 0;
  line-height: 1.5;
  flex-grow: 1;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const InstructorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
  font-size: 0.85rem;
  margin-bottom: 20px;
  
  svg { color: #64748b; }
`;

const CardActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: auto;
  border-top: 1px solid #f1f5f9;
  padding-top: 15px;
`;

const ViewButton = styled(Link)`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background: #f8fafc;
  color: #1e293b;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 10px;
  transition: all 0.2s ease;

  &:hover {
    background: #e2e8f0;
    color: #4318FF;
  }
`;

const AddToCartButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background: ${props => props.$inCart ? '#10b981' : 'linear-gradient(135deg, #4318FF 0%, #868CFF 100%)'};
  color: white;
  border: none;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px ${props => props.$inCart ? 'rgba(16, 185, 129, 0.3)' : 'rgba(67, 24, 255, 0.3)'};
  }
`;

const SeeMoreButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 30px auto 0;
  padding: 12px 28px;
  background: white;
  color: #4318FF;
  border: 2px solid #4318FF;
  border-radius: 30px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(67, 24, 255, 0.05);
    transform: translateY(-2px);
  }
`;

const ErrorMessage = styled.div`
  background: #fee2e2;
  color: #ef4444;
  padding: 15px 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 500;
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 50px;
  color: #64748b;
  font-size: 1.2rem;
  font-weight: 500;
`;

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [carouselImages, setCarouselImages] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const location = useLocation();
  const { cart, addToCart } = useCart();

  const categories = [
    'Grade Four Tutorial', 'Grade Five Tutorial', 'Grade Six Tutorial',
    'Grade Seven Tutorial', 'Grade Eight Tutorial', 'Grade Nine Tutorial',
    'Grade Ten Tutorial', 'Grade Eleven Tutorial', 'Grade Twelve Tutorial',
    'Web Development', 'App Development'
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [courseRes, carouselRes] = await Promise.all([
        axios.get('http://localhost:5000/api/courses'),
        axios.get('http://localhost:5000/api/carousel')
      ]);
      setCourses(courseRes.data);
      setCarouselImages(carouselRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load courses');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('search')?.toLowerCase() || '';
    const type = params.get('type') || 'any';

    let filtered;
    if (!query) {
      filtered = courses;
    } else if (type === 'title') {
      filtered = courses.filter(course => course.title.toLowerCase().includes(query));
    } else if (type === 'category') {
      filtered = courses.filter(course => course.category.toLowerCase() === query);
    } else {
      filtered = courses.filter(course => 
        course.title.toLowerCase().includes(query) || 
        course.category.toLowerCase().includes(query)
      );
    }
    setFilteredCourses(filtered);
  }, [courses, location.search]);

  const groupedCourses = categories.reduce((acc, category) => {
    acc[category] = filteredCourses.filter(course => course.category === category);
    return acc;
  }, {});

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleAddToCart = useCallback((course) => {
    addToCart(course);
    toast.success(`Added ${course.title} to cart!`, {
      position: "top-right",
      autoClose: 2000,
    });
  }, [addToCart]);

  const isCourseInCart = useCallback((courseId) => {
    return cart.some(item => item.id === courseId);
  }, [cart]);

  const DISPLAY_LIMIT = 4; // Better suited for 4-column grid

  return (
    <>
      <Carousel images={carouselImages} />
      <CatalogContainer>
        <HeaderSection>
          <h1>Welcome to <span>E-Learning</span></h1>
        <p>Unlock your potential with our expertly crafted tutorials and courses designed to elevate your skills to the next level.</p>
      </HeaderSection>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      {loading ? (
        <LoadingSpinner>Loading amazing courses for you...</LoadingSpinner>
      ) : filteredCourses.length === 0 ? (
        <LoadingSpinner>No courses match your search criteria. Try a different keyword.</LoadingSpinner>
      ) : (
        categories.map(category => {
          const categoryCourses = groupedCourses[category] || [];
          const isExpanded = expandedCategories[category];
          const visibleCourses = isExpanded ? categoryCourses : categoryCourses.slice(0, DISPLAY_LIMIT);
          
          return categoryCourses.length > 0 ? (
            <CategorySection key={category}>
              <CategoryTitle>{category}</CategoryTitle>
              <CourseGrid>
                {visibleCourses.map(course => (
                  <CourseCard key={course.id}>
                    <ThumbnailContainer>
                      {course.thumbnail_url ? (
                        <Thumbnail 
                          src={course.thumbnail_url.startsWith('http') ? course.thumbnail_url : `http://localhost:5000${course.thumbnail_url}`} 
                          alt={course.title} 
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x225?text=No+Image';
                          }}
                        />
                      ) : (
                        <Thumbnail src="https://via.placeholder.com/400x225?text=No+Image" alt="Placeholder" />
                      )}
                    </ThumbnailContainer>
                    
                    <CardContent>
                      <CourseCategory>{course.category}</CourseCategory>
                      <CourseTitle>{course.title}</CourseTitle>
                      <CourseDescription>{course.description}</CourseDescription>
                      
                      <InstructorInfo>
                        <FiUser /> Instructor ID: {course.instructor_id}
                      </InstructorInfo>
                      
                      <CardActions>
                        <ViewButton to={`/course/${course.id}`}>
                          <FiPlayCircle /> View
                        </ViewButton>
                        
                        {isCourseInCart(course.id) ? (
                          <AddToCartButton as={Link} to="/cart" $inCart={true}>
                            Go to Cart
                          </AddToCartButton>
                        ) : (
                          <AddToCartButton onClick={() => handleAddToCart(course)}>
                            <FiShoppingCart /> Add
                          </AddToCartButton>
                        )}
                      </CardActions>
                    </CardContent>
                  </CourseCard>
                ))}
              </CourseGrid>
              
              {categoryCourses.length > DISPLAY_LIMIT && (
                <SeeMoreButton onClick={() => toggleCategory(category)}>
                  {isExpanded ? (
                    <>Show Less <FiChevronUp /></>
                  ) : (
                    <>View All {categoryCourses.length} Courses <FiChevronDown /></>
                  )}
                </SeeMoreButton>
              )}
            </CategorySection>
          ) : null;
        })
      )}
      <ToastContainer />
    </CatalogContainer>
    </>
  );
};

export default React.memo(CourseCatalog);