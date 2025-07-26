const express = require('express');
const router = express.Router();
const List = require('../models/List');

// Get lists by boardId
router.get('/:boardId', async (req, res) => {
  const lists = await List.find({ boardId: req.params.boardId });
  res.json(lists);
});

router.post('/', async (req, res) => {
  try {
    const newList = new List({
      title: req.body.title,
      boardId: req.body.boardId
    });
    const savedList = await newList.save();
    res.status(201).json(savedList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
