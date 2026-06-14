import React, { useEffect, useState } from 'react';
import api from '../../api/api';

const FacultyManagement = () => {
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showWorkloadModal, setShowWorkloadModal] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    bankAccount: '',
    departmentID: '',
    status: 'Active'
  });
  const [editingId, setEditingId] = useState(null);
  
  // Workload details state
  const [workloadDetails, setWorkloadDetails] = useState(null);
  const [loadingWorkload, setLoadingWorkload] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resFaculty, resDepts] = await Promise.all([
        api.get('/admin/faculties'),
        api.get('/admin/departments')
      ]);
      setFaculties(resFaculty.data || []);
      setDepartments(resDepts.data || []);
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
      bankAccount: '',
      departmentID: departments[0]?.DEPT_ID || '',
      status: 'Active'
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (fac) => {
    setEditingId(fac.FACULTY_ID);
    setFormData({
      firstName: fac.FIRST_NAME || '',
      lastName: fac.LAST_NAME || '',
      email: fac.EMAIL || '',
      password: '', // do not display password
      bankAccount: fac.BANK_ACCOUNT || '',
      departmentID: fac.DEPARTMENT_ID || '',
      status: fac.STATUS || 'Active'
    });
    setShowEditModal(true);
  };

  const handleOpenWorkload = async (id) => {
    setShowWorkloadModal(true);
    setLoadingWorkload(true);
    setWorkloadDetails(null);
    try {
      const res = await api.get(`/admin/faculties/${id}`);
      setWorkloadDetails(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load instructor workload summary.');
      setShowWorkloadModal(false);
    } finally {
      setLoadingWorkload(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/faculties', formData);
      alert('Faculty and system user account successfully created.');
      setShowAddModal(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create faculty member');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/faculties/${editingId}`, formData);
      alert('Faculty profile successfully updated.');
      setShowEditModal(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update faculty member');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you absolutely sure you want to delete this faculty member? This will permanently delete their system login, clear their bank records, and orphan their taught sections.')) {
      try {
        await api.delete(`/admin/faculties/${id}`);
        alert('Faculty member and user account deleted.');
        loadData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete faculty member');
      }
    }
  };

  // Filter logic
  const filteredFaculties = faculties.filter(fac => {
    const name = `${fac.FIRST_NAME} ${fac.LAST_NAME}`.toLowerCase();
    const email = (fac.EMAIL || '').toLowerCase();
    const query = search.toLowerCase();
    
    const matchesSearch = name.includes(query) || email.includes(query) || String(fac.FACULTY_ID).includes(query);
    const matchesDept = deptFilter ? Number(fac.DEPARTMENT_ID) === Number(deptFilter) : true;
    const matchesStatus = statusFilter ? fac.STATUS === statusFilter : true;
    
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="container mt-4 pb-5 text-start">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-white">Faculty Directory & Workload Manager</h3>
          <p className="text-secondary">Register academic staff, assign departments, view workload matrices, and manage files.</p>
        </div>
        <button className="btn btn-glass" onClick={handleOpenAdd}>+ Register New Faculty</button>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card mb-4 p-3">
        <div className="row g-3">
          <div className="col-md-5">
            <input 
              type="text" 
              className="form-control form-glass-control" 
              placeholder="Search by instructor name, email, or ID..."
              value={search} 
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <select 
              className="form-select form-glass-control" 
              value={deptFilter} 
              onChange={e => setDeptFilter(e.target.value)}
            >
              <option value="">-- All Departments --</option>
              {departments.map(d => <option key={d.DEPT_ID} value={d.DEPT_ID}>{d.DEPT_NAME}</option>)}
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
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="col-md-2">
            <button className="btn btn-glass-secondary w-100" onClick={() => { setSearch(''); setDeptFilter(''); setStatusFilter(''); }}>Reset Filters</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-info" role="status">
            <span className="visually-hidden">Loading instructor directory...</span>
          </div>
        </div>
      ) : (
        <div className="glass-card p-4">
          <div className="table-responsive">
            <table className="table-glass">
              <thead>
                <tr>
                  <th className="text-start">Instructor Name</th>
                  <th>Faculty ID</th>
                  <th>Department</th>
                  <th>Bank Account</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFaculties.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-secondary">
                      No faculty records found matching selection criteria.
                    </td>
                  </tr>
                ) : (
                  filteredFaculties.map(fac => {
                    const status = fac.STATUS || 'Active';
                    let statusClass = 'badge-glass-success';
                    if (status === 'Inactive') statusClass = 'badge-glass-danger';

                    return (
                      <tr key={fac.FACULTY_ID}>
                        <td className="text-start">
                          <div className="d-flex align-items-center gap-3">
                            <div 
                              className="d-flex align-items-center justify-content-center text-white fw-bold rounded-circle"
                              style={{ 
                                width: '36px', 
                                height: '36px', 
                                background: 'linear-gradient(135deg, #8c52ff, #d500f9)',
                                fontSize: '0.85rem'
                              }}
                            >
                              {`${fac.FIRST_NAME} ${fac.LAST_NAME}`.split(' ').map(n=>n[0]).join('')}
                            </div>
                            <div>
                              <div className="fw-semibold text-white">{fac.FIRST_NAME} {fac.LAST_NAME}</div>
                              <div className="text-secondary small">{fac.EMAIL}</div>
                            </div>
                          </div>
                        </td>
                        <td><code>{fac.FACULTY_ID}</code></td>
                        <td className="small text-light">{fac.DEPT_NAME}</td>
                        <td className="small text-secondary">{fac.BANK_ACCOUNT || 'N/A'}</td>
                        <td><span className={`badge-glass ${statusClass}`}>{status}</span></td>
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            <button className="btn btn-glass-secondary btn-sm py-1 px-2 text-info" onClick={() => handleOpenWorkload(fac.FACULTY_ID)}>Workload</button>
                            <button className="btn btn-glass-secondary btn-sm py-1 px-2 text-warning" onClick={() => handleOpenEdit(fac)}>Edit</button>
                            <button className="btn btn-glass-secondary btn-sm py-1 px-2 text-danger" onClick={() => handleDelete(fac.FACULTY_ID)}>Delete</button>
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

      {/* --- ADD FACULTY MODAL --- */}
      {showAddModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modal-glass">
              <div className="modal-header modal-glass-header">
                <h5 className="modal-title fw-bold">Register New Instructor</h5>
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
                      <label className="form-label text-secondary small">Bank Account</label>
                      <input type="text" placeholder="IBAN / Account Number" className="form-control form-glass-control" value={formData.bankAccount} onChange={e => setFormData({...formData, bankAccount: e.target.value})} />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-secondary small">Academic Department</label>
                      <select className="form-select form-glass-control" value={formData.departmentID} onChange={e => setFormData({...formData, departmentID: e.target.value})}>
                        {departments.map(d => <option key={d.DEPT_ID} value={d.DEPT_ID}>{d.DEPT_NAME}</option>)}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label text-secondary small">Status Standing</label>
                      <select className="form-select form-glass-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer modal-glass-footer">
                  <button type="button" className="btn btn-glass-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-glass">Register Instructor</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT FACULTY MODAL --- */}
      {showEditModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modal-glass">
              <div className="modal-header modal-glass-header">
                <h5 className="modal-title fw-bold">Update Faculty Profile</h5>
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
                      <label className="form-label text-secondary small">Bank Account</label>
                      <input type="text" placeholder="IBAN / Account Number" className="form-control form-glass-control" value={formData.bankAccount} onChange={e => setFormData({...formData, bankAccount: e.target.value})} />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-secondary small">Academic Department</label>
                      <select className="form-select form-glass-control" value={formData.departmentID} onChange={e => setFormData({...formData, departmentID: e.target.value})}>
                        {departments.map(d => <option key={d.DEPT_ID} value={d.DEPT_ID}>{d.DEPT_NAME}</option>)}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label text-secondary small">Status Standing</label>
                      <select className="form-select form-glass-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
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

      {/* --- WORKLOAD DETAILS MODAL --- */}
      {showWorkloadModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content modal-glass">
              <div className="modal-header modal-glass-header">
                <h5 className="modal-title fw-bold">Faculty Workload Summary</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowWorkloadModal(false)}></button>
              </div>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {loadingWorkload ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-info" role="status">
                      <span className="visually-hidden">Loading workload profile...</span>
                    </div>
                  </div>
                ) : workloadDetails ? (
                  <div>
                    {/* Header info */}
                    <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-white-5 pb-3">
                      <div>
                        <h4 className="fw-bold text-white mb-1">Dr. {workloadDetails.faculty.FIRST_NAME} {workloadDetails.faculty.LAST_NAME}</h4>
                        <div className="text-secondary small">Email: {workloadDetails.faculty.EMAIL} | Department: {workloadDetails.faculty.DEPT_NAME}</div>
                        <div className="text-secondary small">Hire Date: {new Date(workloadDetails.faculty.HIRE_DATE).toLocaleDateString()}</div>
                      </div>
                      <div className="text-end">
                        <span className={`badge-glass ${workloadDetails.faculty.STATUS === 'Active' ? 'badge-glass-success' : 'badge-glass-danger'}`}>
                          {workloadDetails.faculty.STATUS}
                        </span>
                      </div>
                    </div>

                    {/* Classes taught */}
                    <div>
                      <h6 className="fw-semibold text-white mb-3">Sections & Teaching Workload</h6>
                      <div className="table-responsive">
                        <table className="table-glass">
                          <thead>
                            <tr>
                              <th className="text-start">Course</th>
                              <th>Section ID</th>
                              <th>Semester</th>
                              <th>Enrolled Students</th>
                              <th>Capacity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {workloadDetails.sections.length === 0 ? (
                              <tr>
                                <td colSpan="5" className="text-center py-4 text-secondary small">No courses/sections currently assigned to this instructor.</td>
                              </tr>
                            ) : (
                              workloadDetails.sections.map((sec, idx) => (
                                <tr key={idx}>
                                  <td className="text-start">
                                    <div className="fw-semibold text-white">{sec.COURSE_CODE}</div>
                                    <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>{sec.COURSE_TITLE}</div>
                                  </td>
                                  <td><code>{sec.SECTION_ID}</code></td>
                                  <td className="small text-light">{sec.SEMESTER} {sec.YEAR}</td>
                                  <td className="small text-info fw-bold">{sec.ENROLLED_STUDENTS}</td>
                                  <td className="small text-secondary">{sec.CAPACITY}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                ) : (
                  <p className="text-center text-secondary small py-5">Error: Unable to show workload data.</p>
                )}
              </div>
              <div className="modal-footer modal-glass-footer">
                <button type="button" className="btn btn-glass-secondary" onClick={() => setShowWorkloadModal(false)}>Close Summary</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FacultyManagement;
