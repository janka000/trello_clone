import React from "react";
import Board from "./components/Board";

function App() {
  const boardId = "688521c94514c3ef6c89b03d";

  return (
    <div>
      <Board boardId={boardId} />
    </div>
  );
}

export default App;
