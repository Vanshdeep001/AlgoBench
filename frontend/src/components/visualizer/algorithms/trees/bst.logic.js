export const bst = async function* (inputArray, target, delay) {
    // Input: Array of numbers to insert
    // If undefined/empty, use default
    const values = inputArray && inputArray.length > 0 ? inputArray : [50, 30, 70, 20, 40, 60, 80];

    let root = null;
    const nodes = [];     // Flat list for checking
    let comparisons = 0;

    // Layout constants
    const startX = 400;
    const startY = 40;
    const levelHeight = 60;
    const initialOffset = 200;

    // Helper to create a visual node
    const createNode = (val, x, y) => ({
        id: `node-${val}`,
        value: val,
        x,
        y,
        left: null,
        right: null
    });

    // Helper to deep copy tree for visualization state
    // We need to return a structure that TreeView can render
    const getTreeStructure = (node) => {
        if (!node) return null;
        return {
            ...node,
            left: getTreeStructure(node.left),
            right: getTreeStructure(node.right)
        };
    };

    yield {
        type: 'init',
        explanation: `🔄 Starting Binary Search Tree (BST) Construction. Will insert: [${values.join(', ')}].`,
        root: null,
        comparisons,
        line: 1
    };
    await delay();

    for (let i = 0; i < values.length; i++) {
        const val = values[i];

        yield {
            type: 'start-insert',
            explanation: `Inserting value ${val}. Starting from root.`,
            newNode: `node-${val}`, // Highlight the concept of new node
            root: getTreeStructure(root),
            comparisons,
            line: 2
        };
        await delay();

        if (!root) {
            root = createNode(val, startX, startY);
            yield {
                type: 'insert-root',
                explanation: `Tree is empty. ${val} becomes the root.`,
                root: getTreeStructure(root),
                activeNodes: [root.id],
                newNode: root.id,
                comparisons,
                line: 3
            };
            await delay();
            continue;
        }

        let current = root;
        let offset = initialOffset; // Start offset
        let activePath = [root.id];
        let inserted = false;

        while (true) {
            comparisons++;
            yield {
                type: 'compare',
                explanation: `Comparing ${val} with ${current.value}.`,
                root: getTreeStructure(root),
                activeNodes: [current.id],
                pathNodes: [...activePath],
                comparisons,
                currentNode: current.id,
                line: 5
            };
            await delay();

            if (val < current.value) {
                yield {
                    type: 'go-left',
                    explanation: `${val} < ${current.value}, going Left.`,
                    root: getTreeStructure(root),
                    activeNodes: [current.id],
                    pathNodes: [...activePath],
                    comparisons,
                    line: 6
                };
                await delay();

                if (!current.left) {
                    // Calculate position
                    const x = current.x - offset;
                    const y = current.y + levelHeight;
                    current.left = createNode(val, x, y);

                    yield {
                        type: 'insert',
                        explanation: `Found empty spot! Inserting ${val} to the left of ${current.value}.`,
                        root: getTreeStructure(root),
                        activeNodes: [current.left.id],
                        newNode: current.left.id,
                        comparisons,
                        line: 7
                    };
                    await delay();
                    break;
                }
                current = current.left;
            } else {
                yield {
                    type: 'go-right',
                    explanation: `${val} >= ${current.value}, going Right.`,
                    root: getTreeStructure(root),
                    activeNodes: [current.id],
                    pathNodes: [...activePath],
                    comparisons,
                    line: 8
                };
                await delay();

                if (!current.right) {
                    const x = current.x + offset;
                    const y = current.y + levelHeight;
                    current.right = createNode(val, x, y);

                    yield {
                        type: 'insert',
                        explanation: `Found empty spot! Inserting ${val} to the right of ${current.value}.`,
                        root: getTreeStructure(root),
                        activeNodes: [current.right.id],
                        newNode: current.right.id,
                        comparisons,
                        line: 9
                    };
                    await delay();
                    break;
                }
                current = current.right;
            }
            activePath.push(current.id);
            offset = offset / 1.8; // Reduce offset for deeper levels to fit
        }
    }

    yield {
        type: 'complete',
        explanation: `✅ BST Construction Complete! All values inserted.`,
        root: getTreeStructure(root),
        comparisons,
        isComplete: true,
        line: 15
    };
};
