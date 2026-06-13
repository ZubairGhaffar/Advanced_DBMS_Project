import React, { useEffect, useState } from 'react';
import api from '../../api/api';

const FinanceDashboard = () => {
  const [defaulters, setDefaulters] = useState([]);
  const [studentID, setStudentID] = useState('');
  const [feeSlip, setFeeSlip] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [message, setMessage] = useState(null);
  const [searchMessage, setSearchMessage] = useState(null);

  useEffect(() => {
    const loadDefaulters = async () => {
      try {
        const res = await api.get('/finance/defaulters');
        setDefaulters(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadDefaulters();
  }, []);

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
    <div className="container mt-4">
      <h3>Finance Dashboard</h3>
      <div className="row gy-3">
        <div className="col-md-6">
          <div className="card p-3">
            <h5>Fee Slip Lookup</h5>
            <div className="input-group mb-3">
              <input
                className="form-control"
                placeholder="Student ID"
                value={studentID}
                onChange={e => setStudentID(e.target.value)}
              />
              <button className="btn btn-primary" onClick={handleFeeSlip}>Load</button>
            </div>
            {message && <div className="alert alert-warning">{message}</div>}
            {feeSlip.length > 0 && (
              <table className="table table-sm table-striped">
                <thead>
                  <tr>
                    <th>Semester</th>
                    <th>Amount</th>
                    <th>Payment Date</th>
                    <th>Paid</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {feeSlip.map((row, index) => (
                    <tr key={index}>
                      <td>{row.SEMESTER}</td>
                      <td>{row.AMOUNT}</td>
                      <td>{row.PAYMENT_DATE ? new Date(row.PAYMENT_DATE).toLocaleDateString() : ''}</td>
                      <td>{row.PAID_AMOUNT}</td>
                      <td>{row.OUTSTANDING_BALANCE}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="card p-3">
            <h5>Course Search</h5>
            <div className="input-group mb-3">
              <input
                className="form-control"
                placeholder="Search by keyword"
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
              />
              <button className="btn btn-secondary" onClick={handleSearch}>Search</button>
            </div>
            {searchMessage && <div className="alert alert-warning">{searchMessage}</div>}
            {searchResults.length > 0 && (
              <table className="table table-sm table-striped">
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
                      <td>{course.COURSE_ID}</td>
                      <td>{course.COURSE_CODE}</td>
                      <td>{course.COURSE_TITLE}</td>
                      <td>{course.CREDIT_HOURS}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="card p-3">
            <h5>Fee Defaulters</h5>
            <table className="table table-sm table-striped">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {defaulters.map(defaulter => (
                  <tr key={defaulter.STUDENT_ID}>
                    <td>{defaulter.STUDENT_ID}</td>
                    <td>{defaulter.STUDENT_NAME}</td>
                    <td>{defaulter.OUTSTANDING_FEES}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
