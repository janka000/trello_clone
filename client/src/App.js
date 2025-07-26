import React from "react";
import BoardView from "./components/BoardView";

function App() {
  const boardId = "688521c94514c3ef6c89b03d";

  return (
    <div>
      <BoardView boardId={boardId} />
    </div>
  );
}

export default App;
