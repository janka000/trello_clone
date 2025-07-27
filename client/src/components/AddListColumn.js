import React from "react";

export default function AddListColumn({ newListTitle, onChange, onAddList }) {
  return (
    <div
      className="bg-light rounded p-3 d-flex flex-column"
      style={{ width: "250px", flex: "0 0 auto", maxHeight: "300px" }}
    >
      <h5 className="mb-3">Add a new list</h5>
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
        className="form-control"
      />
      <button
        className="btn btn-primary mt-3"
        onClick={onAddList}
        disabled={!newListTitle.trim()}
      >
        Add List
      </button>
    </div>
  );
}
