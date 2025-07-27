import React, { useState } from "react";
import axios from "axios";

export default function ListColumn({
  list,
  cards,
  onCardClick,
  onTitleUpdate,
  refreshCardsForList, // optional: to fetch cards again after adding
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(list.title);
  const [newCardTitle, setNewCardTitle] = useState("");

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
      // 1. Create the card
      const res = await axios.post("/api/cards", {
        title: newCardTitle.trim(),
        listId: list._id,
      });
      const newCard = res.data;

      await axios.post("/api/cardinfos", {
        cardId: newCard._id,
        desc: "No description",
      });

      if (refreshCardsForList) {
        refreshCardsForList(list._id);
      } else {
        cards.push(newCard);
      }

      setNewCardTitle("");
    } catch (err) {
      console.error("Error adding card:", err);
    }
  };

  return (
    <div
      style={{
        background: "#f4f5f7",
        borderRadius: "5px",
        width: "250px",
        padding: "10px",
        flex: "0 0 auto",
        display: "flex",
        flexDirection: "column",
        maxHeight: "300px",
      }}
    >
      {isEditing ? (
        <input
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onKeyDown={handleTitleSubmit}
          onBlur={() => setIsEditing(false)}
          autoFocus
          style={{ marginBottom: "10px", padding: "4px", width: "100%" }}
        />
      ) : (
        <h3
          onClick={() => setIsEditing(true)}
          style={{ cursor: "pointer", marginBottom: "10px" }}
        >
          {list.title}
        </h3>
      )}

      <div
        className="scrollable-list"
        style={{
          flexGrow: 1,
          overflowY: "auto",
          marginBottom: "10px",
        }}
      >
        {cards ? (
          cards.map((card) => (
            <div
              key={card._id}
              onClick={() => onCardClick(card)}
              style={{
                background: "white",
                borderRadius: "3px",
                padding: "8px",
                marginBottom: "8px",
                boxShadow: "0 1px 0 rgba(9,30,66,.25)",
                cursor: "pointer",
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
        value={newCardTitle}
        onChange={(e) => setNewCardTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleAddCard();
          }
        }}
        style={{
          width: "100%",
          padding: "5px",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}
