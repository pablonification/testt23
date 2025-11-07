import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { assignmentService } from '../services/assignmentService';
import LeftSidebar from '../components/LeftSidebar';   
import RightSidebar from '../components/RightSidebar'; 
import TopHeader from '../components/TopHeader';       
import './AssignmentDetailsPage.css';

export default function AssignmentDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [classComments, setClassComments] = useState([]);
  const [privateComments, setPrivateComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showClassCommentModal, setShowClassCommentModal] = useState(false);
  const [showPrivateCommentModal, setShowPrivateCommentModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);


  const [classCommentText, setClassCommentText] = useState('');
  const [privateCommentText, setPrivateCommentText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadAssignmentDetails();
  }, [id]);

  async function loadAssignmentDetails() {
    setLoading(true);
    try {
      const response = await assignmentService.getAssignmentDetails(id);
      
      if (response.success) {
        setAssignment(response.assignment);
        setSubmission(response.submission);
        setClassComments(response.classComments || []);
        setPrivateComments(response.privateComments || []);
        console.log('✅ Assignment details loaded');
      } else {
        console.error('Failed to load assignment:', response.error);
        alert('Failed to load assignment details');
      }
    } catch (error) {
      console.error('Error loading assignment:', error);
      alert('Error loading assignment details');
    } finally {
      setLoading(false);
    }
  }


  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
  
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  }


  async function handleSubmitWork() {
    if (!selectedFile && !submissionText.trim()) {
      alert('Please select a file or enter submission text');
      return;
    }

    setUploading(true);
    try {
      let fileUrl = null;
      let fileName = null;


      if (selectedFile) {
        const uploadResponse = await assignmentService.uploadFile(selectedFile);
        
        if (!uploadResponse.success) {
          alert('Failed to upload file: ' + uploadResponse.error);
          setUploading(false);
          return;
        }

        fileUrl = uploadResponse.fileUrl;
        fileName = uploadResponse.fileName;
      }

      const submitResponse = await assignmentService.submitAssignment(
        id,
        fileUrl,
        fileName,
        submissionText.trim() || null
      );

      if (submitResponse.success) {
        alert('Assignment submitted successfully! ✅');
        setShowUploadModal(false);
        setSelectedFile(null);
        setSubmissionText('');
        loadAssignmentDetails(); 
      } else {
        alert('Failed to submit assignment: ' + submitResponse.error);
      }
    } catch (error) {
      console.error('Submit work error:', error);
      alert('Error submitting assignment');
    } finally {
      setUploading(false);
    }
  }

  async function handleMarkAsDone() {
    const confirm = window.confirm('Mark this assignment as done?');
    if (!confirm) return;

    try {
      const response = await assignmentService.markAsDone(id);
      
      if (response.success) {
        alert('Assignment marked as done! ✅');
        loadAssignmentDetails();
      } else {
        alert('Failed to mark as done: ' + response.error);
      }
    } catch (error) {
      console.error('Mark as done error:', error);
      alert('Error marking assignment as done');
    }
  }

  async function handleAddClassComment() {
    if (!classCommentText.trim()) {
      alert('Please enter a comment');
      return;
    }

    try {
      const response = await assignmentService.addClassComment(id, classCommentText.trim());
      
      if (response.success) {
        alert('Comment added successfully! 💬');
        setShowClassCommentModal(false);
        setClassCommentText('');
        loadAssignmentDetails(); 
      } else {
        alert('Failed to add comment: ' + response.error);
      }
    } catch (error) {
      console.error('Add class comment error:', error);
      alert('Error adding comment');
    }
  }


  async function handleAddPrivateComment() {
    if (!privateCommentText.trim()) {
      alert('Please enter a comment');
      return;
    }

    if (!submission) {
      alert('You must submit work first before adding private comments');
      return;
    }

    try {
      const response = await assignmentService.addPrivateComment(
        submission.id,
        privateCommentText.trim()
      );
      
      if (response.success) {
        alert('Private comment added successfully! 🔒');
        setShowPrivateCommentModal(false);
        setPrivateCommentText('');
        loadAssignmentDetails(); 
      } else {
        alert('Failed to add private comment: ' + response.error);
      }
    } catch (error) {
      console.error('Add private comment error:', error);
      alert('Error adding private comment');
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  if (loading) {
    return (
      <div className="assignment-details-root">
        <LeftSidebar activePage="assignment" />
        <main className="assignment-details-content">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h2>Loading assignment details... 📋</h2>
          </div>
        </main>
        <RightSidebar />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="assignment-details-root">
        <LeftSidebar activePage="assignment" />
        <main className="assignment-details-content">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h2>Assignment not found ❌</h2>
            <button onClick={() => navigate('/assignment')}>Back to Assignments</button>
          </div>
        </main>
        <RightSidebar />
      </div>
    );
  }

  return (
    <div className="assignment-details-root">
      <LeftSidebar activePage="assignment" />

      <main className="assignment-details-content">
        <TopHeader />

        <div className="breadcrumb">
          <span onClick={() => navigate('/homepage')} className="breadcrumb-link">Dashboard</span>
          <span className="breadcrumb-separator">›</span>
          <span onClick={() => navigate('/assignment')} className="breadcrumb-link">Assignment</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{assignment.title}</span>
        </div>

        <div className="assignment-details-card">
          <div className="assignment-header">
            <div className="assignment-icon">📋</div>
            <div className="assignment-title-section">
              <h1 className="assignment-title">{assignment.title}</h1>
              <p className="assignment-due">Due {formatDate(assignment.due_date)}</p>
            </div>
          </div>

          <div className="assignment-content-body">
            <div className="assignment-meta">
              <strong>[ {assignment.chapter} ]</strong>
            </div>

            <div className="assignment-description">
              <p>{assignment.description}</p>
            </div>

            <div className="assignment-meta">
              <p><strong>Points:</strong> {assignment.points}</p>
            </div>
          </div>

          <div className="class-comments-section">
            <div className="comments-header">
              <span className="comments-icon">👥</span>
              <h3>Class Comments ({classComments.length})</h3>
            </div>
            <button 
              className="add-comment-btn"
              onClick={() => setShowClassCommentModal(true)}
            >
              Add Comment
            </button>
          </div>

          {classComments.length > 0 && (
            <div className="comments-list">
              {classComments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <strong>{comment.users?.full_name || 'Unknown User'}</strong>
                    <span className="comment-nim">({comment.users?.nim})</span>
                    <span className="comment-date">{formatDate(comment.created_at)}</span>
                  </div>
                  <p className="comment-text">{comment.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="your-work-card-main">
          <div className="work-header">
            <h3>Your Work</h3>
            <span className={`work-status ${submission?.status || 'assigned'}`}>
              {submission?.status || 'Assigned'}
            </span>
          </div>


          {submission?.submission_file_url && (
            <div className="submitted-file">
              <p><strong>Submitted File:</strong></p>
              <a 
                href={submission.submission_file_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="file-link"
              >
                📎 {submission.submission_file_name}
              </a>
              {submission.submitted_at && (
                <p className="submission-date">
                  Submitted on: {formatDate(submission.submitted_at)}
                </p>
              )}
              {submission.grade !== null && (
                <p className="submission-grade">
                  Grade: {submission.grade}/{assignment.points}
                </p>
              )}
            </div>
          )}

          {submission?.submission_text && (
            <div className="submitted-text">
              <p><strong>Your Answer:</strong></p>
              <p>{submission.submission_text}</p>
            </div>
          )}
          
          <button 
            className="add-work-btn" 
            onClick={() => setShowUploadModal(true)}
            disabled={submission?.status === 'graded'}
          >
            {submission ? '📝 Update Submission' : '+ Add or Create'}
          </button>
          
          <button 
            className="mark-done-btn" 
            onClick={handleMarkAsDone}
            disabled={submission?.status === 'submitted' || submission?.status === 'graded'}
          >
            Mark As Done
          </button>

   
          <div className="private-comments-section">
            <div className="private-header">
              <span className="private-icon">🔒</span>
              <h4>Private Comments ({privateComments.length})</h4>
            </div>

   
            {privateComments.length > 0 && (
              <div className="private-comments-list">
                {privateComments.map((comment) => (
                  <div 
                    key={comment.id} 
                    className={`private-comment-item ${comment.is_teacher ? 'teacher' : 'student'}`}
                  >
                    <div className="comment-header">
                      <strong>
                        {comment.is_teacher ? '👨‍🏫 Teacher' : '👤 You'}
                      </strong>
                      <span className="comment-date">{formatDate(comment.created_at)}</span>
                    </div>
                    <p className="comment-text">{comment.comment}</p>
                  </div>
                ))}
              </div>
            )}

            <button 
              className="add-private-comment-btn"
              onClick={() => setShowPrivateCommentModal(true)}
              disabled={!submission}
            >
              Add Private Comment
            </button>
            {!submission && (
              <p className="private-hint">Submit work first to add private comments</p>
            )}
          </div>
        </div>
      </main>

      <RightSidebar />


      {showClassCommentModal && (
        <div className="modal-overlay" onClick={() => setShowClassCommentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Class Comment</h3>
              <button 
                className="modal-close"
                onClick={() => setShowClassCommentModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <textarea
                placeholder="Enter your comment..."
                value={classCommentText}
                onChange={(e) => setClassCommentText(e.target.value)}
                rows={5}
                className="comment-textarea"
              />
            </div>
            <div className="modal-footer">
              <button 
                className="modal-btn cancel"
                onClick={() => {
                  setShowClassCommentModal(false);
                  setClassCommentText('');
                }}
              >
                Cancel
              </button>
              <button 
                className="modal-btn submit"
                onClick={handleAddClassComment}
                disabled={!classCommentText.trim()}
              >
                Post Comment
              </button>
            </div>
          </div>
        </div>
      )}

   
      {showPrivateCommentModal && (
        <div className="modal-overlay" onClick={() => setShowPrivateCommentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Private Comment</h3>
              <button 
                className="modal-close"
                onClick={() => setShowPrivateCommentModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <textarea
                placeholder="Enter your private comment (only you and teacher can see this)..."
                value={privateCommentText}
                onChange={(e) => setPrivateCommentText(e.target.value)}
                rows={5}
                className="comment-textarea"
              />
            </div>
            <div className="modal-footer">
              <button 
                className="modal-btn cancel"
                onClick={() => {
                  setShowPrivateCommentModal(false);
                  setPrivateCommentText('');
                }}
              >
                Cancel
              </button>
              <button 
                className="modal-btn submit"
                onClick={handleAddPrivateComment}
                disabled={!privateCommentText.trim()}
              >
                Post Private Comment
              </button>
            </div>
          </div>
        </div>
      )}

 
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content upload-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Submit Your Work</h3>
              <button 
                className="modal-close"
                onClick={() => setShowUploadModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
        
              <div className="upload-section">
                <label className="upload-label">Upload File (Optional)</label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="file-input"
                  accept=".pdf,.doc,.docx,.xlsx,.xls,.ppt,.pptx,.zip,.rar"
                />
                {selectedFile && (
                  <div className="selected-file">
                    <span>📎 {selectedFile.name}</span>
                    <button 
                      className="remove-file"
                      onClick={() => setSelectedFile(null)}
                    >
                      ✕
                    </button>
                  </div>
                )}
                <p className="upload-hint">Max file size: 10MB. Supported: PDF, DOC, XLSX, etc.</p>
              </div>


              <div className="text-section">
                <label className="upload-label">Or Enter Your Answer (Optional)</label>
                <textarea
                  placeholder="Type your answer here..."
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  rows={6}
                  className="comment-textarea"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="modal-btn cancel"
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setSubmissionText('');
                }}
                disabled={uploading}
              >
                Cancel
              </button>
              <button 
                className="modal-btn submit"
                onClick={handleSubmitWork}
                disabled={uploading || (!selectedFile && !submissionText.trim())}
              >
                {uploading ? '⏳ Uploading...' : '✅ Submit Work'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}