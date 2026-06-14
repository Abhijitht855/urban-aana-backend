import { Request, Response } from 'express';
import Banner from '../models/Banner';

// ─── GET ALL BANNERS (Public) ──────────────────────────────────────────
export const getBanners = async (req: Request, res: Response) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ priority: 1 });
    res.json(banners);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── ADD NEW BANNER (Admin) ─────────────────────────────────────────────
export const createBanner = async (req: Request, res: Response) => {
  try {
    const { imageUrl, link, priority } = req.body;
    const banner = await Banner.create({ imageUrl, link, priority });
    res.status(201).json(banner);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── UPDATE BANNER (Admin) ─────────────────────────────────────────────
export const updateBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndUpdate(id, req.body, { new: true });
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    res.json(banner);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── DELETE BANNER (Admin) ─────────────────────────────────────────────
export const deleteBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    res.json({ message: 'Banner removed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};