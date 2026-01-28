import { X } from 'lucide-react';

const CodePanel = ({ selectedAlgorithm, highlightedLine, onClose }) => {
  if (!selectedAlgorithm) {
    return null;
  }

  const codeLines = selectedAlgorithm.code.split('\n');

  return (
    <div className="code-panel-new">
      <div className="code-panel-header-new">
        <span className="code-panel-title-new">{selectedAlgorithm.name} - Code</span>
        <button className="code-close-btn" onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <div className="code-content-new">
        <div className="code-lines-new">
          {codeLines.map((line, index) => (
            <div
              key={index}
              className={`code-line-new ${highlightedLine === index + 1 ? 'highlighted' : ''}`}
            >
              <span className="line-number-new">{index + 1}</span>
              <span className="line-content-new">{line || '\u00A0'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CodePanel;
