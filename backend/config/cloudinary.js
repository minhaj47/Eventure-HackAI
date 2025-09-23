import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config({ path: './.env' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

 const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      transformation: [{ quality: "auto:good", fetch_format: "auto" }],
    });

    console.log("✅ File uploaded to Cloudinary:", response.secure_url);
    await fs.unlink(localFilePath);

    return response.secure_url;
  } catch (error) {
    console.error("❌ Cloudinary Upload Error:", error);

    try {
      await fs.access(localFilePath);
      await fs.unlink(localFilePath);
    } catch (fsError) {
      console.error("⚠️ Local file already deleted or not found:", fsError.message);
    }

    return { error: "Cloudinary upload failed", details: error };
  }
};


export default uploadOnCloudinary;