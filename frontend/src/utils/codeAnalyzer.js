/**
 * Code Analyzer — Static analysis engine for the Code Visualizer tab.
 *
 * JavaScript:  Full AST-level analysis via acorn.
 * Java / C++:  Regex-based extraction (functions, variables, loops, conditionals, calls).
 *
 * Returns a uniform analysis object regardless of language.
 */

import * as acorn from 'acorn';

// ─── Result shape ────────────────────────────────────────────────────────────
function emptyAnalysis() {
  return {
    functions: [],     // { name, params[], startLine, endLine, calls[], complexity, body }
    variables: [],     // { name, scope, kind, line }
    controlFlow: [],   // { type: 'loop'|'conditional', kind, line, parentFn }
    callGraph: [],     // { caller, callee, line }
    metrics: {
      totalLines: 0,
      functionCount: 0,
      variableCount: 0,
      maxNesting: 0,
      cyclomaticComplexity: 1,
      loops: 0,
      conditionals: 0,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  JAVASCRIPT — full AST via acorn
// ═══════════════════════════════════════════════════════════════════════════════

function analyzeJavaScript(code) {
  const analysis = emptyAnalysis();
  analysis.metrics.totalLines = code.split('\n').length;

  let ast;
  try {
    ast = acorn.parse(code, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      locations: true,
      allowReturnOutsideFunction: true,
      allowAwaitOutsideFunction: true,
    });
  } catch {
    // Syntax error — return whatever we can
    return analysis;
  }

  const fnStack = [];   // track current enclosing function name
  let maxNesting = 0;
  let nestingDepth = 0;

  function currentFn() {
    return fnStack.length ? fnStack[fnStack.length - 1] : '__global__';
  }

  function pushNesting() {
    nestingDepth++;
    if (nestingDepth > maxNesting) maxNesting = nestingDepth;
  }
  function popNesting() {
    nestingDepth--;
  }

  // Recursive AST walker
  function walk(node) {
    if (!node || typeof node !== 'object') return;

    switch (node.type) {
      // ── Functions ──────────────────────────────────────────────────────
      case 'FunctionDeclaration':
      case 'FunctionExpression':
      case 'ArrowFunctionExpression': {
        const name =
          node.id?.name ||
          (node.type === 'FunctionDeclaration' ? '<anonymous>' : null);

        // For variable-assigned functions:  const foo = () => {}
        const fnName = name || '<arrow>';

        const params = (node.params || []).map(
          (p) => p.name || p.left?.name || '...'
        );

        const fnEntry = {
          name: fnName,
          params,
          startLine: node.loc?.start?.line ?? 0,
          endLine: node.loc?.end?.line ?? 0,
          calls: [],
          complexity: null,
        };
        analysis.functions.push(fnEntry);

        fnStack.push(fnName);
        pushNesting();
        if (node.body) walk(node.body);
        popNesting();
        fnStack.pop();
        return; // already walked body
      }

      // ── Variable declarations ──────────────────────────────────────────
      case 'VariableDeclaration': {
        for (const decl of node.declarations) {
          // If the init is a function, the walk below will handle it
          const varName = decl.id?.name || decl.id?.type || '?';

          // Check if this is actually a function assignment
          const isFunc =
            decl.init &&
            (decl.init.type === 'FunctionExpression' ||
              decl.init.type === 'ArrowFunctionExpression');

          if (isFunc) {
            // Treat as a named function
            const params = (decl.init.params || []).map(
              (p) => p.name || p.left?.name || '...'
            );
            const fnEntry = {
              name: varName,
              params,
              startLine: node.loc?.start?.line ?? 0,
              endLine: decl.init.loc?.end?.line ?? node.loc?.end?.line ?? 0,
              calls: [],
              complexity: null,
            };
            analysis.functions.push(fnEntry);

            fnStack.push(varName);
            pushNesting();
            if (decl.init.body) walk(decl.init.body);
            popNesting();
            fnStack.pop();
          } else {
            analysis.variables.push({
              name: varName,
              scope: currentFn(),
              kind: node.kind, // let, const, var
              line: node.loc?.start?.line ?? 0,
            });
            if (decl.init) walk(decl.init);
          }
        }
        return;
      }

      // ── Loops ──────────────────────────────────────────────────────────
      case 'ForStatement':
      case 'ForInStatement':
      case 'ForOfStatement':
      case 'WhileStatement':
      case 'DoWhileStatement': {
        const kind = node.type.replace('Statement', '').toLowerCase();
        analysis.controlFlow.push({
          type: 'loop',
          kind,
          line: node.loc?.start?.line ?? 0,
          parentFn: currentFn(),
        });
        analysis.metrics.cyclomaticComplexity++;
        pushNesting();
        for (const key of Object.keys(node)) {
          if (key === 'type' || key === 'loc' || key === 'start' || key === 'end') continue;
          walk(node[key]);
        }
        popNesting();
        return;
      }

      // ── Conditionals ───────────────────────────────────────────────────
      case 'IfStatement': {
        analysis.controlFlow.push({
          type: 'conditional',
          kind: 'if',
          line: node.loc?.start?.line ?? 0,
          parentFn: currentFn(),
          hasElse: !!node.alternate,
        });
        analysis.metrics.cyclomaticComplexity++;
        pushNesting();
        walk(node.test);
        walk(node.consequent);
        popNesting();
        if (node.alternate) walk(node.alternate);
        return;
      }

      case 'SwitchStatement': {
        analysis.controlFlow.push({
          type: 'conditional',
          kind: 'switch',
          line: node.loc?.start?.line ?? 0,
          parentFn: currentFn(),
        });
        analysis.metrics.cyclomaticComplexity += (node.cases?.length || 1);
        pushNesting();
        for (const c of node.cases || []) walk(c);
        popNesting();
        return;
      }

      // ── Call expressions ───────────────────────────────────────────────
      case 'CallExpression':
      case 'NewExpression': {
        let calleeName = null;
        if (node.callee.type === 'Identifier') {
          calleeName = node.callee.name;
        } else if (node.callee.type === 'MemberExpression' && node.callee.property) {
          calleeName = node.callee.property.name || node.callee.property.value;
        }

        if (calleeName) {
          const caller = currentFn();
          analysis.callGraph.push({
            caller,
            callee: calleeName,
            line: node.loc?.start?.line ?? 0,
          });
          // Also add to the current function's calls list
          const parentFnObj = analysis.functions.find((f) => f.name === caller);
          if (parentFnObj && !parentFnObj.calls.includes(calleeName)) {
            parentFnObj.calls.push(calleeName);
          }
        }
        break; // let default walk handle arguments
      }

      default:
        break;
    }

    // Default: walk all child nodes
    for (const key of Object.keys(node)) {
      if (key === 'type' || key === 'loc' || key === 'start' || key === 'end') continue;
      const child = node[key];
      if (Array.isArray(child)) {
        for (const item of child) walk(item);
      } else if (child && typeof child === 'object' && child.type) {
        walk(child);
      }
    }
  }

  walk(ast);

  analysis.metrics.maxNesting = maxNesting;
  analysis.metrics.functionCount = analysis.functions.length;
  analysis.metrics.variableCount = analysis.variables.length;
  analysis.metrics.loops = analysis.controlFlow.filter((c) => c.type === 'loop').length;
  analysis.metrics.conditionals = analysis.controlFlow.filter((c) => c.type === 'conditional').length;

  // Estimate per-function complexity
  for (const fn of analysis.functions) {
    const fnLoops = analysis.controlFlow.filter((c) => c.parentFn === fn.name && c.type === 'loop').length;
    const fnConds = analysis.controlFlow.filter((c) => c.parentFn === fn.name && c.type === 'conditional').length;
    if (fnLoops >= 2) fn.complexity = 'O(n²)';
    else if (fnLoops === 1) fn.complexity = 'O(n)';
    else if (fn.calls.some((c) => c === fn.name)) fn.complexity = 'O(2ⁿ)'; // recursive
    else fn.complexity = 'O(1)';
  }

  return analysis;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  JAVA / C++ — regex-based extraction
// ═══════════════════════════════════════════════════════════════════════════════

function analyzeRegexBased(code, language) {
  const analysis = emptyAnalysis();
  const lines = code.split('\n');
  analysis.metrics.totalLines = lines.length;

  // Helper: convert a character index to a 1-based line number
  function idxToLine(idx) {
    let line = 1;
    for (let i = 0; i < idx && i < code.length; i++) {
      if (code[i] === '\n') line++;
    }
    return line;
  }

  // Helper: find scope (which function contains this line?)
  function findScope(line) {
    for (const fn of analysis.functions) {
      if (line >= fn.startLine && line <= fn.endLine) {
        return fn.name;
      }
    }
    return '__global__';
  }

  // ── Functions ────────────────────────────────────────────────────────────
  // Broad pattern: match "returnType functionName(params) {"
  const fnRegex = /(?:(?:public|private|protected|static|virtual|inline|override|final|const|unsigned|signed)\s+)*(?:[\w:<>,\s&*]+?)\s+(\w+)\s*\(([^)]*)\)\s*(?:const\s*)?(?:override\s*)?(?:throws\s+[\w,\s]+)?\s*\{/g;

  const foundFunctions = new Set();
  let fnMatch;
  while ((fnMatch = fnRegex.exec(code)) !== null) {
    const name = fnMatch[1];
    if (foundFunctions.has(name)) continue;
    if (['if', 'else', 'for', 'while', 'switch', 'catch', 'return', 'class', 'struct', 'namespace', 'template', 'do', 'try'].includes(name)) continue;

    foundFunctions.add(name);
    const paramStr = fnMatch[2] || '';
    const params = paramStr
      .split(',')
      .map((p) => p.trim().split(/\s+/).pop()?.replace(/[&*]/g, ''))
      .filter(Boolean);

    const startLine = idxToLine(fnMatch.index);

    // Find matching closing brace via brace counting
    let braceCount = 0;
    let endLine = startLine;
    let foundEnd = false;
    for (let i = startLine - 1; i < lines.length; i++) {
      for (const ch of lines[i]) {
        if (ch === '{') braceCount++;
        if (ch === '}') braceCount--;
      }
      if (braceCount <= 0 && i > startLine - 1) {
        endLine = i + 1;
        foundEnd = true;
        break;
      }
    }
    if (!foundEnd) endLine = lines.length;

    analysis.functions.push({
      name,
      params,
      startLine,
      endLine,
      calls: [],
      complexity: null,
    });
  }

  // ── Variables ────────────────────────────────────────────────────────────
  // Match type declarations including comma-separated vars
  const varLineRegex = /\b(?:int|long|double|float|char|bool|boolean|string|String|auto|var|let|const|short|unsigned|signed|size_t|long\s+long)\s+([^;{(]+)[;]/g;
  let varLineMatch;
  while ((varLineMatch = varLineRegex.exec(code)) !== null) {
    const line = idxToLine(varLineMatch.index);
    const scope = findScope(line);
    const declPart = varLineMatch[1];

    // Split by comma to handle "int a = 1, b = 2, c;"
    const parts = declPart.split(',');
    for (const part of parts) {
      // Extract variable name (last word before =, or the whole word)
      const cleaned = part.trim().replace(/\s*=.*$/, '').trim();
      const nameMatch = cleaned.match(/(\w+)$/);
      if (!nameMatch) continue;
      const name = nameMatch[1];

      // Skip keywords
      if (['main', 'if', 'for', 'while', 'return', 'true', 'false', 'NULL', 'nullptr'].includes(name)) continue;

      analysis.variables.push({
        name,
        scope,
        kind: 'auto',
        line,
      });
    }
  }

  // Also capture loop-scoped variables like "for (int i = 0; ...)"
  const forVarRegex = /\bfor\s*\(\s*(?:int|long|double|float|char|auto|size_t|unsigned)\s+(\w+)/g;
  let forVarMatch;
  while ((forVarMatch = forVarRegex.exec(code)) !== null) {
    const line = idxToLine(forVarMatch.index);
    const scope = findScope(line);
    const name = forVarMatch[1];
    if (!analysis.variables.find((v) => v.name === name && v.line === line)) {
      analysis.variables.push({ name, scope, kind: 'auto', line });
    }
  }

  // ── Loops ───────────────────────────────────────────────────────────────
  const loopRegex = /\b(for|while|do)\s*[\({]/g;
  let loopMatch;
  while ((loopMatch = loopRegex.exec(code)) !== null) {
    const line = idxToLine(loopMatch.index);
    const parentFn = findScope(line);
    analysis.controlFlow.push({
      type: 'loop',
      kind: loopMatch[1],
      line,
      parentFn,
    });
    analysis.metrics.cyclomaticComplexity++;
  }

  // ── Conditionals ────────────────────────────────────────────────────────
  const condRegex = /\b(if|else\s+if|switch)\s*\(/g;
  let condMatch;
  while ((condMatch = condRegex.exec(code)) !== null) {
    const line = idxToLine(condMatch.index);
    const parentFn = findScope(line);
    analysis.controlFlow.push({
      type: 'conditional',
      kind: condMatch[1].trim(),
      line,
      parentFn,
    });
    analysis.metrics.cyclomaticComplexity++;
  }

  // ── Function calls ──────────────────────────────────────────────────────
  const callRegex = /\b(\w+)\s*\(/g;
  const keywords = new Set([
    'if', 'else', 'for', 'while', 'switch', 'catch', 'return', 'class',
    'struct', 'namespace', 'template', 'new', 'delete', 'sizeof', 'typeof',
    'do', 'throw', 'try', 'public', 'private', 'protected', 'static',
    'void', 'int', 'long', 'double', 'float', 'char', 'bool', 'boolean',
    'string', 'String', 'auto', 'var', 'vector', 'List', 'Map', 'Set',
    'printf', 'scanf', 'cout', 'cin', 'System', 'include', 'define',
    'using', 'unsigned', 'signed',
  ]);

  let callMatch;
  while ((callMatch = callRegex.exec(code)) !== null) {
    const callee = callMatch[1];
    if (keywords.has(callee)) continue;
    // Skip if it's a function declaration (already captured)
    if (foundFunctions.has(callee)) {
      // Check if this is the declaration line itself
      const line = idxToLine(callMatch.index);
      const fnDef = analysis.functions.find((f) => f.name === callee);
      if (fnDef && line === fnDef.startLine) continue;
    }

    const line = idxToLine(callMatch.index);
    const caller = findScope(line);

    analysis.callGraph.push({ caller, callee, line });
    const parentFnObj = analysis.functions.find((f) => f.name === caller);
    if (parentFnObj && !parentFnObj.calls.includes(callee)) {
      parentFnObj.calls.push(callee);
    }
  }

  // ── Metrics ─────────────────────────────────────────────────────────────
  analysis.metrics.functionCount = analysis.functions.length;
  analysis.metrics.variableCount = analysis.variables.length;
  analysis.metrics.loops = analysis.controlFlow.filter((c) => c.type === 'loop').length;
  analysis.metrics.conditionals = analysis.controlFlow.filter((c) => c.type === 'conditional').length;

  // Estimate nesting
  let nesting = 0;
  let maxN = 0;
  for (const line of lines) {
    for (const ch of line) {
      if (ch === '{') { nesting++; if (nesting > maxN) maxN = nesting; }
      if (ch === '}') nesting--;
    }
  }
  analysis.metrics.maxNesting = maxN;

  // Per-function complexity estimate
  for (const fn of analysis.functions) {
    const fnLoops = analysis.controlFlow.filter((c) => c.parentFn === fn.name && c.type === 'loop').length;
    if (fnLoops >= 2) fn.complexity = 'O(n²)';
    else if (fnLoops === 1) fn.complexity = 'O(n)';
    else if (fn.calls.includes(fn.name)) fn.complexity = 'O(2ⁿ)';
    else fn.complexity = 'O(1)';
  }

  return analysis;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Public API
// ═══════════════════════════════════════════════════════════════════════════════

export function analyzeCode(code, language) {
  if (!code || !code.trim()) return emptyAnalysis();

  if (language === 'javascript') {
    return analyzeJavaScript(code);
  }
  return analyzeRegexBased(code, language);
}
