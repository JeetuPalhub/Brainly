import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';

const router = express.Router();

// Sign Up Route
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(411).json({ message: 'Username and password are required' });
    }

    // Username validation (3-10 characters)
    if (username.length < 3 || username.length > 10) {
      return res.status(411).json({ message: 'Username must be 3-10 characters' });
    }

    // Password validation (8-20 characters, must have uppercase, lowercase, number, special char)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    if (!passwordRegex.test(password)) {
      return res.status(411).json({
        message: 'Password must be 8-20 characters and contain at least one uppercase, one lowercase, one number, and one special character'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(403).json({ message: 'User already exists with this username' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username,
      password: hashedPassword
    });

    await newUser.save();

    return res.status(200).json({ message: 'User signed up successfully' });

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Sign In Route
router.post('/signin', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(411).json({ message: 'Username and password are required' });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(403).json({ message: 'Wrong username or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(403).json({ message: 'Wrong username or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    return res.status(200).json({ token });

  } catch (error) {
    console.error('Signin error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;