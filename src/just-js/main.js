import { cursorUp, cursorLeft, cursorNextLine, eraseScreen, clearTerminal } from './helpers/cursor.js';
import { ansi } from './helpers/ansi.js'
import { ttySetRaw } from 'os'
import { in as stdin, out as stdout } from 'std'
import { keySequences } from './helpers/terminal.js';

const drawLayout = (header, inputField, item) => {
  //  console.log("\x1b[2J\x1b[H");
  print(clearTerminal)
  const ui = `${header}
${inputField}
${item}`
  print(ui)
}

let selection;
const filter = (list) => {
  const header = "Filter";
  const placeHolder = "Type to search."
  const inputField = placeHolder;
  if (!selection) selection = 0;
  let items = list.map((item, index) => `${index === selection ? '> ' : ''}${item}\n`).join('')

  ttySetRaw(2);
  drawLayout(header, inputField, items)
  let escapeSequence = '';

  while (true) {
    const char = stdin.readAsString(1);

    escapeSequence += char;

    switch (escapeSequence) {
      case keySequences.ArrowUp:
        selection--;
        items = list.map((item, index) => `${index === selection ? '> ' : ''}${item}\n`).join('')
        drawLayout(header, inputField, items)
        escapeSequence = '';
        break;

      case 'j':
      case keySequences.ArrowDown:
        selection++;
        items = list.map((item, index) => `${index === selection ? '> ' : ''}${item}\n`).join('')
        drawLayout(header, inputField, items)
        escapeSequence = '';
        break;

      case keySequences.Enter:
        return list[selection]

      default:
        if (escapeSequence !== keySequences.Escape) escapeSequence = '';
        else {
          const nextChar = stdin.readAsString(1);
          if (nextChar === keySequences.Escape) return null;
          else escapeSequence += nextChar;
        }
    }
  }
}


const selected = filter(['option 1', 'option 2', 'option 3'])
console.log('You selected: ', selected)
