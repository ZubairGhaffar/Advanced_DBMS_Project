import React, { useEffect, useState } from 'react';
import api from '../../api/api';

const Library = () => {
  const [books, setBooks] = useState([]);
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('catalog');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadLibraryData = async () => {
      setLoading(true);
      try {
        const [resBooks, resHistory] = await Promise.all([
          api.get('/student/library/books'),
          api.get('/student/library/my-issues')
        ]);
        setBooks(resBooks.data || []);
        setBorrowHistory(resHistory.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadLibraryData();
  }, []);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-info" role="status">
          <span className="visually-hidden">Loading archives...</span>
        </div>
      </div>
    );
  }

  // Calculate Metrics
  const activeCheckouts = borrowHistory.filter(item => item.STATUS === 'Issued' || !item.RETURN_DATE);
  const totalBorrowedCount = activeCheckouts.length;
  const overdueCount = activeCheckouts.filter(item => new Date(item.DUE_DATE) < new Date()).length;
  const totalFines = borrowHistory.reduce((sum, item) => sum + Number(item.FINE_AMOUNT || 0), 0);

  // Search filter
  const filteredBooks = books.filter(b => {
    const title = b.TITLE.toLowerCase();
    const author = b.AUTHOR.toLowerCase();
    const isbn = (b.ISBN || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return title.includes(q) || author.includes(q) || isbn.includes(q);
  });

  return (
    <div className="container mt-4 pb-5">
      <div className="mb-4 text-start">
        <h3 className="fw-bold text-white">Student Library Portal</h3>
        <p className="text-secondary">Browse the campus library collection and monitor your active loans and due dates.</p>
      </div>

      {/* KPI Widgets */}
      <div className="row gy-4 mb-4 text-start">
        <div className="col-md-4">
          <div className="glass-card p-3">
            <span className="text-secondary small fw-medium">Active Loans</span>
            <div className="d-flex align-items-center justify-content-between mt-2">
              <h3 className="fw-bold text-white mb-0">{totalBorrowedCount}</h3>
              <span className="fs-3">📖</span>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="glass-card p-3">
            <span className="text-secondary small fw-medium">Overdue Books</span>
            <div className="d-flex align-items-center justify-content-between mt-2">
              <h3 className={`fw-bold mb-0 ${overdueCount > 0 ? 'text-danger' : 'text-white'}`}>{overdueCount}</h3>
              <span className="fs-3">⚠️</span>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="glass-card p-3">
            <span className="text-secondary small fw-medium">Outstanding Fines</span>
            <div className="d-flex align-items-center justify-content-between mt-2">
              <h3 className="fw-bold text-warning mb-0">PKR {totalFines}</h3>
              <span className="fs-3">💰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex border-bottom border-white-5 mb-4 gap-2">
        <button className={`btn py-2 px-4 border-0 rounded-0 ${activeTab === 'catalog' ? 'btn-glass text-white' : 'btn-glass-secondary text-secondary'}`} onClick={() => setActiveTab('catalog')}>Search Catalog</button>
        <button className={`btn py-2 px-4 border-0 rounded-0 ${activeTab === 'history' ? 'btn-glass text-white' : 'btn-glass-secondary text-secondary'}`} onClick={() => setActiveTab('history')}>My Borrow History</button>
      </div>

      {/* Tab content */}
      <div className="text-start">
        {activeTab === 'catalog' && (
          <div>
            <div className="col-md-6 mb-4">
              <input
                type="text"
                className="form-control form-glass-control"
                placeholder="Search by title, author, or ISBN..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="glass-card p-4">
              <div className="table-responsive">
                <table className="table-glass">
                  <thead>
                    <tr>
                      <th className="text-start">Book Details</th>
                      <th>ISBN</th>
                      <th>Copies Available</th>
                      <th>Publisher</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBooks.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-5 text-secondary">No books match the search criteria.</td>
                      </tr>
                    ) : (
                      filteredBooks.map(b => (
                        <tr key={b.ITEM_ID}>
                          <td className="text-start">
                            <div className="fw-bold text-white">{b.TITLE}</div>
                            <div className="text-secondary small">By {b.AUTHOR} | Type: {b.ITEM_TYPE}</div>
                          </td>
                          <td><code>{b.ISBN || 'N/A'}</code></td>
                          <td>
                            <span className={`badge-glass ${b.AVAILABLE_COPIES > 0 ? 'badge-glass-success' : 'badge-glass-danger'}`}>
                              {b.AVAILABLE_COPIES} / {b.TOTAL_COPIES} Free
                            </span>
                          </td>
                          <td className="small text-secondary">
                            <div>{b.PUBLISHER || 'N/A'}</div>
                            <div>{b.PUBLISH_YEAR ? `Year ${b.PUBLISH_YEAR}` : ''}</div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="glass-card p-4">
            <h5 className="fw-semibold text-white mb-4">Lending logs & Circulation History</h5>
            <div className="table-responsive">
              <table className="table-glass">
                <thead>
                  <tr>
                    <th className="text-start">Issue ID</th>
                    <th>Book Details</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Return Date / Fines</th>
                  </tr>
                </thead>
                <tbody>
                  {borrowHistory.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-secondary">No borrowing logs found.</td>
                    </tr>
                  ) : (
                    borrowHistory.map(iss => {
                      const status = iss.STATUS || 'Issued';
                      const isReturned = status === 'Returned';
                      return (
                        <tr key={iss.ISSUE_ID}>
                          <td className="text-start"><code>{iss.ISSUE_ID}</code></td>
                          <td>
                            <div className="fw-bold text-white">{iss.TITLE}</div>
                            <div className="text-secondary small">By {iss.AUTHOR}</div>
                          </td>
                          <td className="small text-light">{new Date(iss.ISSUE_DATE).toLocaleDateString()}</td>
                          <td className="small text-light">{new Date(iss.DUE_DATE).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge-glass ${isReturned ? 'badge-glass-success' : (new Date(iss.DUE_DATE) < new Date() ? 'badge-glass-danger' : 'badge-glass-warning')}`}>
                              {isReturned ? 'Returned' : (new Date(iss.DUE_DATE) < new Date() ? 'Overdue' : 'Issued')}
                            </span>
                          </td>
                          <td className="small text-secondary">
                            {isReturned ? (
                              <>
                                <div>Returned: {new Date(iss.RETURN_DATE).toLocaleDateString()}</div>
                                <div className={iss.FINE_AMOUNT > 0 ? 'text-danger fw-bold' : ''}>Fine: PKR {iss.FINE_AMOUNT}</div>
                              </>
                            ) : (
                              <span>-</span>
                            )}
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
      </div>
    </div>
  );
};

export default Library;
