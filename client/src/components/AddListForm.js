import React, { useState } from 'react';
import axios from 'axios';

function AddListForm({ boardId, onListAdded }) {
  const [title, setTitle] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return;

    try {
      const res = await axios.post('/api/lists', {
        title,
        boardId
      });
      onListAdded(res.data);  // pass new list back to parent
      setTitle("");           // clear input
    } catch (err) {
      console.error("Failed to add list:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Add new list..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button type="submit">Add List</button>
    </form>
  );
}

export default AddListForm;
