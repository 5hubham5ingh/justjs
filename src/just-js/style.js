
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

const DEFAULT_STYLE = {
  height: 1,
  align: Align.LEFT,
  width: 0,
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
  if (currStyle.height < 1) currStyle.height = 1;
  let currText;

  switch (currStyle.align) {
    case Align.LEFT:
      currText = text.padEnd(currStyle.width, ' ') // align left
      currText = currText.concat(`\n${' '.repeat(currText.length)}`.repeat(currStyle.height - 1)); // add blank lines below the text
      break;
    case Align.RIGHT:
      currText = text.padStart(currStyle.width, ' ') // align right
      currText = currText.concat(`${' '.repeat(currText.length)}\n`.repeat(currStyle.height - 1)); // add blank lines above the text
      break;
    case Align.CENTER:
      const hGap = Math.floor((currStyle.width - text.length) / 2);
      currText = (' '.repeat(hGap).concat(text)).concat(' '.repeat(hGap)) // add blank spaces left and right of the text
      currText = currText.concat(`\n${' '.repeat(currText.length)}`.repeat(currStyle.height - 1)); // add blank lines below the text
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
  if (currStyle.paddingLeft) currText = ' '.repeat(currStyle.paddingLeft).concat(currText);
  if (currStyle.paddingRight) currText = currText.concat(' '.repeat(currStyle.paddingRight));
  if (currStyle.paddingTop) currText = `${' '.repeat(currStyle.width)}\n`.repeat(currStyle.paddingTop).concat(currText);
  if (currStyle.paddingBottom) currText = currText.concat(`\n${' '.repeat(currStyle.width)}`.repeat(currStyle.paddingBottom));
  return currText;
}

const multiLineText = `┏┳  •  ┏  ┏    
 ┃  ┓  ╋  ╋  ┓┏
┗┛  ┗  ┛  ┛  ┗┫
              ┛`

const styledTest = style(multiLineText, {
  paddingBottom: 0,
  paddingTop: 0,
  paddingRight: 0,
  paddingLeft: 0,
  width: 158,
  height: 1,
  align: Align.BOTTOM
})

//print('lines: ', styledTest.split('\n').length, 'width: ', styledTest.split('\n')[5].length)
print(styledTest)
