Do not add this back after i removed it. It looks messy:

{/* Elevator header - sticky at top of shaft - compact with fixed height */}
      <div className="bg-light-gray border-b-3 border-black text-black text-center sticky top-24 z-10" style={{ height: '70px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '8px 12px' }}>
        <div className="text-xs uppercase tracking-wider font-medium">Lift</div>
        <div className="text-lg">⬍⬍⬍</div>
        {selectedFloor && (
          <div className="text-xs font-bold mt-1 text-black">
            Floor {String(selectedFloor).padStart(2, '0')}
          </div>
        )}
      </div>

