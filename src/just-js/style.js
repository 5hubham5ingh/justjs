
import { ansi } from './helpers/ansiStyle.js'

/**
 * Used for {input} and {write} functions
 *
 * @readonly
 * @enum {string}
 */
export const CursorMode = {
  BLINK: 'blink',
  HIDE: 'hide',
  STATIC: 'static',
};

/**
 * Used for {style} and {renderTable} functions
 *
 * @readonly
 * @enum {string}
 */
export const Border = {
  ROUNDED: 'rounded',
  THICK: 'thick',
  NORMAL: 'normal',
  HIDDEN: 'hidden',
  DOUBLE: 'double',
  NONE: 'none',
};

/**
 * Used for {style} and {join} functions
 *
 * @readonly
 * @enum {string}
 */
export const Align = {
  LEFT: 'left',
  RIGHT: 'right',
  CENTER: 'center',
  BOTTOM: 'bottom',
  MIDDLE: 'middle',
  TOP: 'top',
};

const addBorder = (type, text) => {
  let borderX, borderY, cornerUpperRight, cornerUpperLeft, cornerLowerRight, cornerLowerLeft;
  switch (type) {
    case Border.THICK:
      borderX = '━';
      borderY = '┃'
      cornerUpperRight = '┓'
      cornerLowerRight = '┛';
      cornerUpperLeft = '┏';
      cornerLowerLeft = '┗'
      break;

    case Border.DOUBLE:
      borderX = '═';
      borderY = '║';
      cornerUpperRight = '╗';
      cornerLowerRight = '╝'
      cornerUpperLeft = '╔';
      cornerLowerLeft = '╚';
      break;

    case Border.NORMAL:
      borderX = '─';
      borderY = '│';
      cornerUpperRight = '┐';
      cornerLowerRight = '┘';
      cornerUpperLeft = '┌';
      cornerLowerLeft = '└'
      break;

    case Border.ROUNDED:
      borderX = '─';
      borderY = '│';
      cornerUpperRight = '╮';
      cornerLowerRight = '╯';
      cornerUpperLeft = '╭';
      cornerLowerLeft = '╰';
      break;

    case Border.HIDDEN:
      borderX = ' ';
      borderY = ' ';
      cornerUpperRight = ' ';
      cornerLowerRight = ' ';
      cornerUpperLeft = ' ';
      cornerLowerLeft = ' ';
      break;
    default: return text;
  }

  const lines = text.split('\n');
  const noOfLines = lines.length;
  const lineLength = lines[0].length;
  const firstLine = cornerUpperLeft + borderX.repeat(lineLength) + cornerUpperRight + '\n';
  const lastLine = cornerLowerLeft + borderX.repeat(lineLength) + cornerLowerRight;

  const borderedText = [];
  borderedText.push(firstLine);
  for (let line in lines) {
    const borderedLine = `${borderY}${lines[line]}${borderY}\n`;
    borderedText.push(borderedLine);
  }
  borderedText.push(lastLine);

  return borderedText.join('');

}

const getLineLength = text => text.split('\n').reduce((length, line) => line.length > length ? line.length : length, 0);

const DEFAULT_STYLE = {
  align: Align.LEFT,
  marginTop: 0,
  marginLeft: 0,
  marginBottom: 0,
  marginRight: 0,
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 0,
  paddingBottom: 0,
  bold: false,
  italic: false,
  strikethrough: false,
  underline: false,
  faint: false,
  border: Border.NONE
}

/**
 * Apply coloring, borders, spacing to text
 *
 * > Just style ...
 *
 * @param {string|string[]} text - text to style
 * @param {object} [opt] - options
 * @param {string|number} [opt.background] - background color ($BACKGROUND)
 * @param {string|number} [opt.foreground] - foreground color ($FOREGROUND)
 * @param {Border} [opt.border="none"] - border style (default = Border.NONE) ($BORDER)
 * @param {string|number} [opt.borderBackground] - border background color ($BORDER_BACKGROUND)
 * @param {string|number} [opt.borderForeground] - border foreground color ($BORDER_FOREGROUND)
 * @param {Align} [opt.align=left] - text alignment (default = Align.LEFT) ($ALIGN)
 * @param {number} [opt.height=1] - text height (default = 1) ($HEIGHT)
 * @param {number} [opt.width=0] - text width (default = 0, automatic width) ($WIDTH)
 * @param {number} [opt.marginLeft=0] - top margin (default = 0) ($MARGIN_LEFT)
 * @param {number} [opt.marginRight=0] - right margin (default = 0) ($MARGIN_RIGHT)
 * @param {number} [opt.marginTop=0] - top margin (default = 0) ($MARGIN_TOP)
 * @param {number} [opt.marginBottom=0] - bottom margin (default = 0) ($MARGIN_BOTTOM)
 * @param {number} [opt.paddingLeft=0] - left padding (default = 0) ($PADDING_LEFT)
 * @param {number} [opt.paddingRight=0] - right padding (default = 0) ($PADDING_RIGHT)
 * @param {number} [opt.paddingTop=0] - top padding (default = 0) ($PADDING_TOP)
 * @param {number} [opt.paddingBottom=0] - bottom padding (default = 0) ($PADDING_BOTTOM)
 * @param {boolean} [opt.bold=false] - bold text (default = false) ($BOLD)
 * @param {boolean} [opt.italic=false] - italicize text (default = false) ($ITALIC)
 * @param {boolean} [opt.strikethrough=false] - strikethrough text (default = false) ($STRIKETHROUGH)
 * @param {boolean} [opt.underline=false] - underline text (default = false) ($UNDERLINE)
 * @param {boolean} [opt.faint=false] - faint text (default = false) ($FAINT)
 *
 * @returns {string}
 */
const style = (text, opt) => {

  const currStyle = { ...DEFAULT_STYLE, ...opt };
  if (currStyle.height < 1) currStyle.height = text.split('\n').length;
  if (currStyle.width < getLineLength(text)) currStyle.width = getLineLength(text)
  print(currStyle.height, currStyle.width, text.split('\n')[0].length)
  let currText;

  switch (currStyle.align) {
    case Align.LEFT:
      currText = text.split('\n').map(line => line.padEnd(currStyle.width, ' ')).join('\n')// align left
      currText = currText.concat(`\n${' '.repeat(currText.length)}`.repeat(currStyle.height - 1)); // add blank lines below the text
      break;
    case Align.RIGHT:
      currText = text.split('\n').map(line => line.padStart(currStyle.width, ' ')).join('\n') // align right
      currText = currText.concat(`${' '.repeat(currText.length)}\n`.repeat(currStyle.height - 1)); // add blank lines above the text
      break;
    case Align.CENTER:
      const hGap = Math.floor((currStyle.width - text.split('\n').reduce((length, line) => line.length > length ? line.length : length, 0)) / 2);
      currText = text.split('\n').map(line => ' '.repeat(hGap).concat(line).concat(' '.repeat(hGap))).join('\n')  // add blank spaces left and right of the text
      currText = currText.concat(`\n${' '.repeat(getLineLength(currText))}`.repeat(currStyle.height - 1)); // add blank lines below the text
      break;
    case Align.BOTTOM:
      currText = text.padEnd(currStyle.width, ' ') // align left
      currText = `${' '.repeat(currText.length)}\n`.repeat(currStyle.height - 1).concat(currText); // add blank lines above the text
      break;
    case Align.MIDDLE:
      const vGap = Math.floor(currStyle.height / 2);
      currText = text.padEnd(currStyle.width, ' ') // align left
      currText = (`${' '.repeat(currText.length)}\n`.repeat(vGap).concat(currText)) // add blank lines above
        .concat(`\n${' '.repeat(currText.length)}`.repeat(vGap)); // add blank lines below
      break;
    case Align.TOP:
      currText = text.padEnd(currStyle.width, ' ') // align left
      currText = currText.concat(`\n${' '.repeat(currText.length)}`.repeat(currStyle.height - 1)); // add blank lines below
      break;
  }
  if (currStyle.paddingLeft) currText = currText.split('\n').map(line => ' '.repeat(currStyle.paddingLeft).concat(line)).join('\n');
  if (currStyle.paddingRight) currText = currText.split('\n').map(line => line.concat(' '.repeat(currStyle.paddingRight))).join('\n');
  if (currStyle.paddingTop) currText = `${' '.repeat(getLineLength(currText))}\n`.repeat(currStyle.paddingTop).concat(currText);
  if (currStyle.paddingBottom) currText = currText.concat(`\n${' '.repeat(currStyle.width)}`.repeat(currStyle.paddingBottom));

  return addBorder(Border.DOUBLE, currText)
  return currText;
}

const multiLineText = `┏┳  •  ┏  ┏    
 ┃  ┓  ╋  ╋  ┓┏
┗┛  ┗  ┛  ┛  ┗┫
              ┛`

const styledTest = style('shubham\nsingh', {
  paddingBottom: 2,
  paddingTop: 2,
  paddingRight: 2,
  paddingLeft: 2,
  width: 10,
  height: 3,
  align: Align.LEFT
})

//print('lines: ', styledTest.split('\n').length, 'width: ', styledTest.split('\n')[5].length)
print(styledTest)
