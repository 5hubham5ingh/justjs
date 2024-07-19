import { cursorUp, cursorLeft, cursorNextLine, eraseScreen, clearTerminal } from './helpers/cursor.js';
import { ansi } from './helpers/ansi.js'
import { ttySetRaw } from 'os'
import { in as stdin, out as stdout } from 'std'
import { handleKeysPress, keySequences } from './helpers/terminal.js';

const drawLayout = (header, inputField, item) => {
  //  console.log("\x1b[2J\x1b[H");
  print(clearTerminal)
  const ui = `${header}
${inputField}
${item}`
  print(ui)
}

const filter = (list) => {
  return new Promise((resolve, reject) => {
    let selection;
    const header = "Filter";
    const placeHolder = "Type to search."
    const inputField = placeHolder;
    if (!selection) selection = 0;
    let items = list.map((item, index) => `${index === selection ? '> ' : ''}${item}\n`).join('')

    drawLayout(header, inputField, items)

    const keyPressHandlers = {
      [keySequences.ArrowUp]: () => {
        selection--;
        items = list.map((item, index) => `${index === selection ? '> ' : ''}${item}\n`).join('')
        drawLayout(header, inputField, items)
      },
      [keySequences.ArrowDown]: () => {
        selection++;
        items = list.map((item, index) => `${index === selection ? '> ' : ''}${item}\n`).join('')
        drawLayout(header, inputField, items)
      },
      [keySequences.Enter]: (quit) => {
        quit();
        const selected = list[selection];
        print('You selected: ', selected);
        resolve(selected)
      }
    }

    handleKeysPress(keyPressHandlers)
    reject(null)
  })
}


const selected = await filter(['option 1', 'option 2', 'option 3'])
console.log('Retured from filter: ', selected)
