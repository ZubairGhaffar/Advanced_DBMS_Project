import React, { useState, useEffect } from 'react';
import api from '../../api/api';

const GradeEntry = () => {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [grades, setGrades] = useState([]);
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

  const loadStudents = async (secId) => {
    if (!secId) {
      setGrades([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/faculty/section-students?sectionID=${secId}`);
      // Default to empty grades
      setGrades((res.data || []).map(s => ({
        studentID: s.STUDENT_ID || s.student_id,
        studentName: s.STUDENT_NAME || s.student_name,
        grade: ''
      })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (idx, value) => {
    const copy = [...grades];
    copy[idx].grade = value;
    setGrades(copy);
  };

  const submitGrades = async () => {
    if (!selectedSection) return;
    
    // Check if any grades are left unselected
    const unassigned = grades.filter(g => !g.grade);
    if (unassigned.length > 0) {
      if (!window.confirm(`There are ${unassigned.length} students without grades assigned. Submit anyway?`)) {
        return;
      }
    }

    setSubmitting(true);
    // Format payload
    const payload = grades.map(g => ({
      studentID: g.studentID,
      grade: g.grade || 'F' // Default to F if empty
    }));

    try {
      await api.post('/faculty/submit-grades', { sectionID: Number(selectedSection), grades: payload });
      alert('Class grades successfully finalized and updated.');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to submit grades');
    } finally {
      setSubmitting(false);
    }
  };

  const letterGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'F'];

  return (
    <div className="container mt-4 pb-5">
      <div className="mb-4 text-start">
        <h3 className="fw-bold text-white">Class Grade Registry</h3>
        <p className="text-secondary">Select an active section to input and finalize student letter grades for the semester.</p>
      </div>

      <div className="glass-card mb-4 p-4 text-start">
        <label className="form-label text-secondary small fw-medium">Active Class Section</label>
        <select 
          className="form-select form-glass-control" 
          value={selectedSection} 
          onChange={e => {
            setSelectedSection(e.target.value);
            loadStudents(e.target.value);
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

      {loading && (
        <div className="text-center my-5">
          <div className="spinner-border text-info" role="status">
            <span className="visually-hidden">Loading section roster...</span>
          </div>
        </div>
      )}

      {!loading && selectedSection && grades.length === 0 && (
        <div className="glass-card text-center p-5">
          <h5 className="text-secondary">No Registered Students</h5>
          <p className="text-secondary mb-0">No students are currently enrolled in this class section.</p>
        </div>
      )}

      {!loading && !selectedSection && (
        <div className="glass-card text-center p-5">
          <h5 className="text-secondary">No Section Selected</h5>
          <p className="text-secondary mb-0">Choose a course section from the dropdown list above to view roster.</p>
        </div>
      )}

      {!loading && grades.length > 0 && (
        <div className="glass-card p-4">
          <div className="table-responsive">
            <table className="table-glass">
              <thead>
                <tr>
                  <th className="text-start" style={{ width: '40%' }}>Student Name</th>
                  <th>Student ID</th>
                  <th>Letter Grade Input</th>
                  <th>Status Indicator</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((g, i) => (
                  <tr key={g.studentID}>
                    <td className="text-start">
                      <div className="d-flex align-items-center gap-3">
                        <div 
                          className="d-flex align-items-center justify-content-center text-white fw-bold rounded-circle"
                          style={{ 
                            width: '32px', 
                            height: '32px', 
                            background: 'linear-gradient(135deg, #8c52ff, #d500f9)',
                            fontSize: '0.8rem'
                          }}
                        >
                          {g.studentName.split(' ').map(n=>n[0]).join('')}
                        </div>
                        <span className="fw-semibold text-white">{g.studentName}</span>
                      </div>
                    </td>
                    <td>
                      <code className="text-secondary">{g.studentID}</code>
                    </td>
                    <td>
                      <select 
                        className="form-select form-glass-control d-inline-block mx-auto"
                        style={{ width: '140px' }}
                        value={g.grade}
                        onChange={e => handleGradeChange(i, e.target.value)}
                      >
                        <option value="">-- Grade --</option>
                        {letterGrades.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </td>
                    <td>
                      {g.grade ? (
                        <span className="badge-glass badge-glass-success">Assigned</span>
                      ) : (
                        <span className="badge-glass badge-glass-warning">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-end mt-4">
            <button 
              className="btn btn-glass px-5 py-3 fw-bold" 
              onClick={submitGrades}
              disabled={submitting}
            >
              {submitting ? 'Finalizing Grades...' : 'Submit & Finalize Grades'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeEntry;
