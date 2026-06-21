import React, { useEffect, useState } from 'react';
import api from '../../api/api';

const FinanceDashboard = () => {
  const [payments, setPayments] = useState([]);
  const [defaulters, setDefaulters] = useState([]);
  const [studentID, setStudentID] = useState('');
  const [feeSlip, setFeeSlip] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [message, setMessage] = useState(null);
  const [searchMessage, setSearchMessage] = useState(null);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [loadingDefaulters, setLoadingDefaulters] = useState(false);

  const loadPayments = async () => {
    setLoadingPayments(true);
    try {
      const res = await api.get('/finance/payments');
      setPayments(res.data || []);
    } catch (err) {
      console.error('Error loading payments:', err);
    } finally {
      setLoadingPayments(false);
    }
  };

  const loadDefaulters = async () => {
    setLoadingDefaulters(true);
    try {
      const res = await api.get('/finance/defaulters');
      setDefaulters(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDefaulters(false);
    }
  };

  useEffect(() => {
    loadPayments();
    loadDefaulters();
  }, []);

  const handleApprove = async (paymentId) => {
    try {
      await api.post('/finance/approve-payment', { paymentID: paymentId });
      loadPayments();
      loadDefaulters();
    } catch (err) {
      console.error(err);
      alert('Failed to approve payment');
    }
  };

  const handleReject = async (paymentId) => {
    if (!window.confirm('Are you sure you want to reject this payment?')) return;
    try {
      await api.post('/finance/reject-payment', { paymentID: paymentId });
      loadPayments();
      loadDefaulters();
    } catch (err) {
      console.error(err);
      alert('Failed to reject payment');
    }
  };

  const handleFeeSlip = async () => {
    if (!studentID) return setMessage('Enter a student ID first.');
    try {
      const res = await api.get(`/finance/fee-slip?studentID=${studentID}`);
      setFeeSlip(res.data || []);
      setMessage(res.data.length ? null : 'No fee slip results found.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not load fee slip');
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword) return setSearchMessage('Enter a keyword first.');
    try {
      const res = await api.get(`/finance/search-courses?keyword=${encodeURIComponent(searchKeyword)}`);
      setSearchResults(res.data || []);
      setSearchMessage(res.data.length ? null : 'No courses found.');
    } catch (err) {
      setSearchMessage(err.response?.data?.message || 'Search failed');
    }
  };

  return (
    <div className="container mt-4 pb-5">
      {/* Header section */}
      <div className="glass-card mb-4 p-4 text-start">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h1 className="fw-bold m-0" style={{ background: 'linear-gradient(135deg, #00e676, #00b0ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Finance Control Dashboard
            </h1>
            <p className="text-secondary m-0 mt-1">Manage student fee structures, payments verification, and outstanding dues standing.</p>
          </div>
        </div>
      </div>

      <div className="row gy-4">
        {/* Payment Verification Card */}
        <div className="col-12">
          <div className="glass-card p-4 text-start">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold text-white mb-0">Fee Payment Verifications</h5>
              <button className="btn btn-glass btn-sm px-3" onClick={loadPayments} disabled={loadingPayments}>
                {loadingPayments ? 'Refreshing...' : '🔄 Refresh List'}
              </button>
            </div>
            {loadingPayments ? (
              <div className="text-center py-4">
                <div className="spinner-border text-info" role="status" />
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-4 text-secondary">
                No fee payments recorded in the system.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table-glass">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Student Name (ID)</th>
                      <th>Amount (PKR)</th>
                      <th>Method</th>
                      <th>Semester</th>
                      <th>Reference</th>
                      <th>Bank Account</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p.PAYMENT_ID}>
                        <td>{p.PAYMENT_ID}</td>
                        <td>
                          <span className="fw-semibold text-white d-block">{p.STUDENT_NAME}</span>
                          <span className="text-secondary small">ID: {p.STUDENT_ID}</span>
                        </td>
                        <td>
                          <span className="fw-bold text-white">{Number(p.AMOUNT).toLocaleString()}</span>
                        </td>
                        <td>{p.PAYMENT_METHOD}</td>
                        <td><span className="badge bg-secondary text-white">{p.SEMESTER || p.semester}</span></td>
                        <td><code>{p.REFERENCE || 'N/A'}</code></td>
                        <td><code>{p.BANK_ACCOUNT || 'N/A'}</code></td>
                        <td>{new Date(p.PAYMENT_DATE).toLocaleDateString()}</td>
                        <td>
                          {p.STATUS === 'Approved' || p.STATUS === 'Completed' ? (
                            <span className="badge-glass badge-glass-success">Approved</span>
                          ) : p.STATUS === 'Rejected' ? (
                            <span className="badge-glass badge-glass-danger">Rejected</span>
                          ) : (
                            <span className="badge-glass badge-glass-warning">Pending</span>
                          )}
                        </td>
                        <td className="text-end">
                          {p.STATUS === 'Pending' ? (
                            <div className="d-flex justify-content-end gap-2">
                              <button 
                                className="btn btn-sm btn-success px-3 fw-bold"
                                onClick={() => handleApprove(p.PAYMENT_ID)}
                              >
                                Approve
                              </button>
                              <button 
                                className="btn btn-sm btn-danger px-3 fw-bold"
                                onClick={() => handleReject(p.PAYMENT_ID)}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-secondary small">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Fee Defaulters Section */}
        <div className="col-md-6">
          <div className="glass-card p-4 text-start h-100">
            <h5 className="fw-bold text-white mb-4">Fee Defaulters List</h5>
            {loadingDefaulters ? (
              <div className="text-center py-4">
                <div className="spinner-border text-info" role="status" />
              </div>
            ) : defaulters.length === 0 ? (
              <div className="text-center py-4 text-secondary">
                No fee defaulters. All students have cleared balances.
              </div>
            ) : (
              <div className="table-responsive" style={{ maxHeight: '350px' }}>
                <table className="table-glass">
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Student Name</th>
                      <th className="text-end">Outstanding (PKR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {defaulters.map(def => (
                      <tr key={def.STUDENT_ID}>
                        <td><code>{def.STUDENT_ID}</code></td>
                        <td><span className="fw-semibold text-white">{def.STUDENT_NAME}</span></td>
                        <td className="text-end fw-bold text-danger">
                          {Number(def.OUTSTANDING_FEES).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Fee Slip Lookup Section */}
        <div className="col-md-6">
          <div className="glass-card p-4 text-start h-100">
            <h5 className="fw-bold text-white mb-3">Student Fee Ledger Lookup</h5>
            <div className="input-group mb-4">
              <input
                className="form-control form-glass-control"
                placeholder="Enter Student ID"
                value={studentID}
                onChange={e => setStudentID(e.target.value)}
              />
              <button className="btn btn-glass" onClick={handleFeeSlip}>Lookup Ledger</button>
            </div>
            {message && <div className="alert alert-warning py-2 small">{message}</div>}
            {feeSlip.length > 0 && (
              <div className="table-responsive" style={{ maxHeight: '300px' }}>
                <table className="table-glass">
                  <thead>
                    <tr>
                      <th>Semester</th>
                      <th>Total Due (PKR)</th>
                      <th>Paid (PKR)</th>
                      <th>Outstanding Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeSlip.map((row, index) => (
                      <tr key={index}>
                        <td>{row.SEMESTER}</td>
                        <td>{Number(row.AMOUNT).toLocaleString()}</td>
                        <td>{Number(row.PAID_AMOUNT).toLocaleString()}</td>
                        <td className="fw-bold">{Number(row.OUTSTANDING_BALANCE).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Course Search Section */}
        <div className="col-12">
          <div className="glass-card p-4 text-start">
            <h5 className="fw-bold text-white mb-3">Curriculum Finder</h5>
            <div className="input-group mb-4">
              <input
                className="form-control form-glass-control"
                placeholder="Search course code or keyword"
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
              />
              <button className="btn btn-glass" onClick={handleSearch}>Find Course</button>
            </div>
            {searchMessage && <div className="alert alert-warning py-2 small">{searchMessage}</div>}
            {searchResults.length > 0 && (
              <div className="table-responsive" style={{ maxHeight: '300px' }}>
                <table className="table-glass">
                  <thead>
                    <tr>
                      <th>Course ID</th>
                      <th>Code</th>
                      <th>Title</th>
                      <th>Credit Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map(course => (
                      <tr key={course.COURSE_ID}>
                        <td><code>{course.COURSE_ID}</code></td>
                        <td><span className="fw-semibold text-white">{course.COURSE_CODE}</span></td>
                        <td>{course.COURSE_TITLE}</td>
                        <td>{course.CREDIT_HOURS}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
