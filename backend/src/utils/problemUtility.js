// Backward-compatibility shim: the Judge0 integration now lives in
// services/execution/judge0Client.js (env-based URL, auth, capped polling).
module.exports = require('../services/execution/judge0Client');
