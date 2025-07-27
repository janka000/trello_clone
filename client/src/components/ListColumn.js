import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Draggable } from "react-beautiful-dnd";

export default function ListColumn({
  list,
  cards = [],
  onCardClick,
  onTitleUpdate,
  refreshCardsForList,
  onCardAdded,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(list.title);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [enableScroll, setEnableScroll] = useState(false);

  const cardsContainerRef = useRef(null);

  useEffect(() => {
    if (cardsContainerRef.current) {
      const height = cardsContainerRef.current.scrollHeight;
      setEnableScroll(height > 200);
    }
  }, [cards]);

  const handleTitleSubmit = (e) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      if (editedTitle.trim() && editedTitle !== list.title) {
        onTitleUpdate(list._id, editedTitle.trim());
      }
    }
  };

  const handleAddCard = async () => {
    if (!newCardTitle.trim()) return;
    try {
      const res = await axios.post("/api/cards", {
        title: newCardTitle.trim(),
        listId: list._id,
      });
      const newCard = res.data;

      await axios.post("/api/cardinfos", {
        cardId: newCard._id,
        desc: "No description",
      });

        if (onCardAdded) {
        onCardAdded(list._id, newCard);
        } else if (refreshCardsForList) {
        refreshCardsForList(list._id);
        }

      setNewCardTitle("");
    } catch (err) {
      console.error("Error adding card:", err);
    }
  };

  return (
    <div
      className="bg-light rounded p-3 d-flex flex-column"
      style={{ width: "250px", flex: "0 0 auto" }}
    >
      {isEditing ? (
        <input
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onKeyDown={handleTitleSubmit}
          onBlur={() => setIsEditing(false)}
          autoFocus
          className="form-control mb-2"
        />
      ) : (
        <h5
          onClick={() => setIsEditing(true)}
          className="mb-3"
          style={{ cursor: "pointer" }}
          title="Click to edit"
        >
          {list.title}
        </h5>
      )}

      <div
        ref={cardsContainerRef}
        className="flex-grow-1 mb-3 scroll-container"
        style={{
          maxHeight: "300px",
          overflowY: enableScroll ? "auto" : "visible",
        }}
      >
       {cards == null ? (
        <p>Loading cards...</p>
        ) : cards.length > 0 ? (
        cards.map((card, index) => (
            <Draggable key={card._id} draggableId={card._id} index={index}>
            {(provided) => (
                <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                onClick={() => onCardClick(card)}
                className="card mb-2 shadow-sm"
                style={{
                    cursor: "pointer",
                    ...provided.draggableProps.style,
                }}
                >
                <div className="card-body p-2">{card.title}</div>
                </div>
            )}
            </Draggable>
        ))
        ) : (
        <p>No cards yet</p>
        )}

      </div>

      <input
        type="text"
        placeholder="New card title"
        value={newCardTitle}
        onChange={(e) => setNewCardTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleAddCard();
          }
        }}
        className="form-control"
      />
    </div>
  );
}
