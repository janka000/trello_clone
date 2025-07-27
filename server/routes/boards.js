const express = require('express');
const router = express.Router();
const Board = require('../models/Board');
const List = require("../models/List");

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

// PUT to update board title
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  try {
    const updated = await Board.findByIdAndUpdate(id, { title }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update board title" });
  }
});

// PUT /api/boards/:boardId/reorder-lists
router.put("/:boardId/reorder-lists", async (req, res) => {
  const { boardId } = req.params;
  const { listOrder } = req.body;

  try {
    // Update each list's order field based on index in array
    await Promise.all(
      listOrder.map((listId, index) =>
        List.findByIdAndUpdate(listId, { order: index })
      )
    );

    res.status(200).json({ message: "List order updated" });
  } catch (err) {
    console.error("Failed to reorder lists:", err);
    res.status(500).json({ error: "Failed to reorder lists" });
  }
});


module.exports = router;
