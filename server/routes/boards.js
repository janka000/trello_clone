const express = require('express');
const router = express.Router();
const Board = require('../models/Board');

// GET all boards
router.get('/', async (req, res) => {
  const boards = await Board.find();
  res.json(boards);
});

// POST a board
router.post('/', async (req, res) => {
  const newBoard = new Board({ title: req.body.title });
  const savedBoard = await newBoard.save();
  res.status(201).json(savedBoard);
});

// Get a board by ID
router.get('/:id', async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    res.json(board);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
