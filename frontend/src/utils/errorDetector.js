/**
 * Error Detector — Identifies syntax, logic, and performance errors in code
 * Returns detailed, visualizable error information
 */

import * as acorn from 'acorn';

// Error severity levels
export const ERROR_SEVERITY = {
  CRITICAL: 'critical',  // Code won't run
  ERROR: 'error',        // Code will fail
  WARNING: 'warning',    // Code may behave unexpectedly
  INFO: 'info',          // Informational
};

// Error categories
export const ERROR_CATEGORY = {
  SYNTAX: 'syntax',
  LOGIC: 'logic',
  PERFORMANCE: 'performance',
  STYLE: 'style',
  SECURITY: 'security',
};

/**
 * Detect all errors in code
 */
export function detectErrors(code, language = 'javascript') {
  const errors = [];

  if (language === 'javascript') {
    errors.push(...detectJavaScriptErrors(code));
  } else if (language === 'java') {
    errors.push(...detectJavaErrors(code));
  } else if (language === 'cpp' || language === 'c++') {
    errors.push(...detectCppErrors(code));
  }

  return errors.sort((a, b) => {
    // Sort by severity (critical first) then by line number
    const severityOrder = { critical: 0, error: 1, warning: 2, info: 3 };
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return a.line - b.line;
  });
}

/**
 * Detect JavaScript-specific errors
 */
function detectJavaScriptErrors(code) {
  const errors = [];
  const lines = code.split('\n');

  // ─── Syntax Errors ───────────────────────────────────────────────────────
  let ast;
  try {
    ast = acorn.parse(code, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      locations: true,
      allowReturnOutsideFunction: true,
      allowAwaitOutsideFunction: true,
    });
  } catch (e) {
    // Parse error
    const line = e.loc?.line || 1;
    const column = e.loc?.column || 0;
    errors.push({
      type: 'SyntaxError',
      severity: ERROR_SEVERITY.CRITICAL,
      category: ERROR_CATEGORY.SYNTAX,
      line,
      column,
      message: e.message || 'Syntax error',
      code: lines[line - 1] || '',
      explanation: getErrorExplanation(e.message),
      fix: getSyntaxFix(e.message, lines, line),
    });
    return errors;
  }

  // ─── Logic Errors ────────────────────────────────────────────────────────

  // 1. Unused variables
  const usedVars = new Set();
  const declaredVars = new Map();

  function walkForVars(node) {
    if (!node || typeof node !== 'object') return;

    // Track variable declarations
    if (node.type === 'VariableDeclaration') {
      for (const decl of node.declarations || []) {
        if (decl.id?.name) {
          declaredVars.set(decl.id.name, node.loc?.start?.line || 0);
        }
      }
    }

    // Track variable usage
    if (node.type === 'Identifier') {
      usedVars.add(node.name);
    }

    // Recursively walk
    for (const key of Object.keys(node)) {
      if (key === 'type' || key === 'loc' || key === 'start' || key === 'end') continue;
      const child = node[key];
      if (Array.isArray(child)) {
        for (const item of child) walkForVars(item);
      } else if (child && typeof child === 'object' && child.type) {
        walkForVars(child);
      }
    }
  }

  walkForVars(ast);

  // Report unused variables
  for (const [varName, line] of declaredVars) {
    if (!usedVars.has(varName) && !varName.startsWith('_')) {
      errors.push({
        type: 'UnusedVariable',
        severity: ERROR_SEVERITY.WARNING,
        category: ERROR_CATEGORY.STYLE,
        line,
        message: `Variable '${varName}' is declared but never used`,
        code: lines[line - 1] || '',
        explanation: `The variable '${varName}' is created on line ${line} but its value is never read or used anywhere in the code.`,
        fix: `Remove the declaration or use the variable. Prefix with '_' to suppress: let _${varName} = ...`,
      });
    }
  }

  // 2. Infinite loops
  const loopExpressions = [];

  function walkForLoops(node) {
    if (!node || typeof node !== 'object') return;

    if (node.type === 'WhileStatement' && node.test?.type === 'Literal' && node.test?.value === true) {
      loopExpressions.push({
        line: node.loc?.start?.line || 0,
        type: 'infinite-while',
        code: lines[node.loc?.start?.line - 1] || '',
      });
    }

    if (node.type === 'ForStatement' && !node.update) {
      loopExpressions.push({
        line: node.loc?.start?.line || 0,
        type: 'infinite-for',
        code: lines[node.loc?.start?.line - 1] || '',
      });
    }

    for (const key of Object.keys(node)) {
      if (key === 'type' || key === 'loc' || key === 'start' || key === 'end') continue;
      const child = node[key];
      if (Array.isArray(child)) {
        for (const item of child) walkForLoops(item);
      } else if (child && typeof child === 'object' && child.type) {
        walkForLoops(child);
      }
    }
  }

  walkForLoops(ast);

  for (const loop of loopExpressions) {
    if (loop.type === 'infinite-while') {
      errors.push({
        type: 'InfiniteLoop',
        severity: ERROR_SEVERITY.ERROR,
        category: ERROR_CATEGORY.LOGIC,
        line: loop.line,
        message: 'Infinite loop detected: while(true) without break',
        code: loop.code,
        explanation: 'This while loop will never terminate because the condition is always true and there\'s no guaranteed break statement.',
        fix: 'Add a break condition or modify the while condition to eventually become false.',
      });
    }
  }

  // 3. Missing return statements
  function findFunctionsWithoutReturn(node) {
    if (!node || typeof node !== 'object') return [];

    const results = [];

    if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
      const name = node.id?.name || '<anonymous function>';
      const line = node.loc?.start?.line || 0;

      // Check if function body has return statements
      let hasReturn = false;

      function checkBody(bodyNode) {
        if (!bodyNode) return false;

        if (bodyNode.type === 'BlockStatement') {
          for (const stmt of bodyNode.body || []) {
            if (stmt.type === 'ReturnStatement') return true;
            if (checkBody(stmt)) return true;
          }
        } else if (bodyNode.type === 'IfStatement') {
          return checkBody(bodyNode.consequent) || checkBody(bodyNode.alternate);
        }

        return false;
      }

      hasReturn = checkBody(node.body);

      if (!hasReturn && name !== '<anonymous function>') {
        results.push({
          name,
          line,
          code: lines[line - 1] || '',
        });
      }
    }

    for (const key of Object.keys(node)) {
      if (key === 'type' || key === 'loc' || key === 'start' || key === 'end') continue;
      const child = node[key];
      if (Array.isArray(child)) {
        for (const item of child) results.push(...findFunctionsWithoutReturn(item));
      } else if (child && typeof child === 'object' && child.type) {
        results.push(...findFunctionsWithoutReturn(child));
      }
    }

    return results;
  }

  // ─── Performance Warnings ────────────────────────────────────────────────

  // Deeply nested loops
  let maxNesting = 0;
  let currentNesting = 0;
  let nestingLine = 0;

  function checkNesting(node) {
    if (!node || typeof node !== 'object') return;

    if (
      node.type === 'ForStatement' ||
      node.type === 'WhileStatement' ||
      node.type === 'DoWhileStatement' ||
      node.type === 'ForInStatement' ||
      node.type === 'ForOfStatement'
    ) {
      currentNesting++;
      if (currentNesting > maxNesting) {
        maxNesting = currentNesting;
        nestingLine = node.loc?.start?.line || 0;
      }
    }

    for (const key of Object.keys(node)) {
      if (key === 'type' || key === 'loc' || key === 'start' || key === 'end') continue;
      const child = node[key];
      if (Array.isArray(child)) {
        for (const item of child) checkNesting(item);
      } else if (child && typeof child === 'object' && child.type) {
        checkNesting(child);
      }
    }

    if (
      node.type === 'ForStatement' ||
      node.type === 'WhileStatement' ||
      node.type === 'DoWhileStatement' ||
      node.type === 'ForInStatement' ||
      node.type === 'ForOfStatement'
    ) {
      currentNesting--;
    }
  }

  checkNesting(ast);

  if (maxNesting > 3) {
    errors.push({
      type: 'DeepNesting',
      severity: ERROR_SEVERITY.WARNING,
      category: ERROR_CATEGORY.PERFORMANCE,
      line: nestingLine,
      message: `Deeply nested loops (${maxNesting} levels) may cause performance issues`,
      code: lines[nestingLine - 1] || '',
      explanation: `Your code has ${maxNesting} levels of nested loops. This could result in O(n^${maxNesting}) time complexity, which may be too slow for large inputs.`,
      fix: `Consider refactoring to reduce nesting levels or using different algorithms.`,
    });
  }

  return errors;
}

/**
 * Detect Java-specific errors (simplified)
 */
function detectJavaErrors(code) {
  const errors = [];
  const lines = code.split('\n');

  // Missing semicolons
  const semiRegex = /^[^;]*[a-zA-Z0-9_\]\)]\s*$/;
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.endsWith(';') && !trimmed.endsWith('{') && !trimmed.endsWith('}') && trimmed !== '') {
      if (semiRegex.test(trimmed)) {
        errors.push({
          type: 'MissingSemicolon',
          severity: ERROR_SEVERITY.ERROR,
          category: ERROR_CATEGORY.SYNTAX,
          line: idx + 1,
          message: 'Missing semicolon',
          code: line,
          explanation: 'Java statements must end with a semicolon.',
          fix: `Add ';' at the end of line ${idx + 1}`,
        });
      }
    }
  });

  return errors;
}

/**
 * Detect C++ specific errors (simplified)
 */
function detectCppErrors(code) {
  const errors = [];
  const lines = code.split('\n');

  // ─── Check for missing braces ───────────────────────────────────────────
  let braceCount = 0;
  let braceLine = 0;

  for (let i = 0; i < code.length; i++) {
    if (code[i] === '{') {
      braceCount++;
      if (braceCount === 1) {
        braceLine = code.substring(0, i).split('\n').length;
      }
    }
    if (code[i] === '}') {
      braceCount--;
    }
  }

  if (braceCount > 0) {
    errors.push({
      type: 'MissingClosingBrace',
      severity: ERROR_SEVERITY.CRITICAL,
      category: ERROR_CATEGORY.SYNTAX,
      line: lines.length,
      message: `Missing ${braceCount} closing brace${braceCount > 1 ? 's' : ''}`,
      code: lines[lines.length - 1] || '',
      explanation: `Your code has ${braceCount} unmatched opening brace${braceCount > 1 ? 's' : ''}. Every '{' needs a matching '}'.`,
      fix: `Add ${braceCount} closing brace${braceCount > 1 ? 's' : ''} '}'  at the end of your code.`,
    });
  } else if (braceCount < 0) {
    errors.push({
      type: 'ExtraClosingBrace',
      severity: ERROR_SEVERITY.CRITICAL,
      category: ERROR_CATEGORY.SYNTAX,
      line: lines.length,
      message: `Extra closing brace${braceCount < -1 ? 's' : ''}`,
      code: lines[lines.length - 1] || '',
      explanation: `Your code has ${Math.abs(braceCount)} extra closing brace${Math.abs(braceCount) > 1 ? 's' : ''}.`,
      fix: `Remove ${Math.abs(braceCount)} closing brace${Math.abs(braceCount) > 1 ? 's' : ''} '}'.`,
    });
  }

  // ─── Check for missing semicolons ───────────────────────────────────────
  const semiRegex = /^[^;]*[a-zA-Z0-9_\]\)]\s*$/;
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.endsWith(';') && !trimmed.endsWith('{') && !trimmed.endsWith('}') && trimmed !== '') {
      if (semiRegex.test(trimmed) && !trimmed.startsWith('#')) {
        errors.push({
          type: 'MissingSemicolon',
          severity: ERROR_SEVERITY.ERROR,
          category: ERROR_CATEGORY.SYNTAX,
          line: idx + 1,
          message: 'Missing semicolon',
          code: line,
          explanation: 'C++ statements must end with a semicolon.',
          fix: `Add ';' at the end of line ${idx + 1}`,
        });
      }
    }
  });

  // ─── Check for common includes ───────────────────────────────────────────
  if (code.includes('cout') || code.includes('cin')) {
    if (!code.includes('#include <iostream>')) {
      errors.push({
        type: 'MissingInclude',
        severity: ERROR_SEVERITY.ERROR,
        category: ERROR_CATEGORY.SYNTAX,
        line: 1,
        message: 'Missing #include <iostream>',
        code: lines[0] || '',
        explanation: 'Using cout/cin requires including <iostream>',
        fix: 'Add #include <iostream> at the top of your file',
      });
    }
  }

  return errors;
}

/**
 * Get human-readable explanation for an error
 */
function getErrorExplanation(errorMessage) {
  const explanations = {
    'Unexpected identifier': 'You have an unexpected variable or identifier name. Check for typos or missing operators.',
    'Unexpected token': 'There\'s a syntax error here. Check for missing brackets, parentheses, or quotation marks.',
    'Missing semicolon': 'JavaScript statements should end with a semicolon.',
    'Unexpected end of input': 'Your code appears to be incomplete. Check for missing closing brackets or braces.',
  };

  for (const [key, value] of Object.entries(explanations)) {
    if (errorMessage.includes(key)) {
      return value;
    }
  }

  return errorMessage;
}

/**
 * Suggest fixes for syntax errors
 */
function getSyntaxFix(errorMessage, lines, errorLine) {
  const line = lines[errorLine - 1] || '';

  if (errorMessage.includes('Unexpected token')) {
    if (!line.includes('{')) return 'Add missing opening brace {';
    if (!line.includes('}')) return 'Add missing closing brace }';
    if (!line.includes('(')) return 'Add missing opening parenthesis (';
    if (!line.includes(')')) return 'Add missing closing parenthesis )';
  }

  return 'Check the syntax of line ' + errorLine;
}
