import { useState } from 'react';

const ArrayView = ({ data, currentState, target, onElementClick }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="array-view-new empty">
        <div className="empty-message-new">No data to display</div>
      </div>
    );
  }

  const getElementClass = (index) => {
    const classes = ['array-card'];
    
    // Priority order for states
    if (currentState?.foundIndex === index) {
      classes.push('found');
    } else if (currentState?.activeIndices?.includes(index)) {
      classes.push('active');
    } else if (currentState?.comparingIndices?.includes(index)) {
      classes.push('comparing');
    } else if (currentState?.swappedIndices?.includes(index)) {
      classes.push('swapped');
    } else if (currentState?.sortedIndices?.includes(index)) {
      classes.push('sorted');
    }
    
    // Eliminated range (for binary search)
    if (currentState?.eliminatedIndices?.includes(index)) {
      classes.push('eliminated');
    }
    
    if (hoveredIndex === index) {
      classes.push('hovered');
    }

    return classes.join(' ');
  };

  // Get pointer positions for binary search
  const leftPointer = currentState?.left;
  const rightPointer = currentState?.right;
  const midPointer = currentState?.mid;

  return (
    <div className="array-view-new">
      <div className="array-container-new">
        {data.map((element, index) => {
          const isInEliminatedRange = currentState?.eliminatedRange && 
            (index < currentState.eliminatedRange[0] || index > currentState.eliminatedRange[1]);
          
          return (
            <div
              key={index}
              className="array-element-wrapper"
            >
              {/* Left Pointer */}
              {leftPointer === index && (
                <div className="pointer left-pointer">
                  <div className="pointer-arrow">L</div>
                  <div className="pointer-line"></div>
                </div>
              )}
              
              {/* Mid Pointer */}
              {midPointer === index && (
                <div className="pointer mid-pointer">
                  <div className="pointer-arrow">M</div>
                  <div className="pointer-line"></div>
                </div>
              )}
              
              {/* Right Pointer */}
              {rightPointer === index && (
                <div className="pointer right-pointer">
                  <div className="pointer-arrow">R</div>
                  <div className="pointer-line"></div>
                </div>
              )}

              {/* Array Card */}
              <div
                className={getElementClass(index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onElementClick(index)}
                title={`Index ${index}: ${element.value}`}
              >
                <div className="card-value">{element.value}</div>
              </div>
              
              {/* Index Label */}
              <div className="card-index">{index}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ArrayView;
