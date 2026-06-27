// In-browser JavaScript executor for the Run button.
// Runs user code in a sandboxed Web Worker with Node-style shims
// (require('readline'), process.stdin, fs.readFileSync, readline()) so code
// written for Judge0's Node environment behaves the same here.
// Each test case gets a fresh worker; a hard timeout terminates runaway code.

const WORKER_SOURCE = `
self.onmessage = function (e) {
  var code = e.data.code;
  var stdin = e.data.stdin || '';
  var out = '';
  var errOut = '';

  function fmt(v) {
    if (v && typeof v === 'object') {
      try { return JSON.stringify(v); } catch (_) { return String(v); }
    }
    return String(v);
  }
  function joinArgs(args) {
    return Array.prototype.map.call(args, fmt).join(' ');
  }

  var fakeConsole = {
    log: function () { out += joinArgs(arguments) + '\\n'; },
    info: function () { out += joinArgs(arguments) + '\\n'; },
    warn: function () { errOut += joinArgs(arguments) + '\\n'; },
    error: function () { errOut += joinArgs(arguments) + '\\n'; },
    debug: function () {}
  };

  var lines = stdin.split('\\n');
  if (lines.length && lines[lines.length - 1] === '') lines.pop();
  var lineIdx = 0;
  function nextLine() { return lineIdx < lines.length ? lines[lineIdx++] : ''; }

  var listeners = { line: [], close: [], data: [], end: [] };
  function addListener(ev, h) { if (listeners[ev]) listeners[ev].push(h); }

  var rlInterface = {
    on: function (ev, h) { addListener(ev, h); return rlInterface; },
    once: function (ev, h) { addListener(ev, h); return rlInterface; },
    question: function (q, cb) { if (typeof q === 'function') q(nextLine()); else if (cb) cb(nextLine()); },
    close: function () {},
    removeAllListeners: function () { return rlInterface; }
  };

  var stdinObj = {
    on: function (ev, h) { addListener(ev, h); return stdinObj; },
    once: function (ev, h) { addListener(ev, h); return stdinObj; },
    setEncoding: function () { return stdinObj; },
    resume: function () { return stdinObj; },
    pause: function () { return stdinObj; }
  };

  var exited = false;
  var fakeProcess = {
    stdin: stdinObj,
    stdout: { write: function (s) { out += s; return true; } },
    stderr: { write: function (s) { errOut += s; return true; } },
    argv: ['node', 'main.js'],
    env: {},
    exit: function () { exited = true; throw { __exit: true }; },
    on: function () { return fakeProcess; },
    nextTick: function (fn) { fn(); }
  };

  function fakeRequire(name) {
    var n = String(name).replace(/^node:/, '');
    if (n === 'readline') return { createInterface: function () { return rlInterface; } };
    if (n === 'fs') return { readFileSync: function () { return stdin; } };
    if (n === 'process') return fakeProcess;
    if (n === 'os') return { EOL: '\\n' };
    throw new Error("Cannot find module '" + name + "'");
  }

  function flushStdinEvents() {
    var i, j;
    for (i = 0; i < listeners.data.length; i++) listeners.data[i](stdin);
    for (i = 0; i < listeners.end.length; i++) listeners.end[i]();
    for (i = 0; i < lines.length; i++) {
      for (j = 0; j < listeners.line.length; j++) listeners.line[j](lines[i]);
    }
    for (i = 0; i < listeners.close.length; i++) listeners.close[i]();
  }

  var t0 = Date.now();
  try {
    // Outer vars (not params) so user code may redeclare them with const/let.
    // fetch/importScripts/XMLHttpRequest are shadowed to keep the sandbox quiet.
    var fn = new Function('require', '__console', '__process', '__nextLine',
      'var console = __console;' +
      'var process = __process;' +
      'var readline = __nextLine;' +
      'var module = { exports: {} }; var exports = module.exports;' +
      'var fetch, importScripts, XMLHttpRequest, WebSocket;' +
      '(function () {\\n' + code + '\\n})();'
    );
    fn(fakeRequire, fakeConsole, fakeProcess, nextLine);
    if (!exited) flushStdinEvents();
    self.postMessage({ ok: true, stdout: out, stderr: errOut, timeMs: Date.now() - t0 });
  } catch (ex) {
    if (ex && ex.__exit) {
      self.postMessage({ ok: true, stdout: out, stderr: errOut, timeMs: Date.now() - t0 });
      return;
    }
    var msg = ex && ex.stack ? String(ex.stack) : String(ex);
    self.postMessage({ ok: false, stdout: out, stderr: msg, timeMs: Date.now() - t0 });
  }
};
`;

const runOneCase = (code, stdin, timeoutMs) =>
  new Promise((resolve) => {
    const blob = new Blob([WORKER_SOURCE], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);

    const cleanup = () => {
      worker.terminate();
      URL.revokeObjectURL(url);
    };

    const timer = setTimeout(() => {
      cleanup();
      resolve({ ok: false, timeout: true, stdout: '', stderr: `Time Limit Exceeded (${timeoutMs / 1000}s)`, timeMs: timeoutMs });
    }, timeoutMs);

    worker.onmessage = (e) => {
      clearTimeout(timer);
      cleanup();
      resolve(e.data);
    };
    worker.onerror = (e) => {
      clearTimeout(timer);
      cleanup();
      resolve({ ok: false, stdout: '', stderr: e.message || 'Worker error', timeMs: 0 });
    };

    worker.postMessage({ code, stdin });
  });

const trimTrailing = (s) => (s || '').replace(/\s+$/, '');

export const canRunInBrowser = (language) =>
  language === 'javascript' && typeof Worker !== 'undefined';

// Returns the same shape as POST /submission/run/:id so the UI needs no changes.
export const runJavaScriptLocally = async (code, visibleTestCases, { timeoutMs = 5000 } = {}) => {
  const testCases = [];
  let success = true;
  let runtime = 0;
  let unsupported = false;

  for (const tc of visibleTestCases) {
    const r = await runOneCase(code, tc.input || '', timeoutMs);
    const passed = r.ok && trimTrailing(r.stdout) === trimTrailing(tc.output);
    if (!passed) success = false;
    if (r.stderr && r.stderr.includes('Cannot find module')) unsupported = true;
    runtime += (r.timeMs || 0) / 1000;

    testCases.push({
      stdin: tc.input,
      expected_output: tc.output,
      stdout: r.stdout,
      stderr: r.ok ? null : r.stderr,
      compile_output: r.ok ? null : r.stderr,
      status_id: passed ? 3 : (r.timeout ? 5 : (r.ok ? 4 : 6)),
      time: ((r.timeMs || 0) / 1000).toFixed(3),
      memory: 0
    });
  }

  return {
    success,
    testCases,
    runtime: +runtime.toFixed(3),
    memory: 0,
    engine: 'browser',
    // signals the caller to retry on the server (code uses a module we can't shim)
    unsupported
  };
};
