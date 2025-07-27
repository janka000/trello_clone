import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Draggable } from "react-beautiful-dnd";
import ContextMenu from "./ContextMenu";

export default function ListColumn({
  list,
  cards = [],
  onCardClick,
  onTitleUpdate,
  refreshCardsForList,
  onCardAdded,
  onListDeleted,
  onCardDeleted,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(list.title);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [enableScroll, setEnableScroll] = useState(false);

  const titleRef = useRef(null);
  const cardsContainerRef = useRef(null);
  const [showListMenu, setShowListMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const [showCardMenu, setShowCardMenu] = useState(false);
  const [cardMenuPosition, setCardMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedCardId, setSelectedCardId] = useState(null);

  useEffect(() => {
    if (cardsContainerRef.current) {
      const height = cardsContainerRef.current.scrollHeight;
      setEnableScroll(height > 200);
    }
  }, [cards]);

  useEffect(() => {
  const handleClickOutside = (e) => {
    // Close list menu if click is outside titleRef
    if (titleRef.current && !titleRef.current.contains(e.target)) {
      setShowListMenu(false);
    }

    // Always close card menu (it appears anywhere, so general click outside should close it)
    setShowCardMenu(false);
  };

  document.addEventListener("click", handleClickOutside);
  return () => document.removeEventListener("click", handleClickOutside);
}, []);

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

  const handleDeleteList = async () => {
  try {
    await axios.delete(`/api/lists/${list._id}`);
    if (onListDeleted) {
      onListDeleted(list._id); // notify parent to remove list from UI
    }
    setShowListMenu(false);
  } catch (error) {
    console.error("Failed to delete list:", error);
  }
};

 const handleDeleteCard = async () => {
  try {
    await axios.delete(`/api/cards/${selectedCardId}`);
    if (onCardDeleted) {
      onCardDeleted(list._id, selectedCardId); // notify parent
    }
    setShowCardMenu(false);
  } catch (error) {
    console.error("Failed to delete card:", error);
  }
};

  return (
    <div
      className="bg-light rounded p-3 d-flex flex-column"
      style={{ width: "250px", flex: "0 0 auto", position: "relative" }}
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
          ref={titleRef}
          onClick={() => setIsEditing(true)}
          onContextMenu={(e) => {
            e.preventDefault();
            setMenuPosition({ x: e.clientX, y: e.clientY });
            setShowListMenu(true);
          }}
          className="mb-3"
          style={{ cursor: "pointer" }}
          title="Right-click for options"
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
                    onContextMenu={(e) => {
                        e.preventDefault();
                        setSelectedCardId(card._id);
                        setCardMenuPosition({ x: e.clientX, y: e.clientY });
                        setShowCardMenu(true);
                    }}
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
        onKeyDown={(e) => e.key === "Enter" && handleAddCard()}
        className="form-control"
      />

      {/* Right-click menu for list title only */}
      {showListMenu && (
        <ContextMenu
            position={menuPosition}
            onClose={() => setShowListMenu(false)}
            options={[
            {
                label: "Delete List",
                onClick: handleDeleteList,
            },
            ]}
        />
        )}
        {/* Right-click menu for cards */}
            {showCardMenu && (
        <ContextMenu
            position={cardMenuPosition}
            onClose={() => setShowCardMenu(false)}
            options={[
            {
                label: "Delete Card",
                onClick: handleDeleteCard,
            },
            ]}
        />
        )}

    </div>
  );
}
