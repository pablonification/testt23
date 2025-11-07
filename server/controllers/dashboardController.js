import { supabase } from '../config/supabase.js';

export const getFeaturedNews = async (req, res) => {
  try {
    console.log('📰 Fetching featured news...');
    const { data: news, error } = await supabase
      .from('featured_news')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Fetch featured news error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch featured news' 
      });
    }

    console.log(`✅ Found ${news?.length || 0} featured news items`);
    res.json({
      success: true,
      news: news || []
    });
  } catch (error) {
    console.error('❌ Get featured news error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch featured news' 
    });
  }
};

export const getMaterials = async (req, res) => {
  try {
    const { chapter, category, search } = req.query;
    console.log('📚 Fetching materials with filters:', { chapter, category, search });

    let query = supabase
      .from('learning_materials')
      .select('*')
      .eq('is_active', true)
      .order('date_published', { ascending: false });

    if (chapter) {
      query = query.eq('chapter', chapter);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data: materials, error } = await query;

    if (error) {
      console.error('❌ Fetch materials error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch materials' 
      });
    }

    console.log(`✅ Found ${materials?.length || 0} materials`);
    res.json({
      success: true,
      materials: materials || []
    });
  } catch (error) {
    console.error('❌ Get materials error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch materials' 
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('📊 Fetching dashboard stats for user:', userId);

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('level, xp, streak')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('❌ Fetch user error:', userError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch user data' 
      });
    }

    const { count: completedPractices, error: practiceError } = await supabase
      .from('completed_nodes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: completedAssignments, error: assignmentError } = await supabase
      .from('assignment_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'graded');

    console.log('✅ Dashboard stats:', {
      level: user.level,
      xp: user.xp,
      streak: user.streak,
      completedPractices,
      completedAssignments
    });

    res.json({
      success: true,
      stats: {
        level: user.level,
        xp: user.xp,
        streak: user.streak,
        completedPractices: completedPractices || 0,
        completedAssignments: completedAssignments || 0
      }
    });
  } catch (error) {
    console.error('❌ Get dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch dashboard stats' 
    });
  }
};

export const getMaterialFilters = async (req, res) => {
  try {
    console.log('🔍 Fetching material filters...');
    const { data: chapters, error: chaptersError } = await supabase
      .from('learning_materials')
      .select('chapter')
      .eq('is_active', true)
      .not('chapter', 'is', null)
      .order('chapter');

    const { data: categories, error: categoriesError } = await supabase
      .from('learning_materials')
      .select('category')
      .eq('is_active', true)
      .not('category', 'is', null)
      .order('category');

    const uniqueChapters = [...new Set((chapters || []).map(item => item.chapter).filter(Boolean))];
    const uniqueCategories = [...new Set((categories || []).map(item => item.category).filter(Boolean))];

    console.log('✅ Found filters:', { chapters: uniqueChapters.length, categories: uniqueCategories.length });

    res.json({
      success: true,
      filters: {
        chapters: uniqueChapters,
        categories: uniqueCategories
      }
    });
  } catch (error) {
    console.error('❌ Get material filters error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch material filters' 
    });
  }
};
