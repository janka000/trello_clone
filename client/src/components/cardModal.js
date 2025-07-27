import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CardModal({ card, onClose, onCardUpdate }) {
  const [description, setDescription] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(card?.title || "");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editedDesc, setEditedDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!card) return;

    setEditedTitle(card.title);
    setError(null);

    const fetchDescription = async () => {
      try {
        const res = await axios.get(`/api/cardinfos/${card._id}`);
        if (res.data && res.data.desc) {
          setDescription(res.data.desc);
          setEditedDesc(res.data.desc);
        } else {
          setDescription("No description available.");
          setEditedDesc("No description available.");
        }
      } catch (err) {
        console.error(err);
        setDescription("Failed to load description.");
        setEditedDesc("Failed to load description.");
      }
    };

    fetchDescription();
  }, [card]);

  const handleTitleSubmit = async () => {
    if (!editedTitle.trim() || editedTitle === card.title) {
      setIsEditingTitle(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axios.put(`/api/cards/${card._id}`, { title: editedTitle.trim() });
      onCardUpdate(res.data);
      setIsEditingTitle(false);
    } catch (err) {
      console.error(err);
      setError("Failed to update title.");
    } finally {
      setLoading(false);
    }
  };

  const handleDescSubmit = async () => {
    if (editedDesc === description) {
      setIsEditingDesc(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.put(`/api/cardinfos/${card._id}`, { desc: editedDesc.trim() });
      setDescription(editedDesc.trim());
      setIsEditingDesc(false);
    } catch (err) {
      console.error(err);
      setError("Failed to update description.");
    } finally {
      setLoading(false);
    }
  };

  if (!card) return null;

  return (
    <div
      className="modal show d-flex justify-content-center align-items-center"
      tabIndex={-1}
      role="dialog"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        role="document"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content p-3" style={{ minWidth: "50vw" }}>
          {/* Title */}
          <div className="mb-3">
            {isEditingTitle ? (
              <input
                type="text"
                className="form-control form-control-lg"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
                disabled={loading}
                autoFocus
                aria-label="Edit card title"
              />
            ) : (
              <h2
                onClick={() => setIsEditingTitle(true)}
                style={{ cursor: "pointer" }}
                title="Click to edit"
              >
                {editedTitle}
              </h2>
            )}
          </div>

          {/* Description */}
          <div className="mb-3">
            {isEditingDesc ? (
              <textarea
                className="form-control"
                value={editedDesc}
                onChange={(e) => setEditedDesc(e.target.value)}
                onBlur={handleDescSubmit}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleDescSubmit();
                  }
                }}
                disabled={loading}
                autoFocus
                rows={5}
                aria-label="Edit card description"
                style={{ resize: "vertical" }}
              />
            ) : (
              <p
                onClick={() => setIsEditingDesc(true)}
                style={{ cursor: "pointer", whiteSpace: "pre-wrap", minHeight: "80px" }}
                title="Click to edit description"
              >
                {description}
              </p>
            )}
          </div>

          {/* Error message */}
          {error && <div className="alert alert-danger">{error}</div>}

          {/* Buttons */}
          <div className="d-flex justify-content-end">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
