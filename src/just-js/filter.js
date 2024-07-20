import { cursorUp, cursorLeft, cursorNextLine, scrollDown, eraseScreen, clearTerminal, cursorTo, clearScreen, scrollUp } from './helpers/cursor.js';
import { ansi } from './helpers/ansiStyle.js'
import { ttySetRaw } from 'os'
import { exit, in as stdin, out as stdout } from 'std'
import { handleKeysPress, keySequences } from './helpers/terminal.js';

const drawLayout = (header, inputField, item) => {
  const ui = `\n${header ? header + '\n' : ''}${inputField ? inputField + '\n' : ''}${item.join('')}`
  print(clearScreen, cursorTo(0, 0), ui, scrollUp)
}

const filterItemFromList = (list, headerText = "Filter", placeHolderText = "Type to filter", style) => {
  return new Promise((resolve) => {
    let selection = 0;
    const header = headerText; // check if exists then apply style accordingly.
    const placeHolder = placeHolderText; // check if exists then applly style accordingly.
    let inputField = placeHolder;

    let items = list.map((item, index) => `${index === selection ? '> ' : ''}${item}\n`)

    drawLayout(header, inputField, items)

    const generateItems = (filter = false) => {
      if (!filter)
        return list.map((item, index) => `${index === selection ? '> ' : ''}${item}\n`);

      const filteredList = list
        .filter(item => (inputField !== placeHolder && inputField !== '') ? item.match(inputField) : true);

      if (filteredList.length !== list.length) {
        selection = list.indexOf(filteredList[0]);
        return filteredList.map((item, index) => `${index === 0 ? '> ' : ''}${item}\n`)
      }
      return filteredList.map((item, index) => `${index === selection ? '> ' : ''}${item}\n`);
    }

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

    const handleSelection = (key, quit) => {
      quit();
      const selected = list[selection];
      resolve(selected)
    };

    const handleExit = (key, quit) => {
      quit();
      resolve(null);
    };

    const handleInput = (key) => {
      // return if placeHolder is given as no filter is possible
      if (!placeHolder) return;

      // initialize inputField to blank
      if (inputField === placeHolder) inputField = '';

      // update input field
      if (key === keySequences.Backspace) {
        if (inputField.length) inputField = inputField.slice(0, inputField.length - 1);
        if (!inputField.length) {
          selection = 0;
          placeHolder && (inputField = placeHolder)
        }
      }
      else
        inputField += key;
      items = generateItems(true);
      drawLayout(header, inputField, items)
    }

    const handleVimMotions = (key) => {
      switch (key) {
        case 'J': selectNext();
          break;
        case 'K': selectPrev();
          break;
        default:
      }
    }

    const keyPressHandlers = {
      [keySequences.ArrowUp]: selectPrev,
      [keySequences.ArrowDown]: selectNext,
      [keySequences.Enter]: handleSelection,
      [keySequences.smallLetters]: handleInput,
      [keySequences.capitalLetters]: handleVimMotions,
      [keySequences.Escape]: handleExit,
      [keySequences.Backspace]: handleInput
    }

    handleKeysPress(keyPressHandlers)
  })
}

const chooseItemFromList = async (list, headerText, style) => await filterItemFromList(list, headerText, '', style);


//const selected = await filterItemFromList(['option a', 'option b', 'option c', 'option d', 'option e', 'option f', 'option shubham', 'option singh'], 'filter', 'Type the query')
const selected = await chooseItemFromList(['option a', 'option b', 'option c', 'option d', 'option e', 'option f', 'option shubham', 'option singh'], 'Choose one')
console.log('Retured from filter: ', selected)


export { filterItemFromList, chooseItemFromList }
