import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { signToken } from '../middleware/auth.js';

const shape = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(409);
    throw new Error('An account with that email already exists');
  }
  const user = await User.create({ name, email, password, role });
  res.status(201).json({ user: shape(user), token: signToken(user) });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  res.json({ user: shape(user), token: signToken(user) });
});

// GET /api/auth/me
export const getProfile = asyncHandler(async (req, res) => {
  res.json({ user: shape(req.user) });
});
