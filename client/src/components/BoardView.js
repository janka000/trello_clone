import React, { useEffect, useState } from "react";
import axios from "axios";

export default function BoardView({ boardId }) {
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [cards, setCards] = useState({});

  const [newListTitle, setNewListTitle] = useState("");

    const handleAddList = async () => {
    if (!newListTitle.trim()) return;

    try {
        const res = await axios.post("/api/lists", {
        title: newListTitle,
        boardId: boardId,
        });

        // Add new list to state
        const newList = res.data;
        setLists((prev) => [...prev, newList]);

        // Optionally fetch cards for the new list
        const cardRes = await axios.get(`/api/cards/${newList._id}`);
        setCards((prev) => ({ ...prev, [newList._id]: cardRes.data }));

        setNewListTitle("");
    } catch (err) {
        console.error("Error adding list:", err);
    }
    };

  const [newCardTitles, setNewCardTitles] = useState({});
  const handleAddCard = async (listId) => {
  const title = newCardTitles[listId];
  if (!title || !title.trim()) return;

  try {
    const res = await axios.post("/api/cards", {
      title,
      listId,
    });

    const newCard = res.data;
    setCards((prev) => ({
      ...prev,
      [listId]: [...(prev[listId] || []), newCard],
    }));

    // Clear input
    setNewCardTitles((prev) => ({ ...prev, [listId]: "" }));
  } catch (err) {
    console.error("Error adding card:", err);
  }
};
  

  useEffect(() => {
    // Fetch board info
    axios.get(`/api/boards/${boardId}`).then((res) => setBoard(res.data));

    // Fetch lists for this board
    axios.get(`/api/lists/${boardId}`).then((res) => {
      setLists(res.data);

      // Fetch cards for each list
      res.data.forEach((list) => {
        axios.get(`/api/cards/${list._id}`).then((res) => {
          setCards((prev) => ({ ...prev, [list._id]: res.data }));
        });
      });
    });
  }, [boardId]);

  if (!board) return <p>Loading board...</p>;

return (
  <div style={{ padding: "20px" }}>
    <h1>{board.title}</h1>

    <div
      style={{
        display: "flex",
        gap: "20px",
        marginTop: "20px",
        overflowX: "auto",
        flexWrap: "nowrap",
        paddingBottom: "10px",
      }}
    >
      {lists.map((list) => (
        <div
          key={list._id}
          style={{
            background: "#f4f5f7",
            borderRadius: "5px",
            width: "250px",
            padding: "10px",
            flex: "0 0 auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h3>{list.title}</h3>

          <div style={{ flexGrow: 1 }}>
            {cards[list._id] ? (
              cards[list._id].map((card) => (
                <div
                  key={card._id}
                  style={{
                    background: "white",
                    borderRadius: "3px",
                    padding: "8px",
                    marginBottom: "8px",
                    boxShadow: "0 1px 0 rgba(9,30,66,.25)",
                  }}
                >
                  {card.title}
                </div>
              ))
            ) : (
              <p>Loading cards...</p>
            )}
          </div>

          <input
            type="text"
            placeholder="New card title"
            value={newCardTitles[list._id] || ""}
            onChange={(e) =>
              setNewCardTitles((prev) => ({
                ...prev,
                [list._id]: e.target.value,
              }))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddCard(list._id);
              }
            }}
            style={{
              width: "100%",
              padding: "5px",
              marginTop: "5px",
              boxSizing: "border-box",
            }}
          />
        </div>
      ))}

      {/* Add New List Column */}
      <div
        style={{
          background: "#ebecf0",
          borderRadius: "5px",
          width: "250px",
          padding: "10px",
          minHeight: "50px",
          flex: "0 0 auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3>Add a new list</h3>
        <input
          type="text"
          placeholder="List title"
          value={newListTitle}
          onChange={(e) => setNewListTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAddList();
            }
          }}
          style={{
            width: "100%",
            padding: "5px",
            marginBottom: "5px",
            boxSizing: "border-box",
          }}
        />
      </div>
    </div>
  </div>
);


}
