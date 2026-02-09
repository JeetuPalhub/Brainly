import express, { Response } from 'express';
import { Content, Tag } from '../models';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// All routes use auth middleware
router.use(authMiddleware);

// Add new content
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { type, link, title, tags } = req.body;
    const userId = req.userId;

    // Validation
    if (!type || !link || !title) {
      return res.status(411).json({ message: 'Type, link, and title are required' });
    }

    // Validate type
    const validTypes = ['document', 'tweet', 'youtube', 'link'];
    if (!validTypes.includes(type)) {
      return res.status(411).json({ message: 'Invalid content type' });
    }

    // Handle tags - create if they don't exist
    let tagIds: any[] = [];
    if (tags && Array.isArray(tags)) {
      for (const tagTitle of tags) {
        let tag = await Tag.findOne({ title: tagTitle });
        if (!tag) {
          tag = new Tag({ title: tagTitle });
          await tag.save();
        }
        tagIds.push(tag._id);
      }
    }

    // Create content
    const newContent = new Content({
      type,
      link,
      title,
      tags: tagIds,
      userId
    });

    await newContent.save();

    return res.status(200).json({
      message: 'Content added successfully',
      content: newContent
    });

  } catch (error) {
    console.error('Add content error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get all content for logged-in user
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const content = await Content.find({ userId })
      .populate('tags', 'title')
      .sort({ createdAt: -1 });

    return res.status(200).json({ content });

  } catch (error) {
    console.error('Get content error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Delete content
router.delete('/', async (req: AuthRequest, res: Response) => {
  try {
    const { contentId } = req.body;
    const userId = req.userId;

    if (!contentId) {
      return res.status(411).json({ message: 'Content ID is required' });
    }

    // Find content
    const content = await Content.findById(contentId);

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Check if user owns this content
    if (content.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You do not have permission to delete this content' });
    }

    await Content.findByIdAndDelete(contentId);

    return res.status(200).json({ message: 'Content deleted successfully' });

  } catch (error) {
    console.error('Delete content error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;