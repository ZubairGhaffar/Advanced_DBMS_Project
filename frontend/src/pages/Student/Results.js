import React, { useEffect, useState } from 'react';
import api from '../../api/api';

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      try {
        const res = await api.get('/student/result-card');
        setResults(res.data || []);
      } catch (err) {
        console.error(err);
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

  // Calculate stats
  const totalCourses = results.length;
  const totalPoints = results.reduce((acc, curr) => acc + Number(curr.GRADE_POINTS || curr.grade_points || 0), 0);
  const cgpa = totalCourses > 0 ? (totalPoints / totalCourses).toFixed(2) : '0.00';

  return (
    <div className="container mt-4 pb-5">
      <div className="mb-4">
        <h3 className="fw-bold text-white">Academic Performance Card</h3>
        <p className="text-secondary">Track your cumulative results, grade point average, and credit summary.</p>
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
                    <span className="text-secondary small">Cumulative GPA</span>
                    <h2 className="fw-bold text-white mb-0 mt-1">{cgpa}</h2>
                  </div>
                  <span className="h1 mb-0">🏆</span>
                </div>
              </div>
              <div className="col-md-4">
                <div className="glass-card p-3 d-flex align-items-center justify-content-between">
                  <div>
                    <span className="text-secondary small">Completed Courses</span>
                    <h2 className="fw-bold text-white mb-0 mt-1">{totalCourses}</h2>
                  </div>
                  <span className="h1 mb-0">🎓</span>
                </div>
              </div>
              <div className="col-md-4">
                <div className="glass-card p-3 d-flex align-items-center justify-content-between">
                  <div>
                    <span className="text-secondary small">Degree Standing</span>
                    <h2 className="fw-bold text-white mb-0 mt-1">Excellent</h2>
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

                  // Determine dynamic gradient color class or color string based on grade
                  let progressColor = '#00a8cc'; // default blue
                  if (score >= 85) progressColor = '#00e676'; // green
                  else if (score >= 70) progressColor = '#8c52ff'; // purple
                  else if (score < 50) progressColor = '#ff3d00'; // red

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

          {/* Detailed Results Table */}
          <div className="col-12">
            <div className="glass-card p-4">
              <h5 className="fw-semibold text-white mb-4">Transcript Grade Sheet</h5>
              <div className="table-responsive">
                <table className="table-glass">
                  <thead>
                    <tr>
                      <th className="text-start">Course</th>
                      <th>Numeric Score</th>
                      <th>Letter Grade</th>
                      <th>Grade Points</th>
                      <th>Academic Term</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row, idx) => {
                      const code = row.COURSE_CODE || row.course_code;
                      const title = row.COURSE_TITLE || row.course_title;
                      const score = row.GRADE_VALUE || row.grade_value;
                      const letter = row.LETTER_GRADE || row.letter_grade;
                      const pts = Number(row.GRADE_POINTS || row.grade_points || 0);
                      const semester = row.SEMESTER || row.semester;
                      const year = row.YEAR || row.year;

                      let badgeClass = 'badge-glass-info';
                      if (pts >= 3.7) badgeClass = 'badge-glass-success';
                      else if (pts >= 2.5) badgeClass = 'badge-glass-warning';
                      else if (pts === 0) badgeClass = 'badge-glass-danger';

                      return (
                        <tr key={idx}>
                          <td className="text-start">
                            <div className="fw-semibold text-white">{code}</div>
                            <div className="text-secondary small">{title}</div>
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
                          <td>
                            <span className="text-secondary small">{semester} {year}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
