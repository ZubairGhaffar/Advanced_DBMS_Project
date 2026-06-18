import React, { useEffect, useState } from 'react';
import api from '../../api/api';

const Hostel = () => {
  const [hostels, setHostels] = useState([]);
  const [allotments, setAllotments] = useState([]);
  const [students, setStudents] = useState([]);
  
  const [activeTab, setActiveTab] = useState('allotments');
  const [loading, setLoading] = useState(true);

  // Allotment form
  const [studentID, setStudentID] = useState('');
  const [hostelID, setHostelID] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [message, setMessage] = useState(null);
  const [allocating, setAllocating] = useState(false);

  // New Hostel form
  const [hostelName, setHostelName] = useState('');
  const [totalRooms, setTotalRooms] = useState(50);
  const [addingHostel, setAddingHostel] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resHostels, resAllotments, resStudents] = await Promise.all([
        api.get('/admin/hostels'),
        api.get('/admin/hostel-allotments'),
        api.get('/admin/students')
      ]);
      setHostels(resHostels.data || []);
      setAllotments(resAllotments.data || []);
      setStudents(resStudents.data || []);

      // Default dropdown selections
      if (resStudents.data?.length > 0) setStudentID(resStudents.data[0].STUDENT_ID);
      if (resHostels.data?.length > 0) setHostelID(resHostels.data[0].HOSTEL_ID);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAllocate = async (e) => {
    e.preventDefault();
    if (!studentID || !hostelID || !roomNumber) {
      return setMessage('Student ID, hostel ID and room number are required.');
    }
    setAllocating(true);
    setMessage(null);

    try {
      await api.post('/admin/allocate-hostel', {
        studentID: Number(studentID),
        hostelID: Number(hostelID),
        roomNumber
      });
      alert('Room allocated successfully.');
      setRoomNumber('');
      setActiveTab('allotments');
      loadData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to allocate hostel room.');
    } finally {
      setAllocating(false);
    }
  };

  const handleAddHostel = async (e) => {
    e.preventDefault();
    if (!hostelName || !totalRooms) return;
    setAddingHostel(true);

    try {
      await api.post('/admin/hostels', { hostelName, totalRooms: Number(totalRooms) });
      alert('New hostel created successfully.');
      setHostelName('');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create hostel.');
    } finally {
      setAddingHostel(false);
    }
  };

  return (
    <div className="container mt-4 pb-5 text-start">
      <div className="mb-4">
        <h3 className="fw-bold text-white">Hostel Accommodation Board</h3>
        <p className="text-secondary">Allot hostel rooms to active students, view current hostel occupancy, and manage student residence halls.</p>
      </div>

      {/* Tabs */}
      <div className="d-flex border-bottom border-white-5 mb-4 gap-2">
        <button className={`btn py-2 px-4 border-0 rounded-0 ${activeTab === 'allotments' ? 'btn-glass text-white' : 'btn-glass-secondary text-secondary'}`} onClick={() => setActiveTab('allotments')}>Active Allotments</button>
        <button className={`btn py-2 px-4 border-0 rounded-0 ${activeTab === 'hostels' ? 'btn-glass text-white' : 'btn-glass-secondary text-secondary'}`} onClick={() => setActiveTab('hostels')}>Hostel Inventories</button>
        <button className={`btn py-2 px-4 border-0 rounded-0 ${activeTab === 'form' ? 'btn-glass text-white' : 'btn-glass-secondary text-secondary'}`} onClick={() => setActiveTab('form')}>New Allotment</button>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-info" role="status">
            <span className="visually-hidden">Loading housing registry...</span>
          </div>
        </div>
      ) : (
        <div>
          {/* --- TAB 1: ALLOTMENTS --- */}
          {activeTab === 'allotments' && (
            <div className="glass-card p-4">
              <h5 className="fw-semibold text-white mb-4">Current Resident Allotments</h5>
              <div className="table-responsive">
                <table className="table-glass">
                  <thead>
                    <tr>
                      <th className="text-start">Allotment ID</th>
                      <th>Student</th>
                      <th>Hostel Hall</th>
                      <th>Room</th>
                      <th>Start Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allotments.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-5 text-secondary">No active hostel allotments found.</td>
                      </tr>
                    ) : (
                      allotments.map(al => (
                        <tr key={al.ALLOTMENT_ID}>
                          <td className="text-start"><code>{al.ALLOTMENT_ID}</code></td>
                          <td>
                            <div className="fw-semibold text-white">{al.STUDENT_NAME}</div>
                            <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>ID: {al.STUDENT_ID}</div>
                          </td>
                          <td className="small text-light">{al.HOSTEL_NAME}</td>
                          <td><span className="badge-glass badge-glass-info">{al.ROOM_NUMBER}</span></td>
                          <td className="small text-secondary">{new Date(al.START_DATE).toLocaleDateString()}</td>
                          <td>
                            <span className="badge-glass badge-glass-success">{al.STATUS || 'Allocated'}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- TAB 2: HOSTELS --- */}
          {activeTab === 'hostels' && (
            <div className="row gy-4">
              {/* Hostels List */}
              <div className="col-lg-8">
                <div className="glass-card p-4">
                  <h5 className="fw-semibold text-white mb-4">Residence Halls Occupancy</h5>
                  <div className="table-responsive">
                    <table className="table-glass">
                      <thead>
                        <tr>
                          <th className="text-start">Hostel ID</th>
                          <th>Hostel Name</th>
                          <th>Occupied Rooms</th>
                          <th>Available / Capacity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hostels.map(h => {
                          const occupied = h.TOTAL_ROOMS - h.AVAILABLE_ROOMS;
                          return (
                            <tr key={h.HOSTEL_ID}>
                              <td className="text-start"><code>{h.HOSTEL_ID}</code></td>
                              <td className="fw-semibold text-white">{h.HOSTEL_NAME}</td>
                              <td>{occupied} Rooms</td>
                              <td>
                                <span className={`badge-glass ${h.AVAILABLE_ROOMS > 0 ? 'badge-glass-success' : 'badge-glass-danger'}`}>
                                  {h.AVAILABLE_ROOMS} / {h.TOTAL_ROOMS} Free
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Add Hostel Form */}
              <div className="col-lg-4">
                <div className="glass-card p-4">
                  <h5 className="fw-semibold text-white mb-4">Create Residence Hall</h5>
                  <form onSubmit={handleAddHostel}>
                    <div className="mb-3">
                      <label className="form-label text-secondary small">Hostel Hall Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Liaquat Hall"
                        className="form-control form-glass-control"
                        value={hostelName}
                        onChange={e => setHostelName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-secondary small">Total Rooms Capacity</label>
                      <input
                        type="number"
                        className="form-control form-glass-control"
                        value={totalRooms}
                        onChange={e => setTotalRooms(Number(e.target.value))}
                        required
                      />
                    </div>
                    <div className="d-grid mt-4">
                      <button className="btn btn-glass py-2" type="submit" disabled={addingHostel}>
                        {addingHostel ? 'Registering...' : 'Add Residence Hall'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB 3: ALLOTMENT FORM --- */}
          {activeTab === 'form' && (
            <div className="row justify-content-center">
              <div className="col-md-6">
                <div className="glass-card p-5">
                  <h4 className="fw-bold text-white mb-4 text-center">New Room Allocation</h4>
                  {message && <div className="alert alert-info border-0 text-white small py-2 mb-4" style={{ background: 'rgba(0,168,204,0.1)' }}>{message}</div>}

                  <form onSubmit={handleAllocate}>
                    <div className="mb-4">
                      <label className="form-label text-secondary small">Select Student</label>
                      <select
                        className="form-select form-glass-control"
                        value={studentID}
                        onChange={e => setStudentID(e.target.value)}
                        required
                      >
                        <option value="" disabled>-- Select Student --</option>
                        {students.map(s => (
                          <option key={s.STUDENT_ID} value={s.STUDENT_ID}>
                            ID: {s.STUDENT_ID} - {s.FIRST_NAME} {s.LAST_NAME} ({s.PROGRAM_NAME})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="form-label text-secondary small">Select Residence Hall</label>
                      <select
                        className="form-select form-glass-control"
                        value={hostelID}
                        onChange={e => setHostelID(e.target.value)}
                        required
                      >
                        <option value="" disabled>-- Select Hostel --</option>
                        {hostels.filter(h => h.AVAILABLE_ROOMS > 0).map(h => (
                          <option key={h.HOSTEL_ID} value={h.HOSTEL_ID}>
                            {h.HOSTEL_NAME} ({h.AVAILABLE_ROOMS} rooms left)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="form-label text-secondary small">Room Number</label>
                      <input
                        className="form-control form-glass-control"
                        placeholder="e.g. 104-B"
                        value={roomNumber}
                        onChange={e => setRoomNumber(e.target.value)}
                        required
                      />
                    </div>

                    <div className="d-grid mt-5">
                      <button className="btn btn-glass py-3 fw-bold" type="submit" disabled={allocating || hostels.length === 0}>
                        {allocating ? 'Allotting room...' : 'Confirm Allotment'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Hostel;
