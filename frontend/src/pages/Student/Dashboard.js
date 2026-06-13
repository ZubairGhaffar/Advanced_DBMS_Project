import React, { useEffect, useState, useContext } from 'react';
import api from '../../api/api';
import { AuthContext } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/student/dashboard');
        setData(res.data.data[0] || res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [user]);

  if (!data) return <div className="container mt-4">Loading dashboard...</div>;

  return (
    <div className="container mt-4">
      <h3>Student Dashboard</h3>
      <div className="row">
        <div className="col-md-4">
          <div className="card p-3">
            <strong>GPA</strong>
            <div className="display-6">{data.gpa}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3">
            <strong>Attendance %</strong>
            <div className="display-6">{data.attendance_percent}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3">
            <strong>Outstanding Fees</strong>
            <div className="display-6">{data.outstanding_fees}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
