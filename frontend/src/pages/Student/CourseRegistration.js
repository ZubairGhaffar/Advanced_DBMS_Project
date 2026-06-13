import React, { useEffect, useState } from 'react';
import api from '../../api/api';

const CourseRegistration = () => {
  const [courses, setCourses] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/student/available-courses');
        setCourses(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, []);

  const handleEnroll = async () => {
    try {
      await api.post('/student/enroll', { studentID: localStorage.getItem('referenceID'), sectionID: selectedSection });
      alert('Enrolled');
    } catch (err) {
      alert(err.response?.data?.message || 'Enrollment failed');
    }
  };

  return (
    <div className="container mt-4">
      <h3>Course Registration</h3>
      <div className="mb-3">
        <select className="form-select" value={selectedSection} onChange={e => setSelectedSection(e.target.value)}>
          <option value="">Select section</option>
          {courses.map(c => (
            <option key={c.section_id} value={c.section_id}>{c.course_code} - {c.section_name}</option>
          ))}
        </select>
      </div>
      <button className="btn btn-primary" onClick={handleEnroll}>Enroll</button>
    </div>
  );
};

export default CourseRegistration;
