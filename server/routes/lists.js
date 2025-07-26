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

// GET /api/lists - get all lists
router.get('/', async (req, res) => {
  try {
    const lists = await List.find(); // fetch all lists
    res.json(lists);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT to update list title
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
    try {
        const updatedList = await List.findByIdAndUpdate(id, { title }, { new: true });
        if (!updatedList) return res.status(404).json({ message: 'List not found' });
        res.json(updatedList);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update list title' });
    }
});


module.exports = router;
