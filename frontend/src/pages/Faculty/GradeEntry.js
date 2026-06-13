import React, { useState } from 'react';
import api from '../../api/api';

const GradeEntry = () => {
  const [section, setSection] = useState('');
  const [grades, setGrades] = useState([]);

  const loadStudents = async () => {
    const res = await api.get(`/faculty/section-students?sectionID=${section}`);
    setGrades(res.data.map(s => ({ studentID: s.student_id, studentName: s.student_name, grade: '' })));
  };

  const submit = async () => {
    await api.post('/faculty/submit-grades', { sectionID: section, grades });
    alert('Grades submitted');
  };

  return (
    <div className="container mt-4">
      <h3>Grade Entry</h3>
      <div className="mb-3">
        <input className="form-control" value={section} onChange={e => setSection(e.target.value)} placeholder="Section ID" />
      </div>
      <button className="btn btn-secondary mb-3" onClick={loadStudents}>Load Students</button>

      {grades.map((g, i) => (
        <div className="mb-2" key={g.studentID}>
          <span className="me-2">{g.studentName || g.studentID}</span>
          <input className="form-control d-inline-block" style={{width:120}} value={g.grade} onChange={e => { const copy=[...grades]; copy[i].grade=e.target.value; setGrades(copy); }} />
        </div>
      ))}

      <button className="btn btn-primary" onClick={submit}>Submit Grades</button>
    </div>
  );
};

export default GradeEntry;
