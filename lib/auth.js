import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'campusconnect_secret_key_2024';
const ALLOWED_DOMAINS = ['ksrce.ac.in'];

export function isCollegeEmail(email) {
   if (!email) return false;
   const domain = email.split('@')[1];
   return ALLOWED_DOMAINS.includes(domain);
}

export function generateToken(user) {
   return jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'student' },
      JWT_SECRET,
      { expiresIn: '7d' }
   );
}

export function verifyToken(token) {
   try {
      return jwt.verify(token, JWT_SECRET);
   } catch {
      return null;
   }
}

export function getTokenFromRequest(request) {
   const authHeader = request.headers.get('authorization');
   if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
   }
   // Also check cookies
   const cookie = request.headers.get('cookie');
   if (cookie) {
      const match = cookie.match(/token=([^;]+)/);
      if (match) return match[1];
   }
   return null;
}

export function getUserFromRequest(request) {
   const token = getTokenFromRequest(request);
   if (!token) return null;
   return verifyToken(token);
}

export function generateOTP() {
   return Math.floor(100000 + Math.random() * 900000).toString();
}
