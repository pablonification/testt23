export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Access token required' 
      });
    }


    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      
      req.user = {
        id: decoded.id,
        nim: decoded.nim
      };

      console.log('✅ Authenticated user:', decoded.nim);
      next();
    } catch (decodeError) {
      console.error('❌ Invalid token format');
      return res.status(403).json({ 
        success: false, 
        error: 'Invalid token' 
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Authentication failed' 
    });
  }
};