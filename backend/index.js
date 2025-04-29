require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const memeRoutes = require('./routes/memeRoutes');

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/memes', memeRoutes);

app.get('/', (req, res) => {
  res.send('Memeify backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
