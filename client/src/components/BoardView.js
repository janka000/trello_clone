import React, { useEffect, useState } from "react";
import axios from "axios";
import ListColumn from "./ListColumn";
import AddListColumn from "./AddListColumn";

export default function BoardView({ boardId }) {
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [cards, setCards] = useState({});
  const [newListTitle, setNewListTitle] = useState("");
  const [newCardTitles, setNewCardTitles] = useState({});
  const [newCardDescriptions, setNewCardDescriptions] = useState({});

  const [selectedCard, setSelectedCard] = useState(null);
  const [cardDescription, setCardDescription] = useState("");

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");

  const [editingListId, setEditingListId] = useState(null);
  const [editedListTitle, setEditedListTitle] = useState("");



  useEffect(() => {
    axios.get(`/api/boards/${boardId}`).then((res) => {
      setBoard(res.data);
      setEditedTitle(res.data.title); // Initialize editable title
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

  const handleAddCard = async (listId) => {
    const title = newCardTitles[listId];
    const description = newCardDescriptions[listId];

    if (!title || !title.trim()) return;

    try {
      // 1. Create the card
      const res = await axios.post("/api/cards", { title, listId });
      const newCard = res.data;

      // 2. Create the description linked to card ID
      await axios.post("/api/cardinfos", {
        cardId: newCard._id,
        desc: description && description.trim() ? description.trim() : "No description",
      });

      // 3. Update state
      setCards((prev) => ({
        ...prev,
        [listId]: [...(prev[listId] || []), newCard],
      }));

      setNewCardTitles((prev) => ({ ...prev, [listId]: "" }));
      setNewCardDescriptions((prev) => ({ ...prev, [listId]: "" }));
    } catch (err) {
      console.error("Error adding card:", err);
    }
  };

  const handleCardClick = async (card) => {
    setSelectedCard(card);
    try {
      const res = await axios.get(`/api/cardinfos/${card._id}`);
      if (res.data && res.data.desc) {
        setCardDescription(res.data.desc);
      } else {
        setCardDescription("No description available.");
      }
    } catch (err) {
      setCardDescription("Failed to load description.");
      console.error(err);
    }
  };

  const closeDescription = () => {
    setSelectedCard(null);
    setCardDescription("");
  };

   // Update board title on Enter
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
              newCardTitle={newCardTitles[list._id] || ""}
              newCardDescription={newCardDescriptions[list._id] || ""}
              onCardTitleChange={(val) =>
                setNewCardTitles((prev) => ({ ...prev, [list._id]: val }))
              }
              onCardDescriptionChange={(val) =>
                setNewCardDescriptions((prev) => ({ ...prev, [list._id]: val }))
              }
              onAddCard={() => handleAddCard(list._id)}
              onCardClick={handleCardClick}
              onTitleUpdate={handleListTitleUpdate}
            />
          ))}

          <AddListColumn
            newListTitle={newListTitle}
            onChange={setNewListTitle}
            onAddList={handleAddList}
          />
        </div>
      </div>

      {/* Card Description Modal */}
      {selectedCard && (
        <div
          onClick={closeDescription}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              maxWidth: "400px",
              width: "90%",
              boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
            }}
          >
            <h2>{selectedCard.title}</h2>
            <p>{cardDescription}</p>
            <button onClick={closeDescription}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
