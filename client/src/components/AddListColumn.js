import React from "react";

export default function AddListColumn({ newListTitle, onChange, onAddList }) {
  return (
    <div
      style={{
        background: "#ebecf0",
        borderRadius: "5px",
        width: "250px",
        padding: "10px",
        flex: "0 0 auto",
        display: "flex",
        flexDirection: "column",
        maxHeight: "300px",
      }}
    >
      <h3>Add a new list</h3>
      <input
        type="text"
        placeholder="List title"
        value={newListTitle}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onAddList();
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
