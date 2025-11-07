import { supabase } from '../config/supabase.js';
import bcrypt from 'bcryptjs';

export const register = async (req, res) => {
  try {
    const { fullName, nim, password } = req.body;

    if (!fullName || !nim || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Semua field harus diisi' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password minimal 6 karakter' 
      });
    }

    console.log('📝 Registering user:', nim);

    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('nim')
      .eq('nim', nim)
      .maybeSingle();

    if (checkError) {
      console.error('❌ Check user error:', checkError);
      return res.status(500).json({ 
        success: false, 
        error: 'Database error' 
      });
    }

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'NIM sudah terdaftar' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        full_name: fullName,
        nim: nim,
        password: hashedPassword,
        level: 1,
        xp: 0,
        streak: 0
      })
      .select('id, full_name, nim, level, xp, streak')
      .single();

    if (insertError) {
      console.error('❌ Insert error:', insertError);
      return res.status(500).json({ 
        success: false, 
        error: 'Gagal membuat akun' 
      });
    }

    console.log('✅ User registered:', newUser.nim);

    const token = Buffer.from(JSON.stringify({ 
      id: newUser.id, 
      nim: newUser.nim 
    })).toString('base64');

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil!',
      user: newUser,
      token: token
    });

  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Terjadi kesalahan server' 
    });
  }
};

export const login = async (req, res) => {
  try {
    const { nim, password } = req.body;

    if (!nim || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'NIM dan password harus diisi' 
      });
    }

    console.log('🔐 Login attempt:', nim);

    const { data: user, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('nim', nim)
      .maybeSingle();

    if (findError) {
      console.error('❌ Find user error:', findError);
      return res.status(500).json({ 
        success: false, 
        error: 'Database error' 
      });
    }

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'NIM atau password salah' 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        error: 'NIM atau password salah' 
      });
    }

    console.log('✅ Login successful:', user.nim);

    const token = Buffer.from(JSON.stringify({ 
      id: user.id, 
      nim: user.nim 
    })).toString('base64');

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login berhasil',
      user: userWithoutPassword,
      token: token
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Terjadi kesalahan server' 
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, full_name, nim, level, xp, streak')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch profile' 
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Logout failed' 
    });
  }
};
