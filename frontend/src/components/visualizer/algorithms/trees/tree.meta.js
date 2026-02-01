import { bst } from './bst.logic';
import { treeTraversals } from './traversals.logic';

export const treeAlgorithms = [
    {
        id: 'bst',
        name: 'Binary Search Tree (Build)',
        category: 'trees',
        algorithm: bst,
        complexity: 'O(h)',
        description: 'Visualizes insertion logic into a BST.',
        code: `// Insert logic code...`,
        visualizationType: 'tree'
    },
    {
        id: 'inorder',
        name: 'Inorder Traversal',
        category: 'trees',
        algorithm: treeTraversals, // currently defaults to Inorder
        complexity: 'O(n)',
        description: 'Visits nodes in Left -> Root -> Right order.',
        code: `function inorder(node) {
  if (!node) return;
  inorder(node.left);
  print(node.val);
  inorder(node.right);
}`,
        visualizationType: 'tree'
    }
];
