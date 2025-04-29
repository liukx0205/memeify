const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
require('dotenv').config();
const router = express.Router();

const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) { 
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.get('/test', (req, res) => {
  res.json({ message: 'Meme route is working!' });
});

router.post('/upload', (req, res) => {
  upload.single('image')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
      message: 'Image uploaded successfully',
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`
    });
  });
});

router.post('/generate', async (req, res) => {
  const { description } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'Description is required to generate caption' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: "system", content: "You are a meme caption generator. Respond with only the caption text." },
        { role: "user", content: `Generate a funny meme caption for this description: ${description}` }
      ],
      temperature: 0.8,
      max_tokens: 50,
    });

    const caption = response.choices[0].message.content.trim();
    res.json({ caption });
  } catch (error) {
    console.error('Error generating caption:', error);
    res.status(500).json({ error: 'Failed to generate meme caption. Please try again later.' });
  }
});

router.post('/compose', upload.single('image'), async (req, res) => {
  const caption = req.body.caption;
  const imageFile = req.file;

  if (!imageFile || !caption) {
    return res.status(400).json({ error: 'Image and caption are required' });
  }

  try {
    const imagePath = path.join(uploadDir, imageFile.filename);
    const originalImage = await Jimp.read(imagePath);

    const captionHeight = 100;
    const memeWidth = originalImage.bitmap.width;
    const memeHeight = originalImage.bitmap.height + captionHeight;

    const meme = new Jimp(memeWidth, memeHeight, '#ffffff');

    meme.composite(originalImage, 0, captionHeight);

    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

    meme.print(
      font,
      10, 0,
      {
        text: caption,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
      },
      memeWidth - 20, 
      captionHeight
    );

    const composedImagePath = path.join(uploadDir, `composed-${imageFile.filename}`);
    await meme.writeAsync(composedImagePath);

    res.sendFile(composedImagePath);
  } catch (error) {
    console.error('Error composing meme:', error);
    res.status(500).json({ error: 'Failed to compose meme image' });
  }
});

module.exports = router;