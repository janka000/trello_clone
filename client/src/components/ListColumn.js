import React, { useState } from "react";

export default function ListColumn({
  list,
  cards,
  newCardTitle,
  onCardTitleChange,
  onAddCard,
  onCardClick,
  onTitleUpdate, // <-- new prop for updating list title
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(list.title);

  const handleTitleSubmit = (e) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      if (editedTitle.trim() && editedTitle !== list.title) {
        onTitleUpdate(list._id, editedTitle.trim());
      }
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
        onChange={(e) => onCardTitleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onAddCard();
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
