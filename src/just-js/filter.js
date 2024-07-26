import { cursorUp, cursorLeft, cursorNextLine, scrollDown, eraseScreen, clearTerminal, cursorTo, clearScreen, scrollUp } from './helpers/cursor.js';
import { ansi } from './helpers/ansiStyle.js'
import { ttySetRaw } from 'os'
import { exit, in as stdin, out as stdout } from 'std'
import { handleKeysPress, keySequences } from './helpers/terminal.js';

const log = [];

const drawLayout = (prompt, header, inputField, items) => {
  const ui = `\n${header ? header + '\n' : ''}${inputField ? (prompt ?? '') + inputField + '\n' : ''}${items.join('\n')}`
  print(clearScreen, cursorTo(0, 0), ui, scrollUp)
}

let indicator = '•';
let selectedPrefix = " ◉ ";
let unselectedPrefix = " ○ ";
const applySelectionIndicator = item => {
  if (item.includes(indicator)) return item;
  return item.padStart(item.length + indicator.length, indicator);
};

const removeSelectionIndicator = item => {
  return item.replace(indicator, '')
};

const applySelectionPrefix = item => {
  if (item.includes(selectedPrefix)) return item;
  return item.padStart(item.length + selectedPrefix.length, selectedPrefix)
};

const removeSelectionPrefix = item => {
  return item.replace(selectedPrefix, '');
};

const applyUnselectionPrefix = item => {
  if (item.includes(unselectedPrefix)) return item;
  return item.padStart(item.length + unselectedPrefix.length, unselectedPrefix)
};

const removeUnselectionPrefix = item => {
  return item.replace(unselectedPrefix, '')
};


/**
 * Choose multiple items by filtering a list (press + and - to select and unselect an item respectively, Enter to confirm)
 *
 * > just filter --no-limit ...
 *
 * @template [T=string]
 * @param {ListItem<T>[]|string[]} list - list to choose from
 * @param {object} [opt] - options
 * @param {string} [opt.headerText="Search"] - header value
 * @param {string} [opt.placeholderText="Filter..."] - placeholder value (default = "Filter...")
 * @param {number} [opt.width=COLUMNS] - width of the list (default = terminal width)
 * @param {number} [opt.height] - height of the list (no limit by default, will depend on the terminal)
 * @param {string} [opt.prompt="> "] - prompt to display (default = "> ")
 * @param {string} [opt.value] - initial filter value
 * @param {number} [opt.limit] - maximum number of items to select (no limit by default)
 * @param {boolean} [opt.regEx=true] - enable regular expression based search (default = true)
 * @param {boolean} [opt.reverse=false] - display from the bottom of the screen (default = false)
 * @param {string} [opt.indicator="•"] - character for selection (default = "•")
 * @param {string} [opt.selectedPrefix=" ◉ "] - character to indicate selected items (default = " ◉ ")
 * @param {string} [opt.unselectedPrefix=" ○ "] - character to indicate selected items (default = " ○ ")
 * @param {CustomOptions} [opt.custom]
 *
 * @returns {ListItem<T>[]|undefined}
 */
const filterItemsFromList = (list, opt) => {
  return new Promise((resolve) => {
    let selection = 0;
    const header = opt?.headerText ?? "Search";
    const placeHolder = opt?.placeholderText ?? "Filter...";
    const prompt = opt?.prompt ?? '> ';
    let inputField = placeHolder;
    const selectionBucket = new Set();

    const filterListItems = (query) => {
      return list.filter(item => item.match(query))
        .map((filteredItem, index) => {
          filteredItem = selectionBucket.has(filteredItem)
            ? applySelectionPrefix(filteredItem)
            : applyUnselectionPrefix(filteredItem);
          filteredItem = index === 0
            ? applySelectionIndicator(filteredItem)
            : removeSelectionIndicator(filteredItem);
          return filteredItem;
        }
        );
    }

    let items = filterListItems(opt?.value ?? '.*');
    drawLayout(prompt, header, inputField, items)

    const generateUpdatedItems = () => items.map((item, index) =>
      index === selection
        ? applySelectionIndicator(item)
        : removeSelectionIndicator(item)
    );


    const selectNext = () => {
      selection = (selection + 1) % items.length;
      items = generateUpdatedItems()
      drawLayout(prompt, header, inputField, items)
    };

    const selectPrev = () => {
      selection = (selection - 1 + items.length) % items.length;
      items = generateUpdatedItems()
      drawLayout(prompt, header, inputField, items)
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

    const handleInput = (char) => {
      if (!placeHolder) return;
      if (inputField === placeHolder) inputField = '';
      inputField += char;
      items = filterListItems(inputField);
      selection = 0;
      drawLayout(prompt, header, inputField, items)
    }

    const handleBackspace = () => {
      if (inputField === placeHolder) return;
      inputField = inputField.slice(0, inputField.length - 1)
      if (inputField.length === 0) {
        inputField = placeHolder;
        items = filterListItems('.*')
      }
      else items = filterListItems(inputField);
      selection = 0;
      drawLayout(prompt, header, inputField, items)
    }

    const markSelected = () => {
      if (opt?.limit >= selectionBucket.size) return;
      const currItem = removeSelectionIndicator(removeSelectionPrefix(removeUnselectionPrefix(items[selection])));
      if (!selectionBucket.has(currItem)) {
        selectionBucket.add(currItem);
        items[selection] = applySelectionPrefix(removeUnselectionPrefix(removeSelectionIndicator(items[selection])));
        selectNext();
      }
    }

    const markUnselected = () => {
      const currItem = removeSelectionIndicator(removeUnselectionPrefix(removeSelectionPrefix(items[selection])));
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

const chooseItemFromList = async (list, headerText, style) => await filterItemsFromList(list, headerText, '', style);


const list = ['option a', 'option b', 'option c', 'option d', 'option e', 'option f', 'option shubham', 'option singh', 'apple', 'cider', 'vinegar', 'jasmin', 'yasmin', 'chocolate', 'tailsman', 'chest', 'tresure', 'wonderous', 'conundrum', 'aphoshtate'];
const options = {
  headerText: 'Filter',
  placeholderText: 'Type to search...',
  value: '.*'
}
const selected = await filterItemsFromList(list, options).catch(err => print(err))
//const selected = await chooseItemFromList(['option a', 'option b', 'option c', 'option d', 'option e', 'option f', 'option shubham', 'option singh'], 'Choose one')
console.log('Retured from filter: ', selected, selected.length, '\n first: ', selected[0], '\n last:', selected[selected.length - 1])

console.log(log.join('\n'))

export { filterItemsFromList, chooseItemFromList }
