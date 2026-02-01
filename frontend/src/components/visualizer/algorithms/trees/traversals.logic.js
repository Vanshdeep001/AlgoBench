export const treeTraversals = async function* (inputArray, target, delay) {
    // Use a default tree for traversals if input is empty
    // Or build one from input array first

    // Hardcoded balanced tree for demonstration if input is empty is nice, 
    // but let's build a BST from input to be consistent
    const values = inputArray && inputArray.length > 0 ? inputArray : [50, 30, 70, 20, 40, 60, 80];

    // Layout constants
    const startX = 400;
    const startY = 40;
    const levelHeight = 60;
    const initialOffset = 200;

    // Helper helper to build tree quietly (we won't yield steps for building)
    const createNode = (val, x, y) => ({ id: `node-${val}`, value: val, x, y, left: null, right: null });

    let root = null;

    // Build tree synchronously
    for (const val of values) {
        if (!root) {
            root = createNode(val, startX, startY);
            continue;
        }
        let current = root;
        let offset = initialOffset;
        while (true) {
            if (val < current.value) {
                if (!current.left) {
                    current.left = createNode(val, current.x - offset, current.y + levelHeight);
                    break;
                }
                current = current.left;
            } else {
                if (!current.right) {
                    current.right = createNode(val, current.x + offset, current.y + levelHeight);
                    break;
                }
                current = current.right;
            }
            offset = offset / 1.8;
        }
    }

    // Deep copy helper
    const getTreeStructure = (node) => {
        if (!node) return null;
        return {
            ...node,
            left: getTreeStructure(node.left),
            right: getTreeStructure(node.right)
        };
    };

    const traverseInorder = async function* (node) {
        if (!node) return;
        yield* traverseInorder(node.left);
        yield {
            type: 'visit',
            explanation: `Inorder (Left, Root, Right): Visiting ${node.value}`,
            root: getTreeStructure(root),
            currentNode: node.id,
            visitedNodes: [...visited],
            comparisons: comparisons++,
            line: 2
        };
        visited.push(node.id);
        await delay();
        yield* traverseInorder(node.right);
    };

    const traversePreorder = async function* (node) {
        if (!node) return;
        yield {
            type: 'visit',
            explanation: `Preorder (Root, Left, Right): Visiting ${node.value}`,
            root: getTreeStructure(root),
            currentNode: node.id,
            visitedNodes: [...visited],
            comparisons: comparisons++,
            line: 3
        };
        visited.push(node.id);
        await delay();
        yield* traversePreorder(node.left);
        yield* traversePreorder(node.right);
    };

    const traversePostorder = async function* (node) {
        if (!node) return;
        yield* traversePostorder(node.left);
        yield* traversePostorder(node.right);
        yield {
            type: 'visit',
            explanation: `Postorder (Left, Right, Root): Visiting ${node.value}`,
            root: getTreeStructure(root),
            currentNode: node.id,
            visitedNodes: [...visited],
            comparisons: comparisons++,
            line: 4
        };
        visited.push(node.id);
        await delay();
    };

    let comparisons = 0;
    let visited = [];

    yield {
        type: 'init',
        explanation: `🔄 Tree Traversal on built tree. Defaulting to Inorder.`,
        root: getTreeStructure(root), // Show initial tree
        comparisons,
        line: 1
    };
    await delay();

    // For now, we'll implement Inorder as the default 'Tree Traversal'
    // Or we could have distinct algorithms for each. 
    // Let's implement Inorder here. User can separate them later if needed.
    yield* traverseInorder(root);

    yield {
        type: 'complete',
        explanation: `✅ Inorder Traversal Complete!`,
        root: getTreeStructure(root),
        visitedNodes: [...visited],
        comparisons,
        isComplete: true,
        line: 10
    };
};

export const inorder = async function* (arr, t, d) { yield* treeTraversals(arr, t, d); }
// We can parameterize the traversal type if we want
