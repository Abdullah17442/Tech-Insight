function TopBar({ children }) {
  return (
    <div className="top-bar">
      {children && <div className="top-bar-content">{children}</div>}
    </div>
  );
}

export default TopBar;
