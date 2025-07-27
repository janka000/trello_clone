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
      await axios.put(`/api/lists/${listId}`, { title: newTitle });
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

  const handleCardUpdate = (updatedCard) => {
    setCards((prev) => {
      const newCards = {};
      for (const listId in prev) {
        newCards[listId] = prev[listId].map((card) =>
          card._id === updatedCard._id ? updatedCard : card
        );
      }
      return newCards;
    });
  };

  if (!board) return <p>Loading board...</p>;

  return (
    <div className="container py-4">
      {/* Board Title */}
      {isEditingTitle ? (
        <input
          autoFocus
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onKeyDown={handleBoardTitleKeyDown}
          onBlur={() => setIsEditingTitle(false)}
          className="form-control form-control-lg fw-bold mb-3"
          style={{ maxWidth: "600px" }}
        />
      ) : (
        <h1
          className="mb-4"
          style={{ cursor: "pointer" }}
          onClick={() => setIsEditingTitle(true)}
          title="Click to edit"
        >
          {board.title}
        </h1>
      )}

      {/* Lists Container */}
      <div
        className="d-flex flex-row flex-nowrap overflow-auto"
        style={{ gap: "20px", minHeight: "400px" }}
      >
        {lists.map((list) => (
          <ListColumn
            key={list._id}
            list={list}
            cards={cards[list._id]}
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

      {/* Card Modal */}
      <CardModal
        card={selectedCard}
        onClose={() => setSelectedCard(null)}
        onCardUpdate={handleCardUpdate}
      />
    </div>
  );
}
