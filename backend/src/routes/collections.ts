import express, { Response } from 'express';
import { Collection, Content } from '../models';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const collections = await Collection.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({ collections });
  } catch (error) {
    console.error('Get collections error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { name } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Collection name is required' });
    }

    const normalizedName = name.trim();
    if (normalizedName.length > 50) {
      return res.status(400).json({ message: 'Collection name must be 50 characters or less' });
    }

    const collection = new Collection({
      name: normalizedName,
      userId
    });

    await collection.save();
    return res.status(201).json({ message: 'Collection created', collection });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'Collection with this name already exists' });
    }
    console.error('Create collection error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:collectionId', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { collectionId } = req.params;
    const { name } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Collection name is required' });
    }

    const normalizedName = name.trim();
    if (normalizedName.length > 50) {
      return res.status(400).json({ message: 'Collection name must be 50 characters or less' });
    }

    const collection = await Collection.findOneAndUpdate(
      { _id: collectionId, userId },
      { name: normalizedName },
      { new: true }
    );

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    return res.status(200).json({ message: 'Collection updated', collection });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'Collection with this name already exists' });
    }
    console.error('Update collection error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:collectionId', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { collectionId } = req.params;

    const deletedCollection = await Collection.findOneAndDelete({ _id: collectionId, userId });

    if (!deletedCollection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    // Keep content safe by unassigning collection instead of deleting content.
    await Content.updateMany(
      { userId, collectionId: deletedCollection._id },
      { $unset: { collectionId: '' } }
    );

    return res.status(200).json({ message: 'Collection deleted' });
  } catch (error) {
    console.error('Delete collection error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
