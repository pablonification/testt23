import { supabase } from '../config/supabase.js';
import multer from 'multer';

const storage = multer.memoryStorage();
export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, JPG, PNG allowed.'));
  }
});

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });

    const file = req.file;
    const userId = req.user.id;
    const timestamp = Date.now();
    const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${userId}/${timestamp}_${sanitizedFileName}`;

    const { data, error } = await supabase.storage
      .from('assignment-files')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (error) return res.status(500).json({ success: false, error: error.message });

    const { data: urlData } = supabase.storage.from('assignment-files').getPublicUrl(filePath);

    res.json({ 
      success: true, 
      fileUrl: urlData.publicUrl,
      fileName: file.originalname,
      filePath: filePath,
      fileSize: file.size,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAssignments = async (req, res) => {
  try {
    const { data: assignments, error: assignmentsError } = await supabase
      .from('assignments')
      .select('*')
      .eq('status', 'active')
      .order('due_date', { ascending: true });

    if (assignmentsError) throw assignmentsError;

    const { data: submissions, error: submissionsError } = await supabase
      .from('assignment_submissions')
      .select('*')
      .eq('user_id', req.user.id);

    if (submissionsError) throw submissionsError;

    const assignmentsWithStatus = assignments.map(assignment => {
      const submission = submissions?.find(s => s.assignment_id === assignment.id);
      let displayStatus = 'assigned';
      if (submission) {
        if (submission.status === 'turned_in') displayStatus = 'submitted';
        else if (submission.status === 'graded') displayStatus = 'graded';
        else if (submission.status === 'returned') displayStatus = 'returned';
        else displayStatus = submission.status;
      }
      return {
        ...assignment,
        submission_status: displayStatus,
        submission_id: submission?.id || null,
        submitted_at: submission?.submitted_at || null,
        grade: submission?.grade || null,
        submission_file_url: submission?.submission_file_url || null,
        submission_file_name: submission?.submission_file_name || null
      };
    });

    res.json({ success: true, assignments: assignmentsWithStatus });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAssignmentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select('*')
      .eq('id', id)
      .single();

    if (assignmentError) return res.status(404).json({ success: false, error: 'Assignment not found' });

    const { data: submission, error: submissionError } = await supabase
      .from('assignment_submissions')
      .select('*')
      .eq('assignment_id', id)
      .eq('user_id', req.user.id)
      .single();

    const { data: classComments } = await supabase
      .from('assignment_class_comments')
      .select(`id, comment, created_at, users:user_id (full_name, nim)`)
      .eq('assignment_id', id)
      .order('created_at', { ascending: false });

    let privateComments = [];
    if (submission) {
      const { data: comments } = await supabase
        .from('assignment_private_comments')
        .select(`id, comment, is_teacher, created_at, users:user_id (full_name)`)
        .eq('submission_id', submission.id)
        .order('created_at', { ascending: true });
      privateComments = comments || [];
    }

    res.json({ 
      success: true, 
      assignment,
      submission: submission || null,
      classComments: classComments || [],
      privateComments
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const submitAssignment = async (req, res) => {
  try {
    const { assignmentId, fileUrl, fileName, submissionText } = req.body;
    if (!assignmentId) return res.status(400).json({ success: false, error: 'Assignment ID is required' });

    const { data: existingSubmission } = await supabase
      .from('assignment_submissions')
      .select('id')
      .eq('assignment_id', assignmentId)
      .eq('user_id', req.user.id)
      .single();

    let result;
    if (existingSubmission) {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .update({
          status: 'turned_in',
          submission_file_url: fileUrl,
          submission_file_name: fileName,
          submission_text: submissionText,
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubmission.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .insert([{
          assignment_id: assignmentId,
          user_id: req.user.id,
          status: 'turned_in',
          submission_file_url: fileUrl,
          submission_file_name: fileName,
          submission_text: submissionText,
          submitted_at: new Date().toISOString()
        }])
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    res.json({ success: true, message: 'Assignment submitted successfully!', submission: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const markAsDone = async (req, res) => {
  try {
    const { assignmentId } = req.body;
    if (!assignmentId) return res.status(400).json({ success: false, error: 'Assignment ID is required' });

    const { data: existing } = await supabase
      .from('assignment_submissions')
      .select('id')
      .eq('assignment_id', assignmentId)
      .eq('user_id', req.user.id)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('assignment_submissions')
        .update({ 
          status: 'turned_in',
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('assignment_submissions')
        .insert([{
          assignment_id: assignmentId,
          user_id: req.user.id,
          status: 'turned_in',
          submitted_at: new Date().toISOString()
        }]);
      if (error) throw error;
    }

    res.json({ success: true, message: 'Assignment marked as done!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addClassComment = async (req, res) => {
  try {
    const { assignmentId, comment } = req.body;
    if (!assignmentId || !comment) return res.status(400).json({ success: false, error: 'Assignment ID and comment are required' });
    if (comment.trim().length === 0) return res.status(400).json({ success: false, error: 'Comment cannot be empty' });

    const { data, error } = await supabase
      .from('assignment_class_comments')
      .insert([{ assignment_id: assignmentId, user_id: req.user.id, comment: comment.trim() }])
      .select(`id, comment, created_at, users:user_id (full_name, nim)`)
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Comment added successfully!', comment: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addPrivateComment = async (req, res) => {
  try {
    const { submissionId, comment } = req.body;
    if (!submissionId || !comment) return res.status(400).json({ success: false, error: 'Submission ID and comment are required' });
    if (comment.trim().length === 0) return res.status(400).json({ success: false, error: 'Comment cannot be empty' });

    const { data, error } = await supabase
      .from('assignment_private_comments')
      .insert([{ submission_id: submissionId, user_id: req.user.id, comment: comment.trim(), is_teacher: false }])
      .select(`id, comment, is_teacher, created_at, users:user_id (full_name)`)
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Private comment added successfully!', comment: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getUploadUrl = async (req, res) => {
  try {
    const { fileName } = req.body;
    if (!fileName) return res.status(400).json({ success: false, error: 'File name is required' });

    const userId = req.user.id;
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${userId}/${timestamp}_${sanitizedFileName}`;

    res.json({ success: true, filePath, bucketName: 'assignment-files', userId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
