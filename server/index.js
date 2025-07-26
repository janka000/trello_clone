const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Routes
const boardRoutes = require('./routes/boards');
app.use('/api/boards', boardRoutes);

const listRoutes = require('./routes/lists');
const cardRoutes = require('./routes/cards');
app.use('/api/lists', listRoutes);
app.use('/api/cards', cardRoutes);


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
