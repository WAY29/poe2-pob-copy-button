// Set to true to enable debug logging globally
const DEBUG = false;

const PREFIX = "[PoB-Copy]";

export const log = DEBUG ? console.log.bind(console, PREFIX) : () => {};
export const warn = DEBUG ? console.warn.bind(console, PREFIX) : () => {};
export const error = DEBUG ? console.error.bind(console, PREFIX) : () => {};
