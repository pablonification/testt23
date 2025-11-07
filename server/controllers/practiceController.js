import { supabase } from '../config/supabase.js';

export const getSections = async (req, res) => {
  try {
    console.log('📚 Fetching practice sections...');

    const { data: sections, error: sectionsError } = await supabase
      .from('practice_sections')
      .select('*')
      .order('order_index', { ascending: true });

    if (sectionsError) throw sectionsError;

    const { data: nodes, error: nodesError } = await supabase
      .from('practice_nodes')
      .select('*')
      .order('order_index', { ascending: true });

    if (nodesError) throw nodesError;

    const sectionsWithNodes = sections.map(section => ({
      id: section.id,
      section: `SECTION ${Math.floor(section.section_number / 10)}, UNIT ${section.unit_number}`,
      title: section.title,
      color: section.color,
      nodes: nodes
        .filter(node => node.section_id === section.id)
        .map(node => ({
          id: node.id,
          type: node.node_type,
          unlocked: node.is_unlocked_by_default,
          completed: false,
          xpReward: node.xp_reward,
          position: {
            top: node.position_top,
            left: node.position_left
          }
        }))
    }));

    console.log(`✅ Found ${sections.length} sections with ${nodes.length} total nodes`);

    res.json({
      success: true,
      sections: sectionsWithNodes
    });
  } catch (error) {
    console.error('❌ Get sections error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch practice sections'
    });
  }
};

export const getCompletedNodes = async (req, res) => {
  try {
    console.log('📊 Fetching completed nodes for user:', req.user.id);

    const { data, error } = await supabase
      .from('completed_nodes')
      .select('section_id, node_id')
      .eq('user_id', req.user.id);

    if (error) throw error;

    const completedNodes = data.map(node => `${node.section_id}-${node.node_id}`);

    console.log(`✅ Found ${completedNodes.length} completed nodes`);

    res.json({
      success: true,
      completedNodes
    });
  } catch (error) {
    console.error('❌ Get completed nodes error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch completed nodes'
    });
  }
};

export const getQuestions = async (req, res) => {
  try {
    const { sectionId, nodeId } = req.params;

    console.log(`📝 Fetching questions for section ${sectionId}, node ${nodeId}`);

    const { data: questions, error } = await supabase
      .from('practice_questions')
      .select('*')
      .eq('section_id', sectionId)
      .eq('node_id', nodeId)
      .order('order_index', { ascending: true });

    if (error) throw error;

    const formattedQuestions = questions.map(q => ({
      id: q.id,
      type: q.question_type,
      instruction: q.instruction,
      sentence: q.sentence,
      audioUrl: q.audio_url,
      words: q.available_words,
      correctAnswer: q.correct_answer
    }));

    console.log(`✅ Found ${formattedQuestions.length} questions`);

    res.json({
      success: true,
      questions: formattedQuestions
    });
  } catch (error) {
    console.error('❌ Get questions error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch questions'
    });
  }
};

export const completeNode = async (req, res) => {
  try {
    const { sectionId, nodeId, score = 100, timeSpent = 0 } = req.body;

    console.log(`✅ Marking node as completed: Section ${sectionId}, Node ${nodeId}`);
    console.log('👤 User:', req.user.id);
    console.log('📊 Score:', score);

    if (!sectionId || !nodeId) {
      return res.status(400).json({
        success: false,
        error: 'Section ID and Node ID are required'
      });
    }

    const { data: node, error: nodeError } = await supabase
      .from('practice_nodes')
      .select('xp_reward')
      .eq('id', nodeId)
      .single();

    if (nodeError) throw nodeError;

    const xpReward = node.xp_reward || 10;

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('xp, level, streak')
      .eq('id', req.user.id)
      .single();

    if (userError) throw userError;

    const newXp = user.xp + xpReward;
    const newLevel = Math.floor(newXp / 100) + 1;

    const { error: insertError } = await supabase
      .from('completed_nodes')
      .upsert([
        {
          user_id: req.user.id,
          section_id: parseInt(sectionId),
          node_id: parseInt(nodeId),
          xp_earned: xpReward,
          score: parseInt(score),
          time_spent_seconds: parseInt(timeSpent)
        }
      ], { onConflict: 'user_id,section_id,node_id' });

    if (insertError) throw insertError;

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        xp: newXp,
        level: newLevel,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id)
      .select('id, full_name, nim, level, xp, streak')
      .single();

    if (updateError) throw updateError;

    await supabase
      .from('user_activity_log')
      .insert([{
        user_id: req.user.id,
        activity_type: 'practice_completed',
        description: `Completed node ${nodeId} in section ${sectionId}`,
        xp_gained: xpReward
      }]);

    console.log(`🎉 Node completed! +${xpReward} XP | Level: ${newLevel}`);

    res.json({
      success: true,
      message: `Node completed! +${xpReward} XP 🎉`,
      user: updatedUser,
      rewards: {
        xpEarned: xpReward,
        levelUp: newLevel > user.level
      }
    });
  } catch (error) {
    console.error('❌ Complete node error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to complete node'
    });
  }
};
