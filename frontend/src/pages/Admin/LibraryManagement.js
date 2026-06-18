import React, { useEffect, useState } from 'react';
import api from '../../api/api';

const LibraryManagement = () => {
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Book Modal state
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookEditMode, setBookEditMode] = useState(false);
  const [bookForm, setBookForm] = useState({
    id: '', title: '', author: '', isbn: '', itemType: 'Book',
    totalCopies: 5, availableCopies: 5, publisher: '', publishYear: '', pages: ''
  });

  // Issue Form state
  const [issueForm, setIssueForm] = useState({ studentID: '', itemID: '', dueDate: '' });
  const [issueMessage, setIssueMessage] = useState(null);
  const [issuing, setIssuing] = useState(false);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [resBooks, resIssues, resStudents] = await Promise.all([
        api.get('/admin/library/books'),
        api.get('/admin/library/issues'),
        api.get('/admin/students')
      ]);
      setBooks(resBooks.data || []);
      setIssues(resIssues.data || []);
      setStudents(resStudents.data || []);

      // Pre-fill issue form selections
      if (resStudents.data?.length > 0 && resBooks.data?.length > 0) {
        setIssueForm({
          studentID: resStudents.data[0].STUDENT_ID,
          itemID: resBooks.data[0].ITEM_ID,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // default 14 days due
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // --- Book Catalog Handlers ---
  const handleOpenAddBook = () => {
    setBookEditMode(false);
    setBookForm({
      id: '', title: '', author: '', isbn: '', itemType: 'Book',
      totalCopies: 5, availableCopies: 5, publisher: '', publishYear: '', pages: ''
    });
    setShowBookModal(true);
  };

  const handleOpenEditBook = (b) => {
    setBookEditMode(true);
    setBookForm({
      id: b.ITEM_ID,
      title: b.TITLE,
      author: b.AUTHOR,
      isbn: b.ISBN || '',
      itemType: b.ITEM_TYPE || 'Book',
      totalCopies: b.TOTAL_COPIES,
      availableCopies: b.AVAILABLE_COPIES,
      publisher: b.PUBLISHER || '',
      publishYear: b.PUBLISH_YEAR || '',
      pages: b.PAGES || ''
    });
    setShowBookModal(true);
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: bookForm.title,
      author: bookForm.author,
      isbn: bookForm.isbn,
      itemType: bookForm.itemType,
      totalCopies: Number(bookForm.totalCopies),
      availableCopies: Number(bookForm.availableCopies),
      publisher: bookForm.publisher,
      publishYear: bookForm.publishYear,
      pages: bookForm.pages
    };

    try {
      if (bookEditMode) {
        await api.put(`/admin/library/books/${bookForm.id}`, payload);
        alert('Library item updated successfully.');
      } else {
        await api.post('/admin/library/books', payload);
        alert('New library item registered successfully.');
      }
      setShowBookModal(false);
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeleteBook = async (id) => {
    if (window.confirm('Delete this library book? This will permanently erase all associated circulation and checkout logs.')) {
      try {
        await api.delete(`/admin/library/books/${id}`);
        alert('Library book deleted.');
        loadAllData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete library book');
      }
    }
  };

  // --- Book Circulation (Issue/Return) Handlers ---
  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    if (!issueForm.studentID || !issueForm.itemID || !issueForm.dueDate) {
      return setIssueMessage('All fields are required.');
    }
    setIssuing(true);
    setIssueMessage(null);

    try {
      await api.post('/admin/library/issues', {
        itemID: Number(issueForm.itemID),
        studentID: Number(issueForm.studentID),
        dueDate: issueForm.dueDate
      });
      alert('Book checked out successfully.');
      setActiveTab('issues');
      loadAllData();
    } catch (err) {
      setIssueMessage(err.response?.data?.message || 'Failed to issue book. Make sure copies are available.');
    } finally {
      setIssuing(false);
    }
  };

  const handleReturnBook = async (id) => {
    if (window.confirm('Mark this library book as returned?')) {
      try {
        const res = await api.post(`/admin/library/issues/${id}/return`);
        alert(`Book returned successfully. Late fine calculated: PKR ${res.data.fineAmount || 0}`);
        loadAllData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to process return');
      }
    }
  };

  // Filter books catalog
  const filteredBooks = books.filter(b => {
    const title = b.TITLE.toLowerCase();
    const author = b.AUTHOR.toLowerCase();
    const isbn = (b.ISBN || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return title.includes(query) || author.includes(query) || isbn.includes(query);
  });

  return (
    <div className="container mt-4 pb-5 text-start">
      <div className="mb-4">
        <h3 className="fw-bold text-white">University Library Registry</h3>
        <p className="text-secondary">Manage the library collection, process book lending services, track due dates, and calculate overdue fines.</p>
      </div>

      {/* Tabs */}
      <div className="d-flex border-bottom border-white-5 mb-4 gap-2">
        <button className={`btn py-2 px-4 border-0 rounded-0 ${activeTab === 'inventory' ? 'btn-glass text-white' : 'btn-glass-secondary text-secondary'}`} onClick={() => setActiveTab('inventory')}>Books Inventory</button>
        <button className={`btn py-2 px-4 border-0 rounded-0 ${activeTab === 'checkout' ? 'btn-glass text-white' : 'btn-glass-secondary text-secondary'}`} onClick={() => setActiveTab('checkout')}>Checkout Desk</button>
        <button className={`btn py-2 px-4 border-0 rounded-0 ${activeTab === 'issues' ? 'btn-glass text-white' : 'btn-glass-secondary text-secondary'}`} onClick={() => setActiveTab('issues')}>Circulation Logs</button>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-info" role="status">
            <span className="visually-hidden">Loading library archives...</span>
          </div>
        </div>
      ) : (
        <div>
          {/* --- TAB 1: INVENTORY --- */}
          {activeTab === 'inventory' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
                <div className="col-md-5">
                  <input
                    type="text"
                    className="form-control form-glass-control"
                    placeholder="Search by title, author, or ISBN..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <button className="btn btn-glass" onClick={handleOpenAddBook}>+ Add Book</button>
              </div>

              <div className="glass-card p-4">
                <div className="table-responsive">
                  <table className="table-glass">
                    <thead>
                      <tr>
                        <th className="text-start">Book Details</th>
                        <th>ISBN</th>
                        <th>Copies</th>
                        <th>Publisher/Year</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBooks.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-5 text-secondary">No books match the search criteria.</td>
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
                            <td>
                              <div className="d-flex justify-content-center gap-2">
                                <button className="btn btn-glass-secondary btn-sm py-1 px-2 text-warning" onClick={() => handleOpenEditBook(b)}>Edit</button>
                                <button className="btn btn-glass-secondary btn-sm py-1 px-2 text-danger" onClick={() => handleDeleteBook(b.ITEM_ID)}>Delete</button>
                              </div>
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

          {/* --- TAB 2: CHECKOUT DESK --- */}
          {activeTab === 'checkout' && (
            <div className="row justify-content-center">
              <div className="col-md-6">
                <div className="glass-card p-5">
                  <h4 className="fw-bold text-white mb-4 text-center">Issue Library Book</h4>
                  {issueMessage && <div className="alert alert-info border-0 text-white small py-2 mb-4" style={{ background: 'rgba(0,168,204,0.1)' }}>{issueMessage}</div>}

                  <form onSubmit={handleIssueSubmit}>
                    <div className="mb-4">
                      <label className="form-label text-secondary small">Select Student Borrower</label>
                      <select
                        className="form-select form-glass-control"
                        value={issueForm.studentID}
                        onChange={e => setIssueForm({ ...issueForm, studentID: e.target.value })}
                        required
                      >
                        <option value="" disabled>-- Select Student --</option>
                        {students.map(s => (
                          <option key={s.STUDENT_ID} value={s.STUDENT_ID}>
                            ID: {s.STUDENT_ID} - {s.FIRST_NAME} {s.LAST_NAME}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="form-label text-secondary small">Select Book to Issue</label>
                      <select
                        className="form-select form-glass-control"
                        value={issueForm.itemID}
                        onChange={e => setIssueForm({ ...issueForm, itemID: e.target.value })}
                        required
                      >
                        <option value="" disabled>-- Select Book --</option>
                        {books.filter(b => b.AVAILABLE_COPIES > 0).map(b => (
                          <option key={b.ITEM_ID} value={b.ITEM_ID}>
                            {b.TITLE} (By {b.AUTHOR}) | {b.AVAILABLE_COPIES} copy left
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="form-label text-secondary small">Due Date</label>
                      <input
                        type="date"
                        className="form-control form-glass-control"
                        value={issueForm.dueDate}
                        onChange={e => setIssueForm({ ...issueForm, dueDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="d-grid mt-5">
                      <button className="btn btn-glass py-3 fw-bold" type="submit" disabled={issuing || books.length === 0}>
                        {issuing ? 'Processing lending...' : 'Finalize Checkout'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB 3: CIRCULATION LOGS --- */}
          {activeTab === 'issues' && (
            <div className="glass-card p-4">
              <h5 className="fw-semibold text-white mb-4">Lending logs & Circulation History</h5>
              <div className="table-responsive">
                <table className="table-glass">
                  <thead>
                    <tr>
                      <th className="text-start">Issue ID</th>
                      <th>Borrower</th>
                      <th>Book Title</th>
                      <th>Issue / Due Date</th>
                      <th>Status</th>
                      <th>Return Date / Fines</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-5 text-secondary">No library circulation entries recorded.</td>
                      </tr>
                    ) : (
                      issues.map(iss => {
                        const status = iss.STATUS || 'Issued';
                        const isReturned = status === 'Returned';
                        return (
                          <tr key={iss.ISSUE_ID}>
                            <td className="text-start"><code>{iss.ISSUE_ID}</code></td>
                            <td>
                              <div className="fw-semibold text-white">{iss.STUDENT_NAME}</div>
                              <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>ID: {iss.STUDENT_ID}</div>
                            </td>
                            <td className="small text-light">{iss.TITLE}</td>
                            <td className="small text-secondary">
                              <div>Issue: {new Date(iss.ISSUE_DATE).toLocaleDateString()}</div>
                              <div>Due: {new Date(iss.DUE_DATE).toLocaleDateString()}</div>
                            </td>
                            <td>
                              <span className={`badge-glass ${isReturned ? 'badge-glass-success' : (new Date(iss.DUE_DATE) < new Date() ? 'badge-glass-danger' : 'badge-glass-warning')}`}>
                                {isReturned ? 'Returned' : (new Date(iss.DUE_DATE) < new Date() ? 'Overdue' : 'Issued')}
                              </span>
                            </td>
                            <td className="small text-secondary">
                              {isReturned ? (
                                <>
                                  <div>Ret: {new Date(iss.RETURN_DATE).toLocaleDateString()}</div>
                                  <div className={iss.FINE_AMOUNT > 0 ? 'text-danger' : ''}>Fine: PKR {iss.FINE_AMOUNT}</div>
                                </>
                              ) : (
                                <span>-</span>
                              )}
                            </td>
                            <td>
                              {!isReturned ? (
                                <button className="btn btn-glass-secondary btn-sm py-1 px-3 text-success" onClick={() => handleReturnBook(iss.ISSUE_ID)}>Return</button>
                              ) : (
                                <span className="text-secondary small">Archived</span>
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
      )}

      {/* --- ADD/EDIT BOOK MODAL --- */}
      {showBookModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modal-glass">
              <div className="modal-header modal-glass-header">
                <h5 className="modal-title fw-bold">{bookEditMode ? 'Update Book Catalog' : 'Register Book in Catalog'}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowBookModal(false)}></button>
              </div>
              <form onSubmit={handleBookSubmit}>
                <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label text-secondary small">Book Title</label>
                      <input type="text" required className="form-control form-glass-control" value={bookForm.title} onChange={e => setBookForm({ ...bookForm, title: e.target.value })} />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-secondary small">Author Name</label>
                      <input type="text" required className="form-control form-glass-control" value={bookForm.author} onChange={e => setBookForm({ ...bookForm, author: e.target.value })} />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-secondary small">ISBN Code</label>
                      <input type="text" className="form-control form-glass-control" value={bookForm.isbn} onChange={e => setBookForm({ ...bookForm, isbn: e.target.value })} />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-secondary small">Item Type</label>
                      <select className="form-select form-glass-control" value={bookForm.itemType} onChange={e => setBookForm({ ...bookForm, itemType: e.target.value })}>
                        <option value="Book">Book</option>
                        <option value="Journal">Journal</option>
                        <option value="Research Paper">Research Paper</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label text-secondary small">Total Copies</label>
                      <input type="number" required className="form-control form-glass-control" value={bookForm.totalCopies} onChange={e => {
                        const total = Number(e.target.value);
                        setBookForm({
                          ...bookForm,
                          totalCopies: total,
                          availableCopies: bookEditMode ? bookForm.availableCopies : total
                        });
                      }} />
                    </div>
                    {bookEditMode && (
                      <div className="col-6">
                        <label className="form-label text-secondary small">Available Copies</label>
                        <input type="number" required className="form-control form-glass-control" value={bookForm.availableCopies} onChange={e => setBookForm({ ...bookForm, availableCopies: Number(e.target.value) })} />
                      </div>
                    )}
                    <div className="col-12">
                      <label className="form-label text-secondary small">Publisher</label>
                      <input type="text" className="form-control form-glass-control" value={bookForm.publisher} onChange={e => setBookForm({ ...bookForm, publisher: e.target.value })} />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-secondary small">Publish Year</label>
                      <input type="number" className="form-control form-glass-control" value={bookForm.publishYear} onChange={e => setBookForm({ ...bookForm, publishYear: e.target.value })} />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-secondary small">Pages Count</label>
                      <input type="number" className="form-control form-glass-control" value={bookForm.pages} onChange={e => setBookForm({ ...bookForm, pages: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer modal-glass-footer">
                  <button type="button" className="btn btn-glass-secondary" onClick={() => setShowBookModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-glass">{bookEditMode ? 'Save Changes' : 'Register'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryManagement;
