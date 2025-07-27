import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CardModal({ card, onClose }) {
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!card) return;

    const fetchDescription = async () => {
      try {
        const res = await axios.get(`/api/cardinfos/${card._id}`);
        if (res.data && res.data.desc) {
          setDescription(res.data.desc);
        } else {
          setDescription("No description available.");
        }
      } catch (err) {
        console.error(err);
        setDescription("Failed to load description.");
      }
    };

    fetchDescription();
  }, [card]);

  if (!card) return null;

  return (
    <div
      onClick={onClose}
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
        <h2>{card.title}</h2>
        <p>{description}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
