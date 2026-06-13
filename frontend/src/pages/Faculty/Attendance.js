import React, { useState, useEffect } from 'react';
import api from '../../api/api';

const Attendance = () => {
  const [sections, setSections] = useState([]);
  const [selected, setSelected] = useState('');
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/faculty/sections');
        setSections(res.data || []);
      } catch (err) { }
    };
    fetch();
  }, []);

  const loadStudents = async (sec) => {
    try {
      const res = await api.get(`/faculty/section-students?sectionID=${sec}`);
      setStudents(res.data || []);
    } catch (err) { }
  };

  const toggle = (idx) => {
    const copy = [...students];
    copy[idx].present = !copy[idx].present;
    setStudents(copy);
  };

  const submit = async () => {
    const payload = students.map(s => ({ studentID: s.student_id, present: s.present }));
    await api.post('/faculty/mark-attendance', { sectionID: selected, attendances: payload });
    alert('Attendance submitted');
  };

  return (
    <div className="container mt-4">
      <h3>Mark Attendance</h3>
      <div className="mb-3">
        <select className="form-select" value={selected} onChange={e => { setSelected(e.target.value); loadStudents(e.target.value); }}>
          <option value="">Select section</option>
          {sections.map(s => <option key={s.section_id} value={s.section_id}>{s.section_name}</option>)}
        </select>
      </div>

      <table className="table">
        <thead><tr><th>Student</th><th>Present</th></tr></thead>
        <tbody>
          {students.map((st, i) => (
            <tr key={st.student_id}>
              <td>{st.name}</td>
              <td><input type="checkbox" checked={!!st.present} onChange={() => toggle(i)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn btn-primary" onClick={submit}>Submit</button>
    </div>
  );
};

export default Attendance;
