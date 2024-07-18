import { ttySetRaw } from 'os'
import { in as stdin } from 'std'

/**
 * @module terminal
 * A module for handling keyboard input in a terminal environment.
 */

/**
 * @typedef {Object.<string, string>} KeySequences
 * An object mapping key names to their corresponding escape sequences.
 */

/**
 * @type {KeySequences}
 * A predefined object containing key sequences for various keyboard inputs.
 */
const keySequences = {
  // Arrow keys
  'ArrowUp': '\x1b[A',
  'ArrowDown': '\x1b[B',
  'ArrowRight': '\x1b[C',
  'ArrowLeft': '\x1b[D',

  // Function keys
  'F1': '\x1bOP',
  'F2': '\x1bOQ',
  'F3': '\x1bOR',
  'F4': '\x1bOS',
  'F5': '\x1b[15~',
  'F6': '\x1b[17~',
  'F7': '\x1b[18~',
  'F8': '\x1b[19~',
  'F9': '\x1b[20~',
  'F10': '\x1b[21~',
  'F11': '\x1b[23~',
  'F12': '\x1b[24~',

  // Control keys
  'Home': '\x1b[H',
  'End': '\x1b[F',
  'PageUp': '\x1b[5~',
  'PageDown': '\x1b[6~',
  'Insert': '\x1b[2~',
  'Delete': '\x1b[3~',

  // Special characters (example, add more as needed)
  'Space': ' ',
  'Enter': '\r',
  'Escape': '\x1b',
  'Tab': '\t',
  'Backspace': '\b',

  // Other special keys
  'Ctrl+C': '\x03',
  'Ctrl+Z': '\x1a',
  'Ctrl+D': '\x04'
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
 * Sets up a key press handling loop for the specified key sequences.
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
 * - The Escape key is treated specially: pressing it twice will exit the loop if no specific Escape handler is provided.
 * - For other keys, their corresponding handler functions are called when the key sequence is matched.
 */
const handleKeysPress = (keysAndCb) => {
  let exit = false;
  const quit = () => exit = true;
  ttySetRaw(2);
  let escapeSequence = '';
  const keys = Object.keys(keysAndCb);
  while (true) {
    if (exit) return;
    const input = stdin.readAsString(1);
    escapeSequence += input;

    if (escapeSequence === keySequences.Escape) {
      const nextChar = stdin.readAsString(1);
      if (nextChar === keySequences.Escape) keys.includes(keySequences.Escape) ? keysAndCb[keySequences.Escape](quit) : quit();
      else escapeSequence += nextChar;
      continue;
    }

    if (keys.includes(escapeSequence)) { keysAndCb[escapeSequence](quit); escapeSequence = '' }
    escapeSequence = '';
  }
}

let count = 0;
handleKeysPress({
  j: () => { print('j pressed'); count++ },
  k: () => { print('k pressed'); count++ },
  [keySequences.ArrowUp]: () => print('arrow up'),
  [keySequences.Enter]: (quit) => { print('count: ', count); quit() },
  [keySequences.Escape]: (quit) => { print('Bye!!!'); quit() }
})

export { keySequences, handleKeysPress }
