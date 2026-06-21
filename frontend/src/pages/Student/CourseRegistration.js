import React, { useEffect, useState } from 'react';
import api from '../../api/api';

const CourseRegistration = () => {
  const [courses, setCourses] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/student/available-courses');
      setCourses(res.data || []);
    } catch (err) {
      console.error(err);
      setMessage({
        type: 'danger',
        text: 'Could not load available courses catalog.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleEnroll = async () => {
    if (!selectedSection) {
      return setMessage({
        type: 'warning',
        text: 'Please select a course section from the dropdown list before registering.'
      });
    }
    
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await api.post('/student/enroll', { 
        studentID: localStorage.getItem('referenceID'), 
        sectionID: Number(selectedSection) 
      });
      setMessage({
        type: 'success',
        text: res.data.message || 'Course registration request successfully submitted!'
      });
      setSelectedSection('');
      fetchCourses();
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Enrollment request failed'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-4 pb-5">
      <div className="mb-4 text-start">
        <h3 className="fw-bold text-white">Course Registry Portal</h3>
        <p className="text-secondary">Choose a section from available semester offerings to submit a registration request. Maximum limit is 18 credit hours per semester.</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8 col-12">
          <div className="glass-card p-4 text-start">
            <h5 className="fw-semibold text-white mb-4">Register New Class Section</h5>
            
            {message && (
              <div className={`alert alert-${message.type === 'success' ? 'success' : message.type === 'warning' ? 'warning' : 'danger'} mb-4 py-2 small`}>
                {message.text}
              </div>
            )}

            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-info" role="status" />
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-4 text-secondary italic">
                No new course offerings are currently available for registration.
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <label className="form-label text-secondary small fw-medium">Available Class Offerings</label>
                  <select 
                    className="form-select form-glass-control" 
                    value={selectedSection} 
                    onChange={e => setSelectedSection(e.target.value)}
                  >
                    <option value="">-- Choose Course Section --</option>
                    {courses.map(c => {
                      const secId = c.SECTION_ID || c.section_id;
                      const courseCode = c.COURSE_CODE || c.course_code;
                      const sectionName = c.SECTION_NAME || c.section_name;
                      const seats = c.AVAILABLE_SEATS !== undefined ? c.AVAILABLE_SEATS : c.available_seats;
                      const instructor = c.FACULTY_NAME || c.faculty_name || 'TBD';

                      return (
                        <option key={secId} value={secId}>
                          {courseCode} - {sectionName} | Instructor: {instructor} | ({seats} seats free)
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="text-end">
                  <button 
                    className="btn btn-glass px-4 py-2 fw-bold" 
                    onClick={handleEnroll}
                    disabled={submitting || !selectedSection}
                  >
                    {submitting ? 'Submitting Request...' : 'Submit Enrollment Request'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseRegistration;
