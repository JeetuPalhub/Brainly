import express, { Request, Response } from 'express';
import { Link, Content, User } from '../models';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import crypto from 'crypto';

const router = express.Router();
const PUBLIC_API_BASE_URL = (process.env.PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1').replace(/\/$/, '');
const PUBLIC_APP_BASE_URL = (process.env.PUBLIC_APP_BASE_URL || process.env.CORS_ORIGIN || 'http://localhost:3000').replace(/\/$/, '');

const buildShareApiUrl = (hash: string) => `${PUBLIC_API_BASE_URL}/brain/${hash}`;
const buildSharePageUrl = (hash: string) => `${PUBLIC_APP_BASE_URL}/share/${hash}`;

const isBrowserNavigationRequest = (req: Request) => {
  const acceptValue = req.headers.accept;
  const acceptHeader = Array.isArray(acceptValue) ? acceptValue.join(',') : (acceptValue || '');
  const acceptsHtml = acceptHeader.includes('text/html');
  return req.method === 'GET' && acceptsHtml;
};

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
          link: buildSharePageUrl(existingLink.hash),
          apiLink: buildShareApiUrl(existingLink.hash)
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
        link: buildSharePageUrl(hash),
        apiLink: buildShareApiUrl(hash)
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
    const param = req.params.shareLink;
    const shareLink = Array.isArray(param) ? param[0] : param;
    if (!shareLink) {
      return res.status(400).json({ message: 'Share link is required' });
    }
    if (isBrowserNavigationRequest(req)) {
      return res.redirect(302, buildSharePageUrl(shareLink));
    }

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
      .select('type link title aiSummary tags collectionId metadata createdAt')
      .populate('tags', 'title')
      .populate('collectionId', 'name')
      .sort({ createdAt: -1 })
      .lean();

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
