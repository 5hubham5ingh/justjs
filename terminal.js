import { ttySetRaw } from "os";
import { in as stdin } from "std";

/**
 * Used for key mapping in keysPressHandler function
 *
 * @readonly
 * @enum {string}
 */
const keySequences = {
  // Arrow keys
  "ArrowUp": "\x1b[A",
  "ArrowDown": "\x1b[B",
  "ArrowRight": "\x1b[C",
  "ArrowLeft": "\x1b[D",

  // Function keys
  "F1": "\x1bOP",
  "F2": "\x1bOQ",
  "F3": "\x1bOR",
  "F4": "\x1bOS",
  "F5": "\x1b[15~",
  "F6": "\x1b[17~",
  "F7": "\x1b[18~",
  "F8": "\x1b[19~",
  "F9": "\x1b[20~",
  "F10": "\x1b[21~",
  "F11": "\x1b[23~",
  "F12": "\x1b[24~",

  // Control keys
  "Home": "\x1b[H",
  "End": "\x1b[F",
  "PageUp": "\x1b[5~",
  "PageDown": "\x1b[6~",
  "Insert": "\x1b[2~",
  "Delete": "\x1b[3~",

  // Special characters (example, add more as needed)
  "Space": " ",
  "Enter": "\r",
  "Escape": "\x1b",
  "Tab": "\t",
  "ShiftTab": "\x1b[Z",
  "Backspace": "\x7F",

  // Other special keys
  "Ctrl+C": "\x03",
  "Ctrl+Z": "\x1a",
  "Ctrl+D": "\x04",

  // Key groups
  capitalLetters: "capitalLetters",
  smallLetters: "smallLetters",
  numbers: "numbers",
};

const mapCapitalLetterKeys = (keysAndCb) => {
  const capitalLettersCb = keysAndCb[keySequences.capitalLetters];
  for (let i = 65; i < 90; i++) {
    keysAndCb[String.fromCharCode(i)] = capitalLettersCb;
  }
  delete keysAndCb[keySequences.capitalLetters];
};

const mapSmallLetterKeys = (keysAndCb) => {
  const smallLettersCb = keysAndCb[keySequences.smallLetters];
  for (let i = 97; i < 122; i++) {
    keysAndCb[String.fromCharCode(i)] = smallLettersCb;
  }
  delete keysAndCb[keySequences.smallLetters];
};

const mapNumberkeys = (keysAndCb) => {
  const numberCb = keysAndCb[keySequences.numbers];
  for (let i = 0; i < 10; i++) {
    keysAndCb[`${i}`] = numberCb;
  }
  delete keysAndCb[keySequences.numbers];
};

/**
 * @callback QuitFunction
 * A function that, when called, exits the key handling loop.
 */

/**
 * @callback KeyHandler
 * @param {QuitFunction} quit - A function to exit the key handling loop.
 */

/**
 * @typedef {Object.<string, KeyHandler>} KeyHandlers
 * An object mapping key sequences to their corresponding handler functions.
 */

/**
 * Sets up a key press handler for the specified key sequences.
 *
 * @param {KeyHandlers} keysAndCb - An object where keys are key sequences (either from keySequences or custom strings) and values are handler functions.
 *
 * @example
 * handleKeysPress({
 *   'j': () => console.log('j pressed'),
 *   [keySequences.ArrowUp]: () => console.log('Arrow up pressed'),
 *   [keySequences.Enter]: (quit) => { console.log('Enter pressed'); quit(); }
 * });
 *
 * @description
 * - The function sets the terminal to raw mode for direct key input.
 * - It continuously reads input until the quit function is called.
 * - Each key handler receives a `quit` function as an argument, which can be called to exit the handling loop.
 * - The Escape key is treated specially: pressing it twice will terminate the key press handler if no specific Escape handler is provided.
 * - For other keys, their corresponding handler functions are called when the key sequence is matched.
 */
const handleKeysPress = async (keysAndCb) => {
  let exit = false;
  const quit = () => exit = true;
  let escapeSequence = "";
  let keys = Object.keys(keysAndCb);
  if (keys.includes(keySequences.capitalLetters)) {
    mapCapitalLetterKeys(keysAndCb);
  }
  if (keys.includes(keySequences.smallLetters)) mapSmallLetterKeys(keysAndCb);
  if (keys.includes(keySequences.numbers)) mapNumberkeys(keysAndCb);
  keys = Object.keys(keysAndCb);
  while (!exit) {
    const input = stdin.readAsString(1);
    escapeSequence += input;

    if (escapeSequence === keySequences.Escape) {
      const nextChar = stdin.readAsString(1);
      if (nextChar === keySequences.Escape) {
        keys.includes(keySequences.Escape)
          ? await keysAndCb[keySequences.Escape](escapeSequence, quit)
          : quit();
      } else escapeSequence += nextChar;
      continue;
    }

    if (keys.includes(escapeSequence)) {
      await keysAndCb[escapeSequence](escapeSequence, quit);
      escapeSequence = "";
    } else if (keys.includes("default")) {
      await keysAndCb["default"](escapeSequence)
      escapeSequence = ""
    }
    escapeSequence = "";
  }
};

/**
 * Retrieves the current size of the terminal window.
 *
 * @function getTerminalSize
 * @returns {[number, number]} An array containing the width and height of the terminal in characters.
 *
 * @description
 * This function attempts to determine the size of the terminal window using the following methods:
 * 1. If the output is connected to a TTY (terminal), it uses the ttyGetWinSize function.
 * 2. If not connected to a TTY, it tries to read the COLUMNS and LINES environment variables.
 * 3. If neither method works, it returns a default size of [50, 10].
 *
 * @example
 * const [width, height] = getTerminalSize();
 * console.log(`Terminal size: ${width}x${height}`);
 */
const getTerminalSize = () => {
  const [width, height] = isatty(1)
    ? ttyGetWinSize(1)
    : [getenv("COULMNS"), getenv("LINES")];
  return !width && !height ? [50, 10] : [width, height];
};

let count = 0;
// handleKeysPress({
//   j: () => { print('j pressed'); count++ },
//   k: () => { print('k pressed'); count++ },
//   [keySequences.ArrowUp]: () => print('arrow up'),
//   [keySequences.Enter]: (key, quit) => { print('count: ', count); quit() },
//   [keySequences.Escape]: (key, quit) => { print('Bye!!!'); quit() },
//   [keySequences.Backspace]: (key, quit) => { print('back!!'); quit() }
// })

export { getTerminalSize, handleKeysPress, keySequences };
