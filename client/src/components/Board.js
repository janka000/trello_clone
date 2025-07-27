import React, { useEffect, useState } from "react";
import axios from "axios";
import ListColumn from "./ListColumn";
import AddListColumn from "./AddListColumn";
import CardModal from "./cardModal";
import { DragDropContext, Droppable } from "react-beautiful-dnd";

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
        res.data.forEach((list) => {
          axios.get(`/api/cards/${list._id}`).then((res) => {
            const sortedCards = res.data.sort((a, b) => a.order - b.order);
            setCards((prev) => ({ ...prev, [list._id]: sortedCards }));
          });
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

  const onDragEnd = async (result) => {
      const { source, destination, draggableId } = result;

      if (!destination) return;

      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      )
        return;

      if (source.droppableId === destination.droppableId) {
        // Reorder within the same list
        const listId = source.droppableId;
        const newCards = Array.from(cards[listId]);
        const [movedCard] = newCards.splice(source.index, 1);
        newCards.splice(destination.index, 0, movedCard);

        setCards((prev) => ({ ...prev, [listId]: newCards }));

        // Persist reorder
        const cardOrder = newCards.map((card) => card._id);
        await axios.put(`/api/lists/${listId}/reorder`, { cardOrder });

      } else {
        // Move card between lists
        const sourceListId = source.droppableId;
        const destListId = destination.droppableId;

        const sourceCards = Array.from(cards[sourceListId]);
        const destCards = Array.from(cards[destListId]);
        const [movedCard] = sourceCards.splice(source.index, 1);

        const updatedMovedCard = { ...movedCard, listId: destListId };
        destCards.splice(destination.index, 0, updatedMovedCard);

        setCards((prev) => ({
          ...prev,
          [sourceListId]: sourceCards,
          [destListId]: destCards,
        }));

        // Prepare arrays of IDs to update orders
        const sourceOrder = sourceCards.map((card) => card._id);
        const destinationOrder = destCards.map((card) => card._id);

        // Persist move and reorder
        await axios.put(`/api/cards/${movedCard._id}/move`, {
          destinationListId: destListId,
          destinationOrder,
          sourceOrder,
        });
      }
    };




  if (!board) return <p>Loading board...</p>;

  return (
    <div style={{ padding: "20px" }}>
      {/* Board Title */}
      {isEditingTitle ? (
        <input
          autoFocus
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onKeyDown={handleBoardTitleKeyDown}
          onBlur={() => setIsEditingTitle(false)}
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

      {/* Lists Container */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div
          className="scroll-container"
          style={{
            overflowX: "auto",
            marginTop: "20px",
            padding: "10px",
            display: "flex",
            gap: "20px",
            flexWrap: "nowrap",
            minHeight: "400px",
          }}
        >
          {lists.map((list) => (
            <Droppable droppableId={list._id} key={list._id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{ minWidth: "250px" }}
                >
                  <ListColumn
                    key={list._id}
                    list={list}
                    cards={cards[list._id]}
                    onCardClick={(card) => setSelectedCard(card)}
                    onTitleUpdate={handleListTitleUpdate}
                    onCardAdded={(listId, newCard) => {
                      setCards((prev) => ({
                        ...prev,
                        [listId]: [...(prev[listId] || []), newCard],
                      }));
                    }}
                  />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}

          <AddListColumn
            newListTitle={newListTitle}
            onChange={setNewListTitle}
            onAddList={handleAddList}
          />
        </div>
      </DragDropContext>

      {/* Card Modal */}
      <CardModal
        card={selectedCard}
        onClose={() => setSelectedCard(null)}
        onCardUpdate={handleCardUpdate}
      />
    </div>
  );
}
