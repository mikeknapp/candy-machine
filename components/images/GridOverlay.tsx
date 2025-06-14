export const GridOverlay = () => {
  return (
    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none z-50">
      {/* Top row */}
      <div className="border-r border-b border-black border-opacity-30"></div>
      <div className="border-r border-b border-black border-opacity-30"></div>
      <div className="border-b border-black border-opacity-30"></div>
      {/* Middle row */}
      <div className="border-r border-b border-black border-opacity-30"></div>
      <div className="border-r border-b border-black border-opacity-30"></div>
      <div className="border-b border-black border-opacity-30"></div>
      {/* Bottom row */}
      <div className="border-r border-b border-black border-opacity-30"></div>
      <div className="border-r border-b border-black border-opacity-30"></div>
      <div className="border-b border-black border-opacity-30"></div> {/* No borders needed for the last cell */}
    </div>
  )
}

export default GridOverlay
