import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [boards, setBoards] = useState([]);

  useEffect(() => {
    axios.get('/api/boards')
      .then(res => setBoards(res.data))
      .catch(err => console.error('Error fetching boards:', err));
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h1>My Trello Boards</h1>
      {boards.length === 0 ? (
        <p>No boards found</p>
      ) : (
        <ul>
          {boards.map(board => (
            <li key={board._id}>{board.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
