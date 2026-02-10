import express, { Response } from 'express';
import { Link, Content, User } from '../models';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import crypto from 'crypto';

const router = express.Router();
const PUBLIC_API_BASE_URL = (process.env.PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1').replace(/\/$/, '');

// Create/Update shareable link (requires auth)
router.post('/share', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { share } = req.body;
    const userId = req.userId;

    if (share === true) {
      // Check if link already exists
      let existingLink = await Link.findOne({ userId });

      if (existingLink) {
        return res.status(200).json({
          link: `${PUBLIC_API_BASE_URL}/brain/${existingLink.hash}`
        });
      }

      // Generate unique hash
      const hash = crypto.randomBytes(10).toString('hex');

      // Create new link
      const newLink = new Link({
        hash,
        userId
      });

      await newLink.save();

      return res.status(200).json({
        link: `${PUBLIC_API_BASE_URL}/brain/${hash}`
      });

    } else {
      // Delete existing link (disable sharing)
      await Link.findOneAndDelete({ userId });

      return res.status(200).json({
        message: 'Sharing disabled'
      });
    }

  } catch (error) {
    console.error('Share brain error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get shared brain content (public - no auth required)
router.get('/:shareLink', async (req: express.Request, res: Response) => {
  try {
    const { shareLink } = req.params;

    // Find link
    const link = await Link.findOne({ hash: shareLink });

    if (!link) {
      return res.status(404).json({ message: 'Invalid or disabled share link' });
    }

    // Find user
    const user = await User.findById(link.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's content
    const content = await Content.find({ userId: link.userId })
      .populate('tags', 'title')
      .populate('collectionId', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      username: user.username,
      content
    });

  } catch (error) {
    console.error('Get shared brain error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
