import React, { useEffect, useState } from 'react';
import api from '../../api/api';

const Library = () => {
  const [overdue, setOverdue] = useState([]);

  useEffect(() => {
    const loadOverdue = async () => {
      try {
        const res = await api.get('/student/library-overdue');
        setOverdue(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadOverdue();
  }, []);

  return (
    <div className="container mt-4">
      <h3>Library Overdue</h3>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Issue ID</th>
            <th>Student</th>
            <th>Title</th>
            <th>Due Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {overdue.map(item => (
            <tr key={item.ISSUE_ID}>
              <td>{item.ISSUE_ID}</td>
              <td>{item.STUDENT_NAME}</td>
              <td>{item.TITLE}</td>
              <td>{item.DUE_DATE ? new Date(item.DUE_DATE).toLocaleDateString() : ''}</td>
              <td>{item.STATUS}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Library;
