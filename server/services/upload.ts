import multer from "multer";
import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "artworks");

async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating upload directory:", error);
  }
}

ensureUploadDir();

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed."));
    }
  },
});

export class ImageUploadService {
  async processAndSaveImage(
    buffer: Buffer,
    originalName: string
  ): Promise<string> {
    const ext = path.extname(originalName);
    const filename = `${randomUUID()}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    await sharp(buffer)
      .resize(1920, 1920, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toFile(filepath);

    return `/uploads/artworks/${filename}`;
  }

  async processAndSaveThumbnail(
    buffer: Buffer,
    originalName: string
  ): Promise<string> {
    const ext = path.extname(originalName);
    const filename = `thumb_${randomUUID()}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    await sharp(buffer)
      .resize(400, 400, {
        fit: "cover",
      })
      .jpeg({ quality: 80 })
      .toFile(filepath);

    return `/uploads/artworks/${filename}`;
  }

  async deleteImage(imagePath: string): Promise<boolean> {
    try {
      const filename = path.basename(imagePath);
      const filepath = path.join(UPLOAD_DIR, filename);
      await fs.unlink(filepath);
      return true;
    } catch (error) {
      console.error("Error deleting image:", error);
      return false;
    }
  }
}

export const imageUploadService = new ImageUploadService();
