import React, { useEffect, useState } from 'react';
import api from '../../api/api';

const CourseRegistration = () => {
  const [courses, setCourses] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/student/available-courses');
        setCourses(res.data || []);
      } catch (err) {
        console.error(err);
        setMessage('Could not load available courses.');
      }
    };
    fetch();
  }, []);

  const handleEnroll = async () => {
    if (!selectedSection) {
      return setMessage('Choose a section before enrolling.');
    }
    try {
      await api.post('/student/enroll', { studentID: localStorage.getItem('referenceID'), sectionID: selectedSection });
      setMessage('Enrollment successful.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Enrollment failed');
    }
  };

  return (
    <div className="container mt-4">
      <h3>Course Registration</h3>
      {message && <div className="alert alert-info">{message}</div>}
      <div className="mb-3">
        <select className="form-select" value={selectedSection} onChange={e => setSelectedSection(e.target.value)}>
          <option value="">Select section</option>
          {courses.map(c => (
            <option key={c.section_id} value={c.section_id}>{c.course_code} - {c.section_name} ({c.available_seats} seats)</option>
          ))}
        </select>
      </div>
      <button className="btn btn-primary" onClick={handleEnroll}>Enroll</button>
    </div>
  );
};

export default CourseRegistration;
