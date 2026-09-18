const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const path = require('path');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Use memory storage to keep the file in RAM before sending to Supabase
const upload = multer({ storage: multer.memoryStorage() });

exports.uploadMiddleware = upload.single('image');

exports.handleUpload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // 1. Get the folder name from the request body
    const rawFolderName = req.body.folderName || 'uncategorized';
    
    // 2. Sanitize it: "The Evergreen!" becomes "the-evergreen"
    const safeFolderName = rawFolderName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-') // Replace special chars and spaces with hyphens
      .replace(/-+/g, '-')        // Remove duplicate hyphens
      .replace(/^-|-$/g, '');     // Trim hyphens from start or end

    // 3. Create the file name
    const fileExt = path.extname(req.file.originalname);
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;

    // 4. Combine them into a full path with a slash
    const fullPath = `${safeFolderName}/${fileName}`;

    // Upload to Supabase using the folder path
    const { data, error } = await supabase.storage
      .from('cms-images')
      .upload(fullPath, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get the public URL using that exact same full path
    const { data: publicUrlData } = supabase.storage
      .from('cms-images')
      .getPublicUrl(fullPath);

    res.json({ url: publicUrlData.publicUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};