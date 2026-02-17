import React from 'react';

const BacktrackingView = ({ data, currentState }) => {
    if (!currentState) {
        return (
            <div className="backtracking-view-container">
                <div className="empty-message-new">Select a backtracking algorithm to visualize</div>
            </div>
        );
    }

    // Handle Subset Sum visualization
    if (currentState.arr && currentState.subset !== undefined) {
        const { arr, subset, currentSum, target, state } = currentState;

        return (
            <div className="backtracking-view-container">
                <div className="subset-container">
                    {/* Target Display */}
                    <div className="subset-sum-display">
                        Target: {target} | Current Sum: {currentSum}
                    </div>

                    {/* Array Elements */}
                    <div className="subset-array">
                        {arr.map((value, index) => {
                            const isIncluded = subset.includes(value);
                            const isExcluded = state === 'backtrack';

                            return (
                                <div
                                    key={index}
                                    className={`subset-element ${isIncluded ? 'included' : ''} ${isExcluded && !isIncluded ? 'excluded' : ''}`}
                                >
                                    {value}
                                </div>
                            );
                        })}
                    </div>

                    {/* Current Subset Display */}
                    {subset.length > 0 && (
                        <div className="subset-sum-display">
                            Current Subset: [{subset.join(', ')}]
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Handle Rat in Maze visualization
    if (currentState.maze) {
        const { maze, solution, x, y } = currentState;
        const n = maze.length;

        return (
            <div className="backtracking-view-container">
                <div
                    className="maze-grid"
                    style={{
                        gridTemplateColumns: `repeat(${n}, 1fr)`,
                        width: 'fit-content',
                        maxWidth: '90%'
                    }}
                >
                    {maze.map((row, rowIndex) => (
                        row.map((cell, colIndex) => {
                            const isWall = cell === 0;
                            const isCurrent = rowIndex === x && colIndex === y;
                            const isPath = solution[rowIndex][colIndex] === 1;
                            const isStart = rowIndex === 0 && colIndex === 0;
                            const isEnd = rowIndex === n - 1 && colIndex === n - 1;

                            let classes = ['maze-cell'];
                            if (isWall) classes.push('wall');
                            else classes.push('path');

                            if (isStart) classes.push('start');
                            if (isEnd) classes.push('end');

                            if (isCurrent) classes.push('exploring');
                            else if (isPath) classes.push('solution');

                            return (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    className={classes.join(' ')}
                                    title={`(${rowIndex}, ${colIndex})`}
                                >
                                    {isCurrent && <span className="rat-icon">🐭</span>}
                                    {isEnd && !isCurrent && <span className="cheese-icon">🧀</span>}
                                </div>
                            );
                        })
                    ))}
                </div>
            </div>
        );
    }

    // Handle Sudoku visualization
    if (currentState.initialBoard) { // Sudoku has initialBoard
        const { board, initialBoard, row: currentRow, col: currentCol, type } = currentState;

        return (
            <div className="backtracking-view-container">
                <div className="sudoku-grid">
                    {board.map((row, rowIndex) => (
                        row.map((cell, colIndex) => {
                            const isFixed = initialBoard[rowIndex][colIndex] !== 0;
                            const isCurrent = rowIndex === currentRow && colIndex === currentCol;

                            let classes = ['sudoku-cell'];
                            if (isFixed) classes.push('fixed');

                            if (isCurrent) {
                                if (type === 'trying') classes.push('trying');
                                else if (type === 'placed') classes.push('placed');
                                else if (type === 'backtrack') classes.push('backtrack');
                            } else if (!isFixed && cell !== 0) {
                                classes.push('placed');
                            }

                            // Add border classes for 3x3 grids
                            if ((colIndex + 1) % 3 === 0 && colIndex !== 8) classes.push('border-right');
                            if ((rowIndex + 1) % 3 === 0 && rowIndex !== 8) classes.push('border-bottom');

                            return (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    className={classes.join(' ')}
                                >
                                    {cell !== 0 ? cell : ''}
                                </div>
                            );
                        })
                    ))}
                </div>
            </div>
        );
    }

    // Handle board-based algorithms (N-Queens)
    if (!currentState.board) {
        return (
            <div className="backtracking-view-container">
                <div className="empty-message-new">Select a backtracking algorithm to visualize</div>
            </div>
        );
    }

    const { board, n = 8, row: currentRow, col: currentCol, type } = currentState;

    const getCellClass = (row, col) => {
        const classes = ['chess-cell'];

        // Determine if light or dark square
        classes.push((row + col) % 2 === 0 ? 'light' : 'dark');

        // Add state-specific classes
        if (currentRow === row && currentCol === col) {
            if (type === 'trying') classes.push('trying');
            else if (type === 'unsafe') classes.push('unsafe');
            else if (type === 'backtrack') classes.push('backtrack');
        }

        if (board[row][col] === 1) {
            classes.push('placed');
        }

        return classes.join(' ');
    };

    return (
        <div className="backtracking-view-container">
            <div
                className="chess-board"
                style={{
                    gridTemplateColumns: `repeat(${n}, 1fr)`,
                    gridTemplateRows: `repeat(${n}, 1fr)`
                }}
            >
                {board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className={getCellClass(rowIndex, colIndex)}
                        >
                            {cell === 1 && <span className="queen-icon">♛</span>}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BacktrackingView;
