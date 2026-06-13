import React, { useEffect, useState } from 'react';
import api from '../../api/api';

const Results = () => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const loadResults = async () => {
      try {
        const studentID = localStorage.getItem('referenceID');
        const res = await api.get(`/student/result-card?studentID=${studentID}`);
        setResults(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadResults();
  }, []);

  return (
    <div className="container mt-4">
      <h3>Result Card</h3>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Course</th>
            <th>Grade</th>
            <th>Letter</th>
            <th>Points</th>
            <th>Term</th>
          </tr>
        </thead>
        <tbody>
          {results.map(row => (
            <tr key={`${row.COURSE_CODE}-${row.GRADE_VALUE}-${row.LETTER_GRADE}`}>
              <td>{row.COURSE_CODE} - {row.COURSE_TITLE}</td>
              <td>{row.GRADE_VALUE}</td>
              <td>{row.LETTER_GRADE}</td>
              <td>{row.GRADE_POINTS}</td>
              <td>{row.SEMESTER} {row.YEAR}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Results;
