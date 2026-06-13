import React, { useEffect, useState } from 'react';
import api from '../../api/api';

const Workload = () => {
  const [workload, setWorkload] = useState([]);

  useEffect(() => {
    const fetchWorkload = async () => {
      try {
        const res = await api.get('/faculty/workload');
        setWorkload(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchWorkload();
  }, []);

  return (
    <div className="container mt-4">
      <h3>Faculty Workload</h3>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Section</th>
            <th>Course</th>
            <th>Enrolled</th>
            <th>Term</th>
          </tr>
        </thead>
        <tbody>
          {workload.map((row, index) => (
            <tr key={`${row.section_id}-${index}`}>
              <td>{row.rank || index + 1}</td>
              <td>{row.section_id}</td>
              <td>{row.course_name}</td>
              <td>{row.enrolled_students}</td>
              <td>{row.term}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Workload;
