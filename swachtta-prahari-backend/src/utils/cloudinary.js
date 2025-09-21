// utils/cloudinary.js
const cloudinary = require("cloudinary").v2;

const uploadLargeVideo = (filePath, options = {}) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_large(
      filePath,
      {
        resource_type: "video",
        chunk_size: 10_000_000,
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
  });
};

module.exports = { uploadLargeVideo };
