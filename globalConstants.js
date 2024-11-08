import * as std from "../qjs-ext-lib/src/std.js";
import * as os from "../qjs-ext-lib/src/os.js";
import { ansi } from "./ansiStyle.js";
import { exec as execAsync } from "../qjs-ext-lib/src/process.js";
import { cursorShow } from "./cursor.js";

globalThis.OS = os;

globalThis.STD = std;

/**
 * @type {string}
 */
globalThis.HOME_DIR = std.getenv("HOME");

/**
 * Represents a system-level error that extends the built-in Error class.
 * Provides a method to log the error in a formatted style.
 *
 * @class
 * @extends Error
 */
globalThis.SystemError = class SystemError extends Error {
  /**
   * Creates an instance of SystemError.
   *
   * @param {string} name - The error name describing the nature of issue.
   * @param {string} [description] - Additional description about the error (optional).
   * @param {typeof Error} body
   */
  constructor(name, description, body) {
    super(name);
    this.name = name;
    this.description = description;
    this.body = body;
  }

  /**
   * Logs the error in a formatted style, using ANSI codes for styling.
   *
   * @param {boolean} inspect - Wheather to print the error body or not for inspection.
   */
  log(inspect) {
    print(
      "\n",
      ansi.styles(["bold", "red"]),
      this.name,
      ":",
      ansi.style.reset,
      "\n",
      ansi.style.red,
      this.description?.split(";")?.map((line) => line.trim())?.join("\n"),
      ansi.style.reset,
      "\n",
      inspect ? this.body : "",
      cursorShow,
    );
  }
};

globalThis.execAsync = execAsync;

const handleError = (error, blockName) => {
  if (error instanceof SystemError || (error === EXIT)) throw error;
  if (error.stackTrace) {
    error.stackTrace.push(blockName ?? "anonymous");
  } else {
    error.stackTrace = [blockName];
  }
  throw error;
};

/**
 * @param {Function} cb - Callback
 * @param {string} blockName - Error message / Block name
 * @returns {Promise<Error | SystemError>}
 */
globalThis.catchAsyncError = async (cb, blockName) => {
  try {
    return await cb();
  } catch (error) {
    handleError(error, blockName);
  }
};

globalThis.catchError = (cb, blockName) => {
  try {
    return cb();
  } catch (error) {
    handleError(error, blockName);
  }
};

globalThis.EXIT = 0;
