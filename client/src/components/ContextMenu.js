export default function ContextMenu({ position, options, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        top: position.y,
        left: position.x,
        background: "white",
        border: "1px solid #ccc",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      {options.map((option, idx) => (
        <div
          key={idx}
          onClick={() => {
            option.onClick();
            onClose();
          }}
          style={{ padding: "8px 12px", cursor: "pointer" }}
        >
          {option.label}
        </div>
      ))}
    </div>
  );
}
