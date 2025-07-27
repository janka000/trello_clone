import React, { useEffect, useState } from "react";
import axios from "axios";
import ListColumn from "./ListColumn";
import AddListColumn from "./AddListColumn";
import CardModal from "./cardModal";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

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
      const sortedLists = res.data.sort((a, b) => a.order - b.order); // sort lists here
      setLists(sortedLists);

      sortedLists.forEach((list) => {
        axios.get(`/api/cards/${list._id}`).then((res) => {
          const sortedCards = res.data.sort((a, b) => a.order - b.order);
          setCards((prev) => ({ ...prev, [list._id]: sortedCards }));
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

  const handleListDeleted = (listId) => {
  setLists((prev) => prev.filter((list) => list._id !== listId));
  setCards((prev) => {
    const newCards = { ...prev };
    delete newCards[listId];
    return newCards;
  });
};

const handleCardDeleted = (listId, cardId) => {
  setCards((prev) => ({
    ...prev,
    [listId]: prev[listId].filter((card) => card._id !== cardId),
  }));
};


  const onDragEnd = async (result) => {
    const { source, destination, draggableId, type } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    // list Reordering
    if (type === "LIST") {
      const reorderedLists = Array.from(lists);
      const [movedList] = reorderedLists.splice(source.index, 1);
      reorderedLists.splice(destination.index, 0, movedList);

      setLists(reorderedLists);

      // Send new order to server
      const listOrder = reorderedLists.map((list) => list._id);
      try {
        await axios.put(`/api/boards/${boardId}/reorder-lists`, {
          listOrder,
        });
      } catch (err) {
        console.error("Failed to reorder lists", err);
      }

      return;
    }

    // Card Reordering (same as before)
    if (source.droppableId === destination.droppableId) {
      const listId = source.droppableId;
      const newCards = Array.from(cards[listId]);
      const [movedCard] = newCards.splice(source.index, 1);
      newCards.splice(destination.index, 0, movedCard);

      setCards((prev) => ({ ...prev, [listId]: newCards }));

      const cardOrder = newCards.map((card) => card._id);
      await axios.put(`/api/lists/${listId}/reorder`, { cardOrder });
    } else {
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

      const sourceOrder = sourceCards.map((card) => card._id);
      const destinationOrder = destCards.map((card) => card._id);

      await axios.put(`/api/cards/${movedCard._id}/move`, {
        destinationListId: destListId,
        destinationOrder,
        sourceOrder,
      });
    }
  };


  if (!board) return <p>Loading board...</p>;

return (
  <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" , padding: "10px"}}>
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
          padding: "5px 20px",
          width: "100%",
          maxWidth: "500px",
        }}
      />
    ) : (
      <h1
        onClick={() => setIsEditingTitle(true)}
        style={{ cursor: "pointer", padding: "20px" }}
      >
        {board.title}
      </h1>
    )}

    {/* Lists Container */}
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ flexGrow: 1, overflowX: "auto" }}>
        <Droppable
        droppableId="lists"
        direction="horizontal"
        type="LIST"
      >
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="scroll-container"
            style={{
              padding: "10px 20px",
              display: "flex",
              gap: "20px",
              flexWrap: "nowrap",
              height: "100%",
            }}
          >
            {lists.map((list, index) => (
              <Draggable draggableId={list._id} index={index} key={list._id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps} // ✅ Only draggableProps here
                  style={{
                    minWidth: "250px",
                    ...provided.draggableProps.style,
                  }}
                >
                  <ListColumn
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
                    onListDeleted={handleListDeleted}
                    onCardDeleted={handleCardDeleted}
                    dragHandleProps={provided.dragHandleProps} // ✅ Pass drag handle only
                  />
                </div>
              )}
            </Draggable>
            ))}
            {provided.placeholder}

            <AddListColumn
              newListTitle={newListTitle}
              onChange={setNewListTitle}
              onAddList={handleAddList}
            />
          </div>
        )}
      </Droppable>

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