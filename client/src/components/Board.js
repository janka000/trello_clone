import React, { useEffect, useState } from "react";
import axios from "axios";
import ListColumn from "./ListColumn";
import AddListColumn from "./AddListColumn";
import CardModal from "./cardModal";

export default function Board({ boardId }) {
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [cards, setCards] = useState({});
  const [newListTitle, setNewListTitle] = useState("");

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");

  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    axios.get(`/api/boards/${boardId}`).then((res) => {
      setBoard(res.data);
      setEditedTitle(res.data.title);
    });
    axios.get(`/api/lists/${boardId}`).then((res) => {
      setLists(res.data);
      res.data.forEach((list) => {
        axios.get(`/api/cards/${list._id}`).then((res) => {
          setCards((prev) => ({ ...prev, [list._id]: res.data }));
        });
      });
    });
  }, [boardId]);


  const handleListTitleUpdate = async (listId, newTitle) => {
    try {
        await axios.put(`/api/lists/${listId}`, {
        title: newTitle,
        });
        setLists((prev) =>
        prev.map((list) =>
            list._id === listId ? { ...list, title: newTitle } : list
        )
        );
    } catch (err) {
        console.error("Error updating list title:", err);
    }
    };


  const handleAddList = async () => {
    if (!newListTitle.trim()) return;
    try {
      const res = await axios.post("/api/lists", {
        title: newListTitle,
        boardId,
      });
      const newList = res.data;
      setLists((prev) => [...prev, newList]);
      const cardRes = await axios.get(`/api/cards/${newList._id}`);
      setCards((prev) => ({ ...prev, [newList._id]: cardRes.data }));
      setNewListTitle("");
    } catch (err) {
      console.error("Error adding list:", err);
    }
  };


  const handleBoardTitleKeyDown = async (e) => {
    console.log("Key pressed:", e.key);
    if (e.key === "Enter") {
      try {
        const res = await axios.put(`api/boards/${boardId}`, {
          title: editedTitle.trim(),
        });
        setBoard(res.data);
        setIsEditingTitle(false);
      } catch (err) {
        console.error("Error updating board title", err);
      }
    }
  };


  if (!board) return <p>Loading board...</p>;

  return (
    <div style={{ padding: "20px" }}>
      {/* Title area */}
      {isEditingTitle ? (
        <input
          autoFocus
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onKeyDown={handleBoardTitleKeyDown}
          onBlur={() => setIsEditingTitle(false)} // optional: exit on blur
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            padding: "5px",
            width: "100%",
            maxWidth: "500px",
          }}
        />
      ) : (
        <h1
          onClick={() => setIsEditingTitle(true)}
          style={{ cursor: "pointer" }}
        >
          {board.title}
        </h1>
      )}

      <div
        className="scroll-container"
        style={{
          overflowX: "auto",
          marginTop: "20px",
          padding: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "nowrap",
            minHeight: "400px",
          }}
        >
          {lists.map((list) => (
            <ListColumn
              key={list._id}
              list={list}
              cards={cards[list._id]}
              onCardCreated={(listId, newCard) => {
                setCards((prev) => ({
                  ...prev,
                  [listId]: [...(prev[listId] || []), newCard],
                }));
              }}
              onTitleUpdate={handleListTitleUpdate}
              onCardClick={(card) => setSelectedCard(card)}
            />
          ))}

          <AddListColumn
            newListTitle={newListTitle}
            onChange={setNewListTitle}
            onAddList={handleAddList}
          />
        </div>
      </div>

        <CardModal 
        card={selectedCard} 
        onClose={() => setSelectedCard(null)} 
        />

    </div>
  );
}
