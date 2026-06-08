import { Request, Response } from 'express';

// @desc    Upload files to Cloudinary
// @route   POST /api/upload
// @access  Private/Admin
export const uploadFiles = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({ message: 'No files uploaded' });
      return;
    }

    const urls = files.map((file) => ({
      url: file.path,
      originalName: file.originalname,
    }));

    res.status(200).json({
      message: `${urls.length} file(s) uploaded successfully`,
      urls,
    });

  } catch (error: any) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: error.message });
  }
};