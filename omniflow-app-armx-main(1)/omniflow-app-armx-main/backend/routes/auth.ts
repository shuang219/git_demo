import { Router, Request, Response, NextFunction } from 'express';
import { UserRepository } from '../repositories/users';
import { signupUserSchema } from '../db/schema';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG, AUTH_ERRORS } from '../config/constants';
import { AppError } from '../middleware/errorHandler';
import { authenticateLocal, authenticateJWT } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router = Router();
const userRepo = new UserRepository();

// Signup route
const signupHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = signupUserSchema.parse(req.body);

    const existingUser = await userRepo.findByEmail(validatedData.email);
    if (existingUser) {
      throw new AppError(AUTH_ERRORS.EMAIL_ALREADY_EXISTS, 400);
    }

    const user = await userRepo.create({
      email: validatedData.email,
      password: validatedData.password,
      name: validatedData.name,
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      data: {
        message: 'Signup successful',
        token,
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login route
const loginHandler = (req: Request, res: Response) => {
  const user = (req as AuthRequest).user!;
  const token = generateToken(user);

  res.json({
    success: true,
    data: {
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
    },
  });
};

// Get current user
const getCurrentUser = (req: Request, res: Response) => {
  const user = (req as AuthRequest).user!;
  res.json({
    success: true,
    data: {
      user: sanitizeUser(user),
    },
  });
};

// Helper functions
const generateToken = (user: any) => {
  const jwtSecret = JWT_CONFIG.SECRET || JWT_CONFIG.FALLBACK_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is required for authentication');
  }
  return jwt.sign({ userId: user.id, email: user.email }, jwtSecret, {
    expiresIn: JWT_CONFIG.EXPIRES_IN,
  });
};

const sanitizeUser = (user: any) => ({
  id: user.id,
  email: user.email,
  name: user.name,
});

// Update profile route
const updateProfileHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = (req as AuthRequest).user!;
    const { name, email, currentPassword, newPassword } = req.body as {
      name?: string;
      email?: string;
      currentPassword?: string;
      newPassword?: string;
    };

    // If changing password, verify current password first
    if (currentPassword && newPassword) {
      const dbUser = await userRepo.findByEmail(user.email);
      if (!dbUser) throw new AppError('用户不存在', 404);
      const valid = await userRepo.verifyPassword(currentPassword, dbUser.password);
      if (!valid) throw new AppError('当前密码错误', 400);
      await userRepo.updateById(user.id, { password: newPassword });
      return res.json({ success: true, data: { message: '密码已更新' } });
    }

    // Update profile fields
    const updates: { name?: string; email?: string } = {};
    if (name && name.trim()) updates.name = name.trim();
    if (email && /\S+@\S+\.\S+/.test(email)) updates.email = email;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: '没有可更新的字段' });
    }

    const updatedUser = await userRepo.updateById(user.id, updates);
    return res.json({
      success: true,
      data: { message: '资料已更新', user: sanitizeUser(updatedUser) },
    });
  } catch (error) {
    next(error);
  }
};

// Routes
router.post('/signup', signupHandler);
router.post('/login', authenticateLocal, loginHandler);
router.get('/me', authenticateJWT, getCurrentUser);
router.put('/profile', authenticateJWT, updateProfileHandler);

export default router;
