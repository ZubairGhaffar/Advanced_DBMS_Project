import React, { useEffect, useState } from 'react';
import api from '../../api/api';

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadResults = async () => {
      try {
        const res = await api.get('/student/result-card');
        setResults(res.data || []);
      } catch (err) {
        console.error(err);
        if (err.response && err.response.status === 403) {
          setError(err.response.data.message);
        }
      } finally {
        setLoading(false);
      }
    };
    loadResults();
  }, []);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-info" role="status">
          <span className="visually-hidden">Loading results...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5 text-center pb-5">
        <div className="glass-card p-5 border border-danger-5">
          <div className="display-1 mb-4">🔒</div>
          <h3 className="fw-bold text-white mb-3">Academic Records Withheld</h3>
          <p className="text-secondary mx-auto mb-4" style={{ maxWidth: '500px' }}>
            {error}
          </p>
          <div>
            <a href="/student/pay-fee" className="btn btn-glass px-4 py-2 fw-bold text-decoration-none">
              💳 Settle Outstanding Fees
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats using weighted formula
  const totalCredits = results.reduce((acc, curr) => acc + Number(curr.CREDIT_HOURS || curr.credit_hours || 0), 0);
  const totalQualityPoints = results.reduce((acc, curr) => acc + Number(curr.GRADE_POINTS || curr.grade_points || 0) * Number(curr.CREDIT_HOURS || curr.credit_hours || 0), 0);
  const cgpa = totalCredits > 0 ? (totalQualityPoints / totalCredits).toFixed(2) : '0.00';
  const totalCourses = results.length;

  // Group results by semester + year
  const groupedResults = {};
  results.forEach(row => {
    const sem = row.SEMESTER || row.semester || 'Other';
    const yr = row.YEAR || row.year || '';
    const key = `${sem} ${yr}`.trim();
    if (!groupedResults[key]) {
      groupedResults[key] = [];
    }
    groupedResults[key].push(row);
  });

  // Sort semesters latest first
  const sortedSemesters = Object.keys(groupedResults).sort((a, b) => {
    const [semA, yrA] = a.split(' ');
    const [semB, yrB] = b.split(' ');
    const yearDiff = Number(yrB || 0) - Number(yrA || 0);
    if (yearDiff !== 0) return yearDiff;
    
    const semOrder = { 'Fall': 3, 'Summer': 2, 'Spring': 1 };
    return (semOrder[semB] || 0) - (semOrder[semA] || 0);
  });

  return (
    <div className="container mt-4 pb-5">
      <div className="mb-4">
        <h3 className="fw-bold text-white">Academic Performance Card</h3>
        <p className="text-secondary">Track your cumulative results, semester-wise grade point average, and credit summary.</p>
      </div>

      {results.length === 0 ? (
        <div className="glass-card text-center p-5">
          <h3>No Results Recorded</h3>
          <p className="text-secondary">Your instructors haven't finalized any exam scores or letter grades for this term yet.</p>
        </div>
      ) : (
        <div className="row gy-4">
          {/* Cumulative Summary Cards */}
          <div className="col-12">
            <div className="row gy-3">
              <div className="col-md-4">
                <div className="glass-card p-3 d-flex align-items-center justify-content-between">
                  <div>
                    <span className="text-secondary small">Cumulative GPA (CGPA)</span>
                    <h2 className="fw-bold text-white mb-0 mt-1">{cgpa}</h2>
                  </div>
                  <span className="h1 mb-0">🏆</span>
                </div>
              </div>
              <div className="col-md-4">
                <div className="glass-card p-3 d-flex align-items-center justify-content-between">
                  <div>
                    <span className="text-secondary small">Total Credits Earned</span>
                    <h2 className="fw-bold text-white mb-0 mt-1">{totalCredits} CH</h2>
                  </div>
                  <span className="h1 mb-0">🎓</span>
                </div>
              </div>
              <div className="col-md-4">
                <div className="glass-card p-3 d-flex align-items-center justify-content-between">
                  <div>
                    <span className="text-secondary small">Courses Completed</span>
                    <h2 className="fw-bold text-white mb-0 mt-1">{totalCourses}</h2>
                  </div>
                  <span className="h1 mb-0">⭐</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual SVG Score Bar Chart */}
          <div className="col-lg-12">
            <div className="glass-card p-4">
              <h5 className="fw-semibold text-white mb-4">Course Score Breakdown (%)</h5>
              <div className="py-2">
                {results.map((row, idx) => {
                  const score = Number(row.GRADE_VALUE || row.grade_value || 0);
                  const code = row.COURSE_CODE || row.course_code;
                  const title = row.COURSE_TITLE || row.course_title;
                  const letter = row.LETTER_GRADE || row.letter_grade;

                  let progressColor = '#00a8cc';
                  if (score >= 85) progressColor = '#00e676';
                  else if (score >= 70) progressColor = '#8c52ff';
                  else if (score < 50) progressColor = '#ff3d00';

                  return (
                    <div key={idx} className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-1 text-start">
                        <span className="text-light small fw-medium">{code} - {title}</span>
                        <span className="text-secondary small fw-bold">{score}% (<span style={{ color: progressColor }}>{letter}</span>)</span>
                      </div>
                      
                      <div className="progress" style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                        <div 
                          className="progress-bar" 
                          role="progressbar" 
                          style={{ 
                            width: `${score}%`, 
                            backgroundColor: progressColor,
                            boxShadow: `0 0 10px ${progressColor}88`,
                            transition: 'width 1.2s ease-in-out' 
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Semester-Wise Results Sections */}
          <div className="col-12">
            {sortedSemesters.map((semKey, idx) => {
              const semCourses = groupedResults[semKey];
              
              // Calculate SGPA for this semester
              const semCredits = semCourses.reduce((acc, curr) => acc + Number(curr.CREDIT_HOURS || curr.credit_hours || 0), 0);
              const semQualityPoints = semCourses.reduce((acc, curr) => acc + Number(curr.GRADE_POINTS || curr.grade_points || 0) * Number(curr.CREDIT_HOURS || curr.credit_hours || 0), 0);
              const sgpa = semCredits > 0 ? (semQualityPoints / semCredits).toFixed(2) : '0.00';

              return (
                <div key={idx} className="glass-card p-4 mb-4">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4 border-bottom border-white-5 pb-3">
                    <h5 className="fw-bold text-white mb-0">📁 {semKey} Semester</h5>
                    <div className="d-flex gap-2">
                      <span className="badge-glass badge-glass-success fw-bold px-3 py-2 fs-6">
                        SGPA: {sgpa}
                      </span>
                      <span className="badge-glass badge-glass-info fw-bold px-3 py-2 fs-6">
                        Credits: {semCredits} CH
                      </span>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="table-glass">
                      <thead>
                        <tr>
                          <th className="text-start">Course</th>
                          <th>Credits</th>
                          <th>Numeric Score</th>
                          <th>Letter Grade</th>
                          <th>Grade Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {semCourses.map((row, sIdx) => {
                          const code = row.COURSE_CODE || row.course_code;
                          const title = row.COURSE_TITLE || row.course_title;
                          const credits = row.CREDIT_HOURS || row.credit_hours || 0;
                          const score = row.GRADE_VALUE || row.grade_value;
                          const letter = row.LETTER_GRADE || row.letter_grade;
                          const pts = Number(row.GRADE_POINTS || row.grade_points || 0);

                          let badgeClass = 'badge-glass-info';
                          if (pts >= 3.7) badgeClass = 'badge-glass-success';
                          else if (pts >= 2.5) badgeClass = 'badge-glass-warning';
                          else if (pts === 0) badgeClass = 'badge-glass-danger';

                          return (
                            <tr key={sIdx}>
                              <td className="text-start">
                                <div className="fw-semibold text-white">{code}</div>
                                <div className="text-secondary small">{title}</div>
                              </td>
                              <td>
                                <span className="text-light">{credits} CH</span>
                              </td>
                              <td>
                                <strong className="text-light">{score}%</strong>
                              </td>
                              <td>
                                <span className={`badge-glass ${badgeClass}`}>{letter}</span>
                              </td>
                              <td>
                                <span className="text-light fw-medium">{pts.toFixed(2)}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
