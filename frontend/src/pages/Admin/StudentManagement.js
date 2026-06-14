import React, { useEffect, useState } from 'react';
import api from '../../api/api';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    cnic: '',
    programID: '',
    status: 'Active'
  });
  const [editingId, setEditingId] = useState(null);
  
  // Profile detailed view state
  const [profileDetails, setProfileDetails] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resStudents, resPrograms] = await Promise.all([
        api.get('/admin/students'),
        api.get('/admin/programs')
      ]);
      setStudents(resStudents.data || []);
      setPrograms(resPrograms.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      cnic: '',
      programID: programs[0]?.PROGRAM_ID || '',
      status: 'Active'
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (student) => {
    setEditingId(student.STUDENT_ID);
    setFormData({
      firstName: student.FIRST_NAME || '',
      lastName: student.LAST_NAME || '',
      email: student.EMAIL || '',
      password: '', // do not display password
      cnic: student.CNIC || '',
      programID: student.PROGRAM_ID || '',
      status: student.STATUS || 'Active'
    });
    setShowEditModal(true);
  };

  const handleOpenProfile = async (id) => {
    setShowProfileModal(true);
    setLoadingProfile(true);
    setProfileDetails(null);
    try {
      const res = await api.get(`/admin/students/${id}`);
      setProfileDetails(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load student detailed profile.');
      setShowProfileModal(false);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/students', formData);
      alert('Student and linked system user account successfully created.');
      setShowAddModal(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create student');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/students/${editingId}`, formData);
      alert('Student records successfully updated.');
      setShowEditModal(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update student');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you absolutely sure you want to delete this student? This will permanently remove their user account, grades, attendance logs, and fee payments.')) {
      try {
        await api.delete(`/admin/students/${id}`);
        alert('Student and user account deleted.');
        loadData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete student');
      }
    }
  };

  // Filter logic
  const filteredStudents = students.filter(student => {
    const name = `${student.FIRST_NAME} ${student.LAST_NAME}`.toLowerCase();
    const email = (student.EMAIL || '').toLowerCase();
    const query = search.toLowerCase();
    
    const matchesSearch = name.includes(query) || email.includes(query) || String(student.STUDENT_ID).includes(query);
    const matchesProgram = programFilter ? Number(student.PROGRAM_ID) === Number(programFilter) : true;
    const matchesStatus = statusFilter ? student.STATUS === statusFilter : true;
    
    return matchesSearch && matchesProgram && matchesStatus;
  });

  return (
    <div className="container mt-4 pb-5 text-start">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-white">Student Enrollment Manager</h3>
          <p className="text-secondary">Perform student registration, edit academic standing, view complete student records, or delete files.</p>
        </div>
        <button className="btn btn-glass" onClick={handleOpenAdd}>+ Register New Student</button>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card mb-4 p-3">
        <div className="row g-3">
          <div className="col-md-5">
            <input 
              type="text" 
              className="form-control form-glass-control" 
              placeholder="Search by name, email, or student ID..."
              value={search} 
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <select 
              className="form-select form-glass-control" 
              value={programFilter} 
              onChange={e => setProgramFilter(e.target.value)}
            >
              <option value="">-- All Programs --</option>
              {programs.map(p => <option key={p.PROGRAM_ID} value={p.PROGRAM_ID}>{p.PROGRAM_NAME}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <select 
              className="form-select form-glass-control" 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">-- All Statuses --</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Graduated">Graduated</option>
            </select>
          </div>
          <div className="col-md-2">
            <button className="btn btn-glass-secondary w-100" onClick={() => { setSearch(''); setProgramFilter(''); setStatusFilter(''); }}>Reset Filters</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-info" role="status">
            <span className="visually-hidden">Loading student directory...</span>
          </div>
        </div>
      ) : (
        <div className="glass-card p-4">
          <div className="table-responsive">
            <table className="table-glass">
              <thead>
                <tr>
                  <th className="text-start">Student Name</th>
                  <th>Student ID</th>
                  <th>Program</th>
                  <th>CNIC Number</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-secondary">
                      No student records found matching selection criteria.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(student => {
                    const status = student.STATUS || 'Active';
                    let statusClass = 'badge-glass-success';
                    if (status === 'Suspended') statusClass = 'badge-glass-danger';
                    if (status === 'Graduated') statusClass = 'badge-glass-info';

                    return (
                      <tr key={student.STUDENT_ID}>
                        <td className="text-start">
                          <div className="d-flex align-items-center gap-3">
                            <div 
                              className="d-flex align-items-center justify-content-center text-white fw-bold rounded-circle"
                              style={{ 
                                width: '36px', 
                                height: '36px', 
                                background: 'linear-gradient(135deg, #00a8cc, #8c52ff)',
                                fontSize: '0.85rem'
                              }}
                            >
                              {`${student.FIRST_NAME} ${student.LAST_NAME}`.split(' ').map(n=>n[0]).join('')}
                            </div>
                            <div>
                              <div className="fw-semibold text-white">{student.FIRST_NAME} {student.LAST_NAME}</div>
                              <div className="text-secondary small">{student.EMAIL}</div>
                            </div>
                          </div>
                        </td>
                        <td><code>{student.STUDENT_ID}</code></td>
                        <td className="small text-light">{student.PROGRAM_NAME}</td>
                        <td className="small text-secondary">{student.CNIC || 'N/A'}</td>
                        <td><span className={`badge-glass ${statusClass}`}>{status}</span></td>
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            <button className="btn btn-glass-secondary btn-sm py-1 px-2 text-info" onClick={() => handleOpenProfile(student.STUDENT_ID)}>View Card</button>
                            <button className="btn btn-glass-secondary btn-sm py-1 px-2 text-warning" onClick={() => handleOpenEdit(student)}>Edit</button>
                            <button className="btn btn-glass-secondary btn-sm py-1 px-2 text-danger" onClick={() => handleDelete(student.STUDENT_ID)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- ADD STUDENT MODAL --- */}
      {showAddModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modal-glass">
              <div className="modal-header modal-glass-header">
                <h5 className="modal-title fw-bold">Register New Student</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleAddSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label text-secondary small">First Name</label>
                      <input type="text" required className="form-control form-glass-control" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-secondary small">Last Name</label>
                      <input type="text" required className="form-control form-glass-control" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-secondary small">Email Address</label>
                      <input type="email" required className="form-control form-glass-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-secondary small">Account Password</label>
                      <input type="password" required className="form-control form-glass-control" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-secondary small">CNIC Number</label>
                      <input type="text" placeholder="12345-1234567-1" className="form-control form-glass-control" value={formData.cnic} onChange={e => setFormData({...formData, cnic: e.target.value})} />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-secondary small">Academic Program</label>
                      <select className="form-select form-glass-control" value={formData.programID} onChange={e => setFormData({...formData, programID: e.target.value})}>
                        {programs.map(p => <option key={p.PROGRAM_ID} value={p.PROGRAM_ID}>{p.PROGRAM_NAME}</option>)}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label text-secondary small">Status Standing</label>
                      <select className="form-select form-glass-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Graduated">Graduated</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer modal-glass-footer">
                  <button type="button" className="btn btn-glass-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-glass">Register Student</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT STUDENT MODAL --- */}
      {showEditModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modal-glass">
              <div className="modal-header modal-glass-header">
                <h5 className="modal-title fw-bold">Update Student Profile</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditModal(false)}></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label text-secondary small">First Name</label>
                      <input type="text" required className="form-control form-glass-control" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-secondary small">Last Name</label>
                      <input type="text" required className="form-control form-glass-control" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-secondary small">Email Address</label>
                      <input type="email" required className="form-control form-glass-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-secondary small">CNIC Number</label>
                      <input type="text" placeholder="12345-1234567-1" className="form-control form-glass-control" value={formData.cnic} onChange={e => setFormData({...formData, cnic: e.target.value})} />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-secondary small">Academic Program</label>
                      <select className="form-select form-glass-control" value={formData.programID} onChange={e => setFormData({...formData, programID: e.target.value})}>
                        {programs.map(p => <option key={p.PROGRAM_ID} value={p.PROGRAM_ID}>{p.PROGRAM_NAME}</option>)}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label text-secondary small">Status Standing</label>
                      <select className="form-select form-glass-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Graduated">Graduated</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer modal-glass-footer">
                  <button type="button" className="btn btn-glass-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-glass">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- ACADEMIC PROFILE DETAILED MODAL --- */}
      {showProfileModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content modal-glass">
              <div className="modal-header modal-glass-header">
                <h5 className="modal-title fw-bold">Student Academic Card</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowProfileModal(false)}></button>
              </div>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {loadingProfile ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-info" role="status">
                      <span className="visually-hidden">Loading detailed file...</span>
                    </div>
                  </div>
                ) : profileDetails ? (
                  <div>
                    {/* Header info */}
                    <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-white-5 pb-3">
                      <div>
                        <h4 className="fw-bold text-white mb-1">{profileDetails.student.FIRST_NAME} {profileDetails.student.LAST_NAME}</h4>
                        <div className="text-secondary small">Email: {profileDetails.student.EMAIL} | CNIC: {profileDetails.student.CNIC || 'N/A'}</div>
                        <div className="text-secondary small">Program: {profileDetails.student.PROGRAM_NAME}</div>
                      </div>
                      <div className="text-end">
                        <span className={`badge-glass ${profileDetails.student.STATUS === 'Active' ? 'badge-glass-success' : 'badge-glass-danger'}`}>
                          {profileDetails.student.STATUS}
                        </span>
                      </div>
                    </div>

                    {/* Academic Stat Indicators */}
                    <div className="row gy-3 mb-4">
                      <div className="col-4">
                        <div className="p-3 rounded text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <span className="text-secondary small">Current CGPA</span>
                          <h4 className="fw-bold text-white mb-0 mt-1">{Number(profileDetails.student.CGPA || 0).toFixed(2)}</h4>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="p-3 rounded text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <span className="text-secondary small">Attendance %</span>
                          <h4 className="fw-bold text-white mb-0 mt-1">{Number(profileDetails.student.ATTENDANCE_PERCENT || 0).toFixed(1)}%</h4>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="p-3 rounded text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <span className="text-secondary small">Outstanding Fees</span>
                          <h4 className="fw-bold text-white mb-0 mt-1">PKR {Number(profileDetails.student.OUTSTANDING_FEES || 0).toLocaleString()}</h4>
                        </div>
                      </div>
                    </div>

                    {/* Tabs / lists */}
                    <div className="mb-4">
                      <h6 className="fw-semibold text-white mb-3">Enrolled Course Sections & Grades</h6>
                      <div className="table-responsive">
                        <table className="table-glass table-sm">
                          <thead>
                            <tr>
                              <th className="text-start">Course</th>
                              <th>Semester</th>
                              <th>Numeric Grade</th>
                              <th>Letter Grade</th>
                              <th>Grade Points</th>
                            </tr>
                          </thead>
                          <tbody>
                            {profileDetails.enrollments.length === 0 ? (
                              <tr>
                                <td colSpan="5" className="text-center py-3 text-secondary small">No classes enrolled.</td>
                              </tr>
                            ) : (
                              profileDetails.enrollments.map((en, idx) => (
                                <tr key={idx}>
                                  <td className="text-start">
                                    <div className="fw-semibold text-white">{en.COURSE_CODE}</div>
                                    <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>{en.COURSE_TITLE}</div>
                                  </td>
                                  <td className="small text-secondary">{en.SEMESTER} {en.YEAR}</td>
                                  <td className="small text-light fw-medium">{en.GRADE_VALUE || 'Pending'}</td>
                                  <td>
                                    {en.LETTER_GRADE ? (
                                      <span className="badge-glass badge-glass-success py-1 px-2">{en.LETTER_GRADE}</span>
                                    ) : (
                                      <span className="badge-glass badge-glass-warning py-1 px-2">Not Graded</span>
                                    )}
                                  </td>
                                  <td className="small text-light fw-medium">
                                    {en.GRADE_POINTS !== null ? Number(en.GRADE_POINTS).toFixed(2) : '-'}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="row">
                      {/* Left: Fee Payments */}
                      <div className="col-md-6 mb-4">
                        <h6 className="fw-semibold text-white mb-3">Financial Payments History</h6>
                        <div className="table-responsive">
                          <table className="table-glass table-sm">
                            <thead>
                              <tr>
                                <th className="text-start">Method/Ref</th>
                                <th>Amount</th>
                                <th>Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {profileDetails.payments.length === 0 ? (
                                <tr>
                                  <td colSpan="3" className="text-center py-3 text-secondary small">No payment history recorded.</td>
                                </tr>
                              ) : (
                                profileDetails.payments.map((py, idx) => (
                                  <tr key={idx}>
                                    <td className="text-start">
                                      <div className="text-white small fw-medium">{py.PAYMENT_METHOD}</div>
                                      <div className="text-secondary small" style={{ fontSize: '0.7rem' }}>Ref: {py.REFERENCE || 'N/A'}</div>
                                    </td>
                                    <td className="small text-light">PKR {Number(py.AMOUNT).toLocaleString()}</td>
                                    <td className="small text-secondary">{new Date(py.PAYMENT_DATE).toLocaleDateString()}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Right: Library issues */}
                      <div className="col-md-6 mb-4">
                        <h6 className="fw-semibold text-white mb-3">Library Checkouts History</h6>
                        <div className="table-responsive">
                          <table className="table-glass table-sm">
                            <thead>
                              <tr>
                                <th className="text-start">Book/Author</th>
                                <th>Due Date</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {profileDetails.library.length === 0 ? (
                                <tr>
                                  <td colSpan="3" className="text-center py-3 text-secondary small">No books issued.</td>
                                </tr>
                              ) : (
                                profileDetails.library.map((lb, idx) => (
                                  <tr key={idx}>
                                    <td className="text-start">
                                      <div className="text-white small fw-medium text-truncate" style={{ maxWidth: '140px' }}>{lb.TITLE}</div>
                                      <div className="text-secondary small" style={{ fontSize: '0.7rem' }}>{lb.AUTHOR}</div>
                                    </td>
                                    <td className="small text-secondary">{new Date(lb.DUE_DATE).toLocaleDateString()}</td>
                                    <td>
                                      <span className={`badge-glass py-0 px-2 ${lb.STATUS === 'Returned' ? 'badge-glass-success' : 'badge-glass-danger'}`} style={{ fontSize: '0.65rem' }}>
                                        {lb.STATUS}
                                      </span>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Hostel Info */}
                    <div>
                      <h6 className="fw-semibold text-white mb-3">Hostel Room Allotment</h6>
                      {profileDetails.hostel ? (
                        <div className="p-3 rounded text-start d-flex justify-content-between align-items-center" style={{ background: 'rgba(0, 168, 204, 0.05)', border: '1px solid rgba(0, 168, 204, 0.2)' }}>
                          <div>
                            <strong className="text-info">{profileDetails.hostel.HOSTEL_NAME}</strong>
                            <div className="text-secondary small">Room Number: <span className="text-white">{profileDetails.hostel.ROOM_NUMBER}</span></div>
                          </div>
                          <div className="text-secondary small text-end">
                            Allotment Date: <strong>{new Date(profileDetails.hostel.START_DATE).toLocaleDateString()}</strong>
                          </div>
                        </div>
                      ) : (
                        <p className="text-secondary small text-start">No active hostel accommodation allocated to this student.</p>
                      )}
                    </div>

                  </div>
                ) : (
                  <p className="text-center text-secondary small py-5">Error: Unable to show profile data.</p>
                )}
              </div>
              <div className="modal-footer modal-glass-footer">
                <button type="button" className="btn btn-glass-secondary" onClick={() => setShowProfileModal(false)}>Close Profile</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentManagement;
