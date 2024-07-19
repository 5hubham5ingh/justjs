import { cursorUp, cursorLeft, cursorNextLine, scrollDown, eraseScreen, clearTerminal, cursorTo, clearScreen, scrollUp } from './helpers/cursor.js';
import { ansi } from './helpers/ansiStyle.js'
import { ttySetRaw } from 'os'
import { in as stdin, out as stdout } from 'std'
import { handleKeysPress, keySequences } from './helpers/terminal.js';

const drawLayout = (header, inputField, item) => {
  const ui = `\n${header ? header + '\n' : ''}${inputField ? inputField + '\n' : ''}${item}`
  print(clearScreen, cursorTo(0, 0), ui, scrollUp)
}

const Filter = (list, headerText, placeHolderText, style) => {
  return new Promise((resolve) => {
    let selection = 0;
    const header = (headerText !== '' && headerText) ? headerText : ''
    const placeHolder = (placeHolderText !== '' && placeHolderText) ? placeHolderText : ''
    const inputField = placeHolder;

    let items = list.map((item, index) => `${index === selection ? '> ' : ''}${item}\n`).join('')

    drawLayout(header, inputField, items)

    const generateItems = () => list.map((item, index) => `${index === selection ? '> ' : ''}${item}\n`).join('');

    const selectNext = () => {
      selection = (selection + 1) % list.length;
      items = generateItems()
      drawLayout(header, inputField, items)
    };

    const selectPrev = () => {
      selection = (selection - 1 + list.length) % list.length;
      items = generateItems()
      drawLayout(header, inputField, items)
    };

    const handleSelection = (quit) => {
      quit();
      const selected = list[selection];
      resolve(selected)
    };

    const handleExit = (quit) => {
      quit();
      resolve(null);
    }

    const keyPressHandlers = {
      [keySequences.ArrowUp]: selectPrev,
      [keySequences.ArrowDown]: selectNext,
      [keySequences.Enter]: handleSelection,
      [keySequences.Escape]: handleExit
    }

    handleKeysPress(keyPressHandlers)
  })
}


const selected = await Filter(['option 1', 'option 2', 'option 3'])
console.log('Retured from filter: ', selected)
