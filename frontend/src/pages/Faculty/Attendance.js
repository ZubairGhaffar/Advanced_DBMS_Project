import React, { useState, useEffect } from 'react';
import api from '../../api/api';

const Attendance = () => {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedLecture, setSelectedLecture] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await api.get('/faculty/sections');
        setSections(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSections();
  }, []);

  const loadStudents = async (secId, lecNum) => {
    if (!secId || !lecNum) {
      setStudents([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/faculty/section-students?sectionID=${secId}&lectureNumber=${lecNum}`);
      // Default to present unless explicitly marked absent in DB
      setStudents((res.data || []).map(student => ({ 
        ...student, 
        present: student.ATTENDANCE_STATUS ? (student.ATTENDANCE_STATUS === 'Present') : true 
      })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStudent = (idx) => {
    const copy = [...students];
    copy[idx] = { ...copy[idx], present: !copy[idx].present };
    setStudents(copy);
  };

  const markAll = (status) => {
    setStudents(prev => prev.map(s => ({ ...s, present: status })));
  };

  const handleSubmit = async () => {
    if (!selectedSection || !selectedLecture) return;
    setSubmitting(true);
    const payload = students.map(s => ({ 
      studentID: s.STUDENT_ID || s.student_id, 
      present: s.present ? 'true' : 'false' // match DB expect 'true'/'false' strings
    }));
    try {
      await api.post('/faculty/mark-attendance', { 
        sectionID: Number(selectedSection), 
        lectureNumber: Number(selectedLecture),
        attendances: payload 
      });
      alert(`Lecture ${selectedLecture} attendance successfully finalized and recorded.`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to submit attendance');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-4 pb-5">
      <div className="mb-4 text-start">
        <h3 className="fw-bold text-white">Class Daily Attendance Registry</h3>
        <p className="text-secondary">Select an active section and lecture number to roll-call students and record daily attendance logs.</p>
      </div>

      <div className="glass-card mb-4 p-4">
        <div className="row align-items-center">
          <div className="col-md-5 text-start">
            <label className="form-label text-secondary small fw-medium">Active Class Section</label>
            <select 
              className="form-select form-glass-control" 
              value={selectedSection} 
              onChange={e => { 
                const sec = e.target.value;
                setSelectedSection(sec); 
                loadStudents(sec, selectedLecture); 
              }}
            >
              <option value="">-- Choose Section --</option>
              {sections.map(s => (
                <option key={s.SECTION_ID || s.section_id} value={s.SECTION_ID || s.section_id}>
                  {s.SECTION_NAME || s.section_name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3 text-start mt-3 mt-md-0">
            <label className="form-label text-secondary small fw-medium">Lecture (1-16)</label>
            <select 
              className="form-select form-glass-control" 
              value={selectedLecture} 
              onChange={e => { 
                const lec = e.target.value;
                setSelectedLecture(lec); 
                loadStudents(selectedSection, lec); 
              }}
            >
              <option value="">-- Choose Lecture --</option>
              {Array.from({ length: 16 }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>Lecture {num}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4 text-md-end mt-3 mt-md-0">
            {students.length > 0 && (
              <div className="d-flex justify-content-md-end gap-2">
                <button className="btn btn-glass-secondary btn-sm" onClick={() => markAll(true)}>Mark All Present</button>
                <button className="btn btn-glass-secondary btn-sm" onClick={() => markAll(false)}>Mark All Absent</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center my-5">
          <div className="spinner-border text-info" role="status">
            <span className="visually-hidden">Loading section roster...</span>
          </div>
        </div>
      )}

      {!loading && selectedSection && selectedLecture && students.length === 0 && (
        <div className="glass-card text-center p-5">
          <h5 className="text-secondary">No Registered Students</h5>
          <p className="text-secondary mb-0">No students are currently enrolled in this class section.</p>
        </div>
      )}

      {!loading && (!selectedSection || !selectedLecture) && (
        <div className="glass-card text-center p-5">
          <h5 className="text-secondary">Section or Lecture Not Selected</h5>
          <p className="text-secondary mb-0">Choose both a course section and a lecture number from the options above to view the roster.</p>
        </div>
      )}

      {!loading && selectedSection && selectedLecture && students.length > 0 && (
        <div>
          {/* Card list of students */}
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mb-4">
            {students.map((st, i) => {
              const name = st.STUDENT_NAME || st.student_name || `Student #${st.STUDENT_ID || st.student_id}`;
              const id = st.STUDENT_ID || st.student_id;
              const isPresent = st.present;

              return (
                <div key={id} className="col">
                  <div 
                    onClick={() => toggleStudent(i)}
                    className="glass-card p-3 d-flex align-items-center justify-content-between text-start"
                    style={{ 
                      cursor: 'pointer',
                      borderLeft: isPresent ? '4px solid #00e676' : '4px solid #ff3d00',
                      background: isPresent ? 'rgba(0, 230, 118, 0.03)' : 'rgba(255, 61, 0, 0.03)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div 
                        className="d-flex align-items-center justify-content-center text-white fw-bold rounded-circle"
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          background: isPresent ? 'linear-gradient(135deg, #00e676, #00b0ff)' : 'linear-gradient(135deg, #ff3d00, #d500f9)',
                          fontSize: '0.9rem'
                        }}
                      >
                        {name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <div>
                        <div className="fw-semibold text-white small">{name}</div>
                        <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>ID: {id}</div>
                      </div>
                    </div>

                    <div>
                      {isPresent ? (
                        <span className="badge-glass badge-glass-success py-1 px-2">Present</span>
                      ) : (
                        <span className="badge-glass badge-glass-danger py-1 px-2">Absent</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-end mt-4">
            <button 
              className="btn btn-glass px-5 py-3 fw-bold" 
              onClick={handleSubmit} 
              disabled={submitting || !students.length}
            >
              {submitting ? 'Finalizing...' : 'Save & Submit Attendance'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
