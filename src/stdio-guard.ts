/**
 * MCP stdio transports reserve stdout for JSON-RPC messages.
 * Route console log channels to stderr before the rest of the server loads.
 */
const writeToStderr: typeof console.log = console.error.bind(console);

console.log = writeToStderr;
console.info = writeToStderr;
console.debug = writeToStderr;
