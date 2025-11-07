import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assignmentService } from '../services/assignmentService';
import LeftSidebar from '../components/LeftSidebar';   
import RightSidebar from '../components/RightSidebar'; 
import TopHeader from '../components/TopHeader';       
import './AssignmentPage.css';

export default function AssignmentPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, []);

  async function loadAssignments() {
    setLoading(true);
    try {
      const response = await assignmentService.getAssignments();
      
      if (response.success) {
        setAssignments(response.assignments || []);
        console.log('✅ Assignments loaded:', response.assignments);
      } else {
        console.error('Failed to load assignments:', response.error);
        alert('Failed to load assignments');
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
      alert('Error loading assignments');
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(assignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAssignments = assignments.slice(startIndex, endIndex);

  function handleOpenAssignment(assignment) {
    navigate(`/assignment/${assignment.id}`);
  }


  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (loading) {
    return (
      <div className="assignment-root">
        <LeftSidebar activePage="assignment" />
        <main className="assignment-content">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h2>Loading assignments... 📚</h2>
          </div>
        </main>
        <RightSidebar />
      </div>
    );
  }

  return (
    <div className="assignment-root">
      <LeftSidebar activePage="assignment" />

      <main className="assignment-content">
        <TopHeader />

        <div className="breadcrumb">
          <span onClick={() => navigate('/homepage')} className="breadcrumb-link">Dashboard</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Assignment</span>
        </div>

    
        <div className="assignment-table-container">
          {assignments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <h3>No assignments available yet 📋</h3>
            </div>
          ) : (
            <>
              <table className="assignment-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Chapter</th>
                    <th>Title</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAssignments.map((assignment, index) => (
                    <tr key={assignment.id} className="assignment-row">
                      <td>{startIndex + index + 1}</td>
                      <td>{assignment.chapter}</td>
                      <td>{assignment.title}</td>
                      <td>{formatDate(assignment.start_date)}</td>
                      <td>{formatDate(assignment.due_date)}</td>
                      <td>
                        <span className={`status-badge ${assignment.submission_status}`}>
                          {assignment.submission_status === 'assigned' ? 'Unsubmitted' : assignment.submission_status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="open-btn"
                          onClick={() => handleOpenAssignment(assignment)}
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    &lt;&lt; Back
                  </button>
                  
                  <div className="pagination-pages">
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        className={`pagination-page ${currentPage === index + 1 ? 'active' : ''}`}
                        onClick={() => setCurrentPage(index + 1)}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>

                  <button 
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next &gt;&gt;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <RightSidebar />
    </div>
  );
}