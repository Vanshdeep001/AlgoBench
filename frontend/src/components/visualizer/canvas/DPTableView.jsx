import { useEffect, useRef } from 'react';

const DPTableView = ({ data, currentState, onElementClick }) => {
    const tableData = currentState?.table || data?.table || [];
    const headers = currentState?.headers || data?.headers || [];
    const rowLabels = currentState?.rowLabels || data?.rowLabels || [];

    if (!tableData || tableData.length === 0) {
        return (
            <div className="dp-view-container empty">
                <div className="dp-placeholder-icon">💡</div>
                <div>Select a DP algorithm to visualize table construction.</div>
            </div>
        );
    }

    const is2D = Array.isArray(tableData[0]);

    const getCellClass = (r, c) => {
        let classes = ['dp-cell'];
        const cellId = is2D ? `${r}-${c}` : `${r}`;

        if (currentState?.activeCells?.includes(cellId)) classes.push('active');
        if (currentState?.compareCells?.includes(cellId)) classes.push('compare');
        if (currentState?.targetCell === cellId) classes.push('target');
        if (currentState?.finalPath?.includes(cellId)) classes.push('path');

        return classes.join(' ');
    };

    return (
        <div className="dp-view-container">
            <div className="dp-table-wrapper">
                <table className="dp-table">
                    {headers.length > 0 && (
                        <thead>
                            <tr>
                                {rowLabels.length > 0 && <th className="dp-corner-cell"></th>}
                                {headers.map((h, i) => (
                                    <th key={i} className="dp-header-cell">{h}</th>
                                ))}
                            </tr>
                        </thead>
                    )}

                    <tbody>
                        {is2D ? (
                            tableData.map((row, r) => (
                                <tr key={r}>
                                    {rowLabels.length > 0 && (
                                        <th className="dp-row-label">{rowLabels[r]}</th>
                                    )}
                                    {row.map((val, c) => (
                                        <td
                                            key={c}
                                            className={getCellClass(r, c)}
                                            onClick={() => onElementClick && onElementClick({ r, c, val })}
                                        >
                                            <div className="cell-value">{val !== null && val !== undefined ? val : ''}</div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                {tableData.map((val, i) => (
                                    <td
                                        key={i}
                                        className={getCellClass(i)}
                                        onClick={() => onElementClick && onElementClick({ i, val })}
                                    >
                                        <div className="cell-index">{i}</div>
                                        <div className="cell-value">{val !== null && val !== undefined ? val : ''}</div>
                                    </td>
                                ))}
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DPTableView;
