import React, { useState } from 'react';
import api from '../../api/api';

const Hostel = () => {
  const [studentID, setStudentID] = useState('');
  const [hostelID, setHostelID] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [message, setMessage] = useState(null);

  const handleAllocate = async () => {
    if (!studentID || !hostelID || !roomNumber) {
      return setMessage('Student ID, hostel ID and room number are required.');
    }

    try {
      const res = await api.post('/admin/allocate-hostel', {
        studentID: Number(studentID),
        hostelID: Number(hostelID),
        roomNumber
      });
      setMessage(`Hostel allocated: ${res.data.allotmentID}`);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to allocate hostel.');
    }
  };

  return (
    <div className="container mt-4">
      <h3>Hostel Allocation</h3>
      <div className="card p-3">
        <div className="mb-3">
          <label className="form-label">Student ID</label>
          <input className="form-control" value={studentID} onChange={e => setStudentID(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Hostel ID</label>
          <input className="form-control" value={hostelID} onChange={e => setHostelID(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Room Number</label>
          <input className="form-control" value={roomNumber} onChange={e => setRoomNumber(e.target.value)} />
        </div>
        {message && <div className="alert alert-info">{message}</div>}
        <button className="btn btn-primary" onClick={handleAllocate}>Allocate Room</button>
      </div>
    </div>
  );
};

export default Hostel;
