import React, { useEffect, useState } from 'react';
import api from '../../api/api';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  const [activeTab, setActiveTab] = useState('courses');
  const [loading, setLoading] = useState(true);

  // Modal Triggers
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseEditMode, setCourseEditMode] = useState(false);
  const [courseForm, setCourseForm] = useState({ id: '', code: '', title: '', creditHours: 3, departmentID: '', description: '' });

  const [showSectionModal, setShowSectionModal] = useState(false);
  const [sectionEditMode, setSectionEditMode] = useState(false);
  const [sectionForm, setSectionForm] = useState({ id: '', courseID: '', facultyID: '', semester: 'Fall', year: 2026, capacity: 40, availableSeats: 40, schedule: '', room: '' });

  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollForm, setEnrollForm] = useState({ studentID: '', sectionID: '' });

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [resC, resS, resE, resSt, resF, resD] = await Promise.all([
        api.get('/admin/courses'),
        api.get('/admin/sections'),
        api.get('/admin/enrollments'),
        api.get('/admin/students'),
        api.get('/admin/faculties'),
        api.get('/admin/departments')
      ]);
      setCourses(resC.data || []);
      setSections(resS.data || []);
      setEnrollments(resE.data || []);
      setStudents(resSt.data || []);
      setFaculties(resF.data || []);
      setDepartments(resD.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // --- Course handlers ---
  const handleOpenAddCourse = () => {
    setCourseEditMode(false);
    setCourseForm({ id: '', code: '', title: '', creditHours: 3, departmentID: departments[0]?.DEPT_ID || '', description: '' });
    setShowCourseModal(true);
  };
  const handleOpenEditCourse = (c) => {
    setCourseEditMode(true);
    setCourseForm({
      id: c.COURSE_ID,
      code: c.COURSE_CODE,
      title: c.COURSE_TITLE,
      creditHours: c.CREDIT_HOURS,
      departmentID: c.DEPARTMENT_ID,
      description: c.DESCRIPTION || ''
    });
    setShowCourseModal(true);
  };
  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      courseCode: courseForm.code,
      courseTitle: courseForm.title,
      creditHours: courseForm.creditHours,
      departmentID: courseForm.departmentID,
      description: courseForm.description
    };
    try {
      if (courseEditMode) {
        await api.put(`/admin/courses/${courseForm.id}`, payload);
        alert('Course successfully updated.');
      } else {
        await api.post('/admin/courses', payload);
        alert('New course successfully registered.');
      }
      setShowCourseModal(false);
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };
  const handleDeleteCourse = async (id) => {
    if (window.confirm('Delete this course? This will cascade and delete all class sections associated with it.')) {
      try {
        await api.delete(`/admin/courses/${id}`);
        alert('Course deleted.');
        loadAllData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete course');
      }
    }
  };

  // --- Section handlers ---
  const handleOpenAddSection = () => {
    setSectionEditMode(false);
    setSectionForm({
      id: '',
      courseID: courses[0]?.COURSE_ID || '',
      facultyID: faculties[0]?.FACULTY_ID || '',
      semester: 'Fall',
      year: 2026,
      capacity: 40,
      availableSeats: 40,
      schedule: 'Mon-Wed 09:00-10:30',
      room: 'R101'
    });
    setShowSectionModal(true);
  };
  const handleOpenEditSection = (s) => {
    setSectionEditMode(true);
    setSectionForm({
      id: s.SECTION_ID,
      courseID: s.COURSE_ID,
      facultyID: s.FACULTY_ID,
      semester: s.SEMESTER,
      year: s.YEAR,
      capacity: s.CAPACITY,
      availableSeats: s.AVAILABLE_SEATS,
      schedule: s.SCHEDULE || '',
      room: s.ROOM || ''
    });
    setShowSectionModal(true);
  };
  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    try {
      if (sectionEditMode) {
        await api.put(`/admin/sections/${sectionForm.id}`, sectionForm);
        alert('Section successfully updated.');
      } else {
        await api.post('/admin/sections', sectionForm);
        alert('New section successfully registered.');
      }
      setShowSectionModal(false);
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };
  const handleDeleteSection = async (id) => {
    if (window.confirm('Delete this class section? This will drop all registered student enrollments.')) {
      try {
        await api.delete(`/admin/sections/${id}`);
        alert('Section deleted.');
        loadAllData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete section');
      }
    }
  };

  // --- Enrollment handlers ---
  const handleOpenEnroll = () => {
    setEnrollForm({
      studentID: students[0]?.STUDENT_ID || '',
      sectionID: sections[0]?.SECTION_ID || ''
    });
    setShowEnrollModal(true);
  };
  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/enroll', enrollForm);
      alert('Student successfully enrolled in section.');
      setShowEnrollModal(false);
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to enroll student');
    }
  };
  const handleDropEnrollment = async (id) => {
    if (window.confirm('Drop this student enrollment? This will erase their attendance logs and grades for this section.')) {
      try {
        await api.delete(`/admin/enrollments/${id}`);
        alert('Enrollment dropped successfully.');
        loadAllData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to drop enrollment');
      }
    }
  };

  return (
    <div className="container mt-4 pb-5 text-start">
      <div className="mb-4">
        <h3 className="fw-bold text-white">Curriculum & Class Coordinator</h3>
        <p className="text-secondary">Manage the course catalog, create class sections, assign instructors, and handle student enrollment lists.</p>
      </div>

      {/* Tabs */}
      <div className="d-flex border-bottom border-white-5 mb-4 gap-2">
        <button className={`btn py-2 px-4 border-0 rounded-0 ${activeTab === 'courses' ? 'btn-glass text-white' : 'btn-glass-secondary text-secondary'}`} onClick={() => setActiveTab('courses')}>Courses Catalog</button>
        <button className={`btn py-2 px-4 border-0 rounded-0 ${activeTab === 'sections' ? 'btn-glass text-white' : 'btn-glass-secondary text-secondary'}`} onClick={() => setActiveTab('sections')}>Class Sections</button>
        <button className={`btn py-2 px-4 border-0 rounded-0 ${activeTab === 'enrollments' ? 'btn-glass text-white' : 'btn-glass-secondary text-secondary'}`} onClick={() => setActiveTab('enrollments')}>Student Enrollments</button>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-info" role="status">
            <span className="visually-hidden">Loading registry data...</span>
          </div>
        </div>
      ) : (
        <div>
          {/* --- TAB 1: COURSES --- */}
          {activeTab === 'courses' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-semibold text-white mb-0">Total Courses: {courses.length}</h5>
                <button className="btn btn-glass btn-sm" onClick={handleOpenAddCourse}>+ Add Course</button>
              </div>
              <div className="glass-card p-4">
                <div className="table-responsive">
                  <table className="table-glass">
                    <thead>
                      <tr>
                        <th className="text-start">Course Code</th>
                        <th>Course Title</th>
                        <th>Credit Hours</th>
                        <th>Department</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map(c => (
                        <tr key={c.COURSE_ID}>
                          <td className="text-start">
                            <span className="badge-glass badge-glass-info">{c.COURSE_CODE}</span>
                          </td>
                          <td className="text-white fw-medium">{c.COURSE_TITLE}</td>
                          <td><span className="text-light">{c.CREDIT_HOURS} CH</span></td>
                          <td className="small text-secondary">{c.DEPT_NAME}</td>
                          <td>
                            <div className="d-flex justify-content-center gap-2">
                              <button className="btn btn-glass-secondary btn-sm py-1 px-2 text-warning" onClick={() => handleOpenEditCourse(c)}>Edit</button>
                              <button className="btn btn-glass-secondary btn-sm py-1 px-2 text-danger" onClick={() => handleDeleteCourse(c.COURSE_ID)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB 2: SECTIONS --- */}
          {activeTab === 'sections' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-semibold text-white mb-0">Total Active Sections: {sections.length}</h5>
                <button className="btn btn-glass btn-sm" onClick={handleOpenAddSection}>+ Add Section</button>
              </div>
              <div className="glass-card p-4">
                <div className="table-responsive">
                  <table className="table-glass">
                    <thead>
                      <tr>
                        <th className="text-start">Section ID</th>
                        <th>Course Details</th>
                        <th>Assigned Instructor</th>
                        <th>Term</th>
                        <th>Available Seats</th>
                        <th>Room/Schedule</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sections.map(s => (
                        <tr key={s.SECTION_ID}>
                          <td className="text-start"><code>{s.SECTION_ID}</code></td>
                          <td>
                            <div className="fw-semibold text-white">{s.COURSE_CODE}</div>
                            <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>{s.COURSE_TITLE}</div>
                          </td>
                          <td className="small text-light">{s.FACULTY_NAME}</td>
                          <td className="small text-secondary">{s.SEMESTER} {s.YEAR}</td>
                          <td>
                            <span className={`badge-glass ${s.AVAILABLE_SEATS > 5 ? 'badge-glass-success' : 'badge-glass-danger'}`}>
                              {s.AVAILABLE_SEATS} / {s.CAPACITY} Free
                            </span>
                          </td>
                          <td className="small text-secondary">
                            <div>Room: {s.ROOM || 'TBD'}</div>
                            <div>{s.SCHEDULE || 'TBD'}</div>
                          </td>
                          <td>
                            <div className="d-flex justify-content-center gap-2">
                              <button className="btn btn-glass-secondary btn-sm py-1 px-2 text-warning" onClick={() => handleOpenEditSection(s)}>Edit</button>
                              <button className="btn btn-glass-secondary btn-sm py-1 px-2 text-danger" onClick={() => handleDeleteSection(s.SECTION_ID)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB 3: ENROLLMENTS --- */}
          {activeTab === 'enrollments' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-semibold text-white mb-0">Active Student Registrations: {enrollments.length}</h5>
                <button className="btn btn-glass btn-sm" onClick={handleOpenEnroll}>+ Enroll Student</button>
              </div>
              <div className="glass-card p-4">
                <div className="table-responsive">
                  <table className="table-glass">
                    <thead>
                      <tr>
                        <th className="text-start">Enrollment ID</th>
                        <th>Student Name</th>
                        <th>Class Section ID</th>
                        <th>Course Registered</th>
                        <th>Semester term</th>
                        <th>Enroll Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.map(e => (
                        <tr key={e.ENROLLMENT_ID}>
                          <td className="text-start"><code>{e.ENROLLMENT_ID}</code></td>
                          <td>
                            <div className="fw-semibold text-white">{e.STUDENT_NAME}</div>
                            <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>ID: {e.STUDENT_ID}</div>
                          </td>
                          <td><code>{e.SECTION_ID}</code></td>
                          <td className="small text-light">{e.COURSE_CODE} - {e.COURSE_TITLE}</td>
                          <td className="small text-secondary">{e.SEMESTER} {e.YEAR}</td>
                          <td className="small text-secondary">{new Date(e.ENROLL_DATE).toLocaleDateString()}</td>
                          <td>
                            <button className="btn btn-glass-secondary btn-sm py-1 px-2 text-danger" onClick={() => handleDropEnrollment(e.ENROLLMENT_ID)}>Drop</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- ADD/EDIT COURSE MODAL --- */}
      {showCourseModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modal-glass">
              <div className="modal-header modal-glass-header">
                <h5 className="modal-title fw-bold">{courseEditMode ? 'Update Course Details' : 'Create Catalog Course'}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCourseModal(false)}></button>
              </div>
              <form onSubmit={courseForm.id ? handleCourseSubmit : handleCourseSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label text-secondary small">Course Code</label>
                      <input type="text" placeholder="CS101" required className="form-control form-glass-control" value={courseForm.code} onChange={e => setCourseForm({...courseForm, code: e.target.value})} />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-secondary small">Course Title</label>
                      <input type="text" placeholder="Intro to Programming" required className="form-control form-glass-control" value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-secondary small">Credit Hours</label>
                      <select className="form-select form-glass-control" value={courseForm.creditHours} onChange={e => setCourseForm({...courseForm, creditHours: Number(e.target.value)})}>
                        <option value="1">1 CH</option>
                        <option value="2">2 CH</option>
                        <option value="3">3 CH</option>
                        <option value="4">4 CH</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label text-secondary small">Department</label>
                      <select required className="form-select form-glass-control" value={courseForm.departmentID} onChange={e => setCourseForm({...courseForm, departmentID: e.target.value})}>
                        <option value="" disabled>Select a department</option>
                        {departments.map(d => <option key={d.DEPT_ID} value={d.DEPT_ID}>{d.DEPT_NAME}</option>)}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label text-secondary small">Description</label>
                      <textarea placeholder="Course syllabus overview..." rows="3" className="form-control form-glass-control" value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer modal-glass-footer">
                  <button type="button" className="btn btn-glass-secondary" onClick={() => setShowCourseModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-glass">{courseEditMode ? 'Save Changes' : 'Create Course'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD/EDIT SECTION MODAL --- */}
      {showSectionModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modal-glass">
              <div className="modal-header modal-glass-header">
                <h5 className="modal-title fw-bold">{sectionEditMode ? 'Update Class Section' : 'Create Class Section'}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowSectionModal(false)}></button>
              </div>
              <form onSubmit={handleSectionSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label text-secondary small">Course Selection</label>
                      <select className="form-select form-glass-control" value={sectionForm.courseID} onChange={e => setSectionForm({...sectionForm, courseID: e.target.value})}>
                        {courses.map(c => <option key={c.COURSE_ID} value={c.COURSE_ID}>{c.COURSE_CODE} - {c.COURSE_TITLE}</option>)}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label text-secondary small">Assign Faculty Instructor</label>
                      <select className="form-select form-glass-control" value={sectionForm.facultyID} onChange={e => setSectionForm({...sectionForm, facultyID: e.target.value})}>
                        {faculties.map(f => <option key={f.FACULTY_ID} value={f.FACULTY_ID}>{f.FIRST_NAME} {f.LAST_NAME}</option>)}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label text-secondary small">Semester Term</label>
                      <select className="form-select form-glass-control" value={sectionForm.semester} onChange={e => setSectionForm({...sectionForm, semester: e.target.value})}>
                        <option value="Fall">Fall</option>
                        <option value="Spring">Spring</option>
                        <option value="Summer">Summer</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label text-secondary small">Year</label>
                      <input type="number" required className="form-control form-glass-control" value={sectionForm.year} onChange={e => setSectionForm({...sectionForm, year: Number(e.target.value)})} />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-secondary small">Section Capacity</label>
                      <input type="number" required className="form-control form-glass-control" value={sectionForm.capacity} onChange={e => {
                        const cap = Number(e.target.value);
                        setSectionForm({
                          ...sectionForm, 
                          capacity: cap, 
                          availableSeats: sectionEditMode ? sectionForm.availableSeats : cap 
                        });
                      }} />
                    </div>
                    {sectionEditMode && (
                      <div className="col-6">
                        <label className="form-label text-secondary small">Available Seats</label>
                        <input type="number" required className="form-control form-glass-control" value={sectionForm.availableSeats} onChange={e => setSectionForm({...sectionForm, availableSeats: Number(e.target.value)})} />
                      </div>
                    )}
                    <div className="col-12">
                      <label className="form-label text-secondary small">Class Schedule Time</label>
                      <input type="text" placeholder="Mon-Wed 10:00-11:30" required className="form-control form-glass-control" value={sectionForm.schedule} onChange={e => setSectionForm({...sectionForm, schedule: e.target.value})} />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-secondary small">Classroom Room Location</label>
                      <input type="text" placeholder="R101" required className="form-control form-glass-control" value={sectionForm.room} onChange={e => setSectionForm({...sectionForm, room: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer modal-glass-footer">
                  <button type="button" className="btn btn-glass-secondary" onClick={() => setShowSectionModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-glass">{sectionEditMode ? 'Save Changes' : 'Create Section'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- ENROLL STUDENT MODAL --- */}
      {showEnrollModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modal-glass">
              <div className="modal-header modal-glass-header">
                <h5 className="modal-title fw-bold">Manual Enrollment Portal</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowEnrollModal(false)}></button>
              </div>
              <form onSubmit={handleEnrollSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label text-secondary small">Select Student</label>
                      <select className="form-select form-glass-control" value={enrollForm.studentID} onChange={e => setEnrollForm({...enrollForm, studentID: e.target.value})}>
                        {students.map(st => (
                          <option key={st.STUDENT_ID} value={st.STUDENT_ID}>
                            ID: {st.STUDENT_ID} - {st.FIRST_NAME} {st.LAST_NAME} ({st.PROGRAM_NAME})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label text-secondary small">Select Class Section</label>
                      <select className="form-select form-glass-control" value={enrollForm.sectionID} onChange={e => setEnrollForm({...enrollForm, sectionID: e.target.value})}>
                        {sections.map(s => (
                          <option key={s.SECTION_ID} value={s.SECTION_ID}>
                            ID: {s.SECTION_ID} - {s.COURSE_CODE} ({s.SEMESTER} {s.YEAR}) | Instructor: {s.FACULTY_NAME}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer modal-glass-footer">
                  <button type="button" className="btn btn-glass-secondary" onClick={() => setShowEnrollModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-glass">Enroll Student</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CourseManagement;
