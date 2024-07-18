import { ttySetRaw } from 'os'
import { in as stdin } from 'std'

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
 * Handles a key press event and triggers a callback function when the specified key is pressed.
 * @param {string} key - The key sequence to listen for.
 * @param {function} cb - The callback function to execute when the key is pressed.
 */
const handleKeyPress = async (key, cb) => {
  ttySetRaw(2);
  while (true) {
    const input = stdin.readAsString(1);
    if (input === key) { cb(); return }
  }
}

const handleKeysPress = (keysAndCb) => {
  ttySetRaw(2);
  while (true) {
    const input = stdin.readAsString(1);
    if (Object.keys(keysAndCb).includes(input)) keysAndCb[input]();
  }
}



export { keySequences, handleKeyPress }
