import { cursorUp, cursorLeft, cursorNextLine, scrollDown, eraseScreen, clearTerminal, cursorTo, clearScreen, scrollUp } from './helpers/cursor.js';
import { ansi } from './helpers/ansiStyle.js'
import { ttySetRaw } from 'os'
import { exit, in as stdin, out as stdout } from 'std'
import { handleKeysPress, keySequences } from './helpers/terminal.js';

const log = [];

const drawLayout = (header, inputField, items) => {
  const ui = `\n${header ? header + '\n' : ''}${inputField ? inputField + '\n' : ''}${items.join('\n')}`
  print(clearScreen, cursorTo(0, 0), ui, scrollUp)
}

const applySelectionIndicator = (item, indicator = '•') => {
  if (item.includes(indicator)) return item;
  return item.padStart(item.length + indicator.length, indicator);
};

const removeSelectionIndicator = (item, indicator = '•') => {
  return item.replace(indicator, '');
};

const applySelectionPrefix = (item, selectedPrefix = " ◉ ") => {
  if (item.includes(selectedPrefix)) return item;
  return item.padStart(item.length + selectedPrefix.length, selectedPrefix)
};

const removeSelectionPrefix = (item, selectedPrefix = " ◉ ") => {
  return item.replace(selectedPrefix, '');
};

const applyUnselectionPrefix = (item, unselectedPrefix = " ○ ") => {
  if (item.includes(unselectedPrefix)) return item;
  return item.padStart(item.length + unselectedPrefix.length, unselectedPrefix)
};

const removeUnselectionPrefix = (item, unselectedPrefix = " ○ ") => {
  return item.replace(unselectedPrefix, '')
};

const filterItemFromList = (list, headerText = "Filter", placeHolderText = "Type to filter", style) => {
  return new Promise((resolve) => {
    let selection = 0;
    const header = headerText; // check if exists then apply style accordingly.
    const placeHolder = placeHolderText; // check if exists then applly style accordingly.
    let inputField = placeHolder;
    const selectionBucket = new Set();

    const generateItems = () => list.map((item, index) =>
      index === selection
        ? (applySelectionIndicator(selectionBucket.has(item)
          ? applySelectionPrefix(item)
          : applyUnselectionPrefix(item)))
        : (selectionBucket.has(item)
          ? applySelectionPrefix(item)
          : applyUnselectionPrefix(item))
    );

    let items = generateItems();

    drawLayout(header, inputField, items)

    const generateUpdatedItems = (filter = false) => {
      return items.map((item, index) =>
        index === selection
          ? applySelectionIndicator(item)
          : removeSelectionIndicator(item)
      );
    }

    const selectNext = () => {
      selection = (selection + 1) % items.length;
      items = generateUpdatedItems()
      drawLayout(header, inputField, items)
    };

    const selectPrev = () => {
      selection = (selection - 1 + items.length) % items.length;
      items = generateUpdatedItems()
      drawLayout(header, inputField, items)
    };

    const handleSubmit = (key, quit) => {
      quit();
      const selected = selectionBucket.size === 0
        ? removeSelectionIndicator(removeUnselectionPrefix(removeSelectionPrefix(items[selection])))
        : [...selectionBucket];
      resolve(selected)
    };

    const handleExit = (key, quit) => {
      quit();
      resolve(null);
    };

    const filterListItems = (query) => {
      return list.filter(item => item.match(query))
        .map((filteredItem, index) => selectionBucket.has(filteredItem)
          ? (index === 0 ?
            applySelectionIndicator(applySelectionPrefix(filteredItem))
            : applySelectionPrefix(filteredItem))
          : (index === 0 ?
            applySelectionIndicator(applyUnselectionPrefix(filteredItem))
            : applyUnselectionPrefix(filteredItem))
        );
    }

    const handleInput = (key) => {
      if (!placeHolder) return;
      if (inputField === placeHolder) inputField = '';
      inputField += key;
      items = filterListItems(inputField);
      drawLayout(header, inputField, items)
    }

    const handleBackspace = () => {
      if (inputField === placeHolder) return;
      inputField = inputField.slice(0, inputField.length - 1)
      if (inputField.length === 0) {
        inputField = placeHolder;
        items = generateItems();
      }
      else items = filterListItems(inputField);
      drawLayout(header, inputField, items)
    }

    const markSelected = () => {
      const currItem = removeSelectionIndicator(removeUnselectionPrefix(items[selection]));
      if (!selectionBucket.has(currItem)) {
        selectionBucket.add(currItem);
        items[selection] = applySelectionPrefix(removeUnselectionPrefix(removeSelectionIndicator(items[selection])));
        selectNext();
      }
    }

    const markUnselected = () => {
      const currItem = removeSelectionIndicator(removeSelectionPrefix(items[selection]));
      if (selectionBucket.has(currItem)) {
        selectionBucket.delete(currItem)
        items[selection] = applyUnselectionPrefix(removeSelectionIndicator(removeSelectionPrefix(items[selection])));
        selectNext();
      }
    }

    const keyPressHandlers = {
      [keySequences.ArrowUp]: selectPrev,
      [keySequences.ArrowDown]: selectNext,
      [keySequences.Enter]: handleSubmit,
      [keySequences.smallLetters]: handleInput,
      [keySequences.capitalLetters]: handleInput,
      [keySequences.Escape]: handleExit,
      [keySequences.Backspace]: handleBackspace,
      [keySequences.Tab]: selectNext,
      [keySequences.ShiftTab]: selectPrev,
      '+': markSelected,
      '-': markUnselected
    }

    handleKeysPress(keyPressHandlers)
  })
}

const chooseItemFromList = async (list, headerText, style) => await filterItemFromList(list, headerText, '', style);


const selected = await filterItemFromList(['option a', 'option b', 'option c', 'option d', 'option e', 'option f', 'option shubham', 'option singh'], 'filter', 'Type the query').catch(err => print(err))
//const selected = await chooseItemFromList(['option a', 'option b', 'option c', 'option d', 'option e', 'option f', 'option shubham', 'option singh'], 'Choose one')
console.log('Retured from filter: ', selected, selected.length, '\n first: ', selected[0], '\n last:', selected[selected.length - 1])

console.log(log.join('\n'))

export { filterItemFromList, chooseItemFromList }
