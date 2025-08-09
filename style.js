import { ansi } from "./ansiStyle.js";

/**
 * Used for {input} and {write} functions
 *
 * @readonly
 * @enum {string}
 */
export const CursorMode = {
  BLINK: "blink",
  HIDE: "hide",
  STATIC: "static",
};

/**
 * Used for {style} and {renderTable} functions
 *
 * @readonly
 * @enum {string}
 */
export const Border = {
  ROUNDED: "rounded",
  THICK: "thick",
  NORMAL: "normal",
  HIDDEN: "hidden",
  DOUBLE: "double",
  NONE: "none",
};

/**
 * Used for {style} and {join} functions
 *
 * @readonly
 * @enum {string}
 */
export const Align = {
  LEFT: "left",
  RIGHT: "right",
  CENTER: "center",
  BOTTOM: "bottom",
  MIDDLE: "middle",
  TOP: "top",
};

const getLineLength = (text) =>
  ansi.stripStyle({ text }).split("\n").reduce(
    (length, line) => line.length > length ? line.length : length,
    0,
  );

const addBorder = (type, text) => {
  let borderX,
    borderY,
    cornerUpperRight,
    cornerUpperLeft,
    cornerLowerRight,
    cornerLowerLeft;
  switch (type) {
    case Border.THICK:
      borderX = "━";
      borderY = "┃";
      cornerUpperRight = "┓";
      cornerLowerRight = "┛";
      cornerUpperLeft = "┏";
      cornerLowerLeft = "┗";
      break;

    case Border.DOUBLE:
      borderX = "═";
      borderY = "║";
      cornerUpperRight = "╗";
      cornerLowerRight = "╝";
      cornerUpperLeft = "╔";
      cornerLowerLeft = "╚";
      break;

    case Border.NORMAL:
      borderX = "─";
      borderY = "│";
      cornerUpperRight = "┐";
      cornerLowerRight = "┘";
      cornerUpperLeft = "┌";
      cornerLowerLeft = "└";
      break;

    case Border.ROUNDED:
      borderX = "─";
      borderY = "│";
      cornerUpperRight = "╮";
      cornerLowerRight = "╯";
      cornerUpperLeft = "╭";
      cornerLowerLeft = "╰";
      break;

    case Border.HIDDEN:
      borderX = " ";
      borderY = " ";
      cornerUpperRight = " ";
      cornerLowerRight = " ";
      cornerUpperLeft = " ";
      cornerLowerLeft = " ";
      break;
    default:
      return text;
  }

  const lines = text.split("\n");
  const lineLength = getLineLength(text);
  const firstLine = cornerUpperLeft + borderX.repeat(lineLength) +
    cornerUpperRight + "\n";
  const lastLine = cornerLowerLeft + borderX.repeat(lineLength) +
    cornerLowerRight;

  const borderedText = [];
  borderedText.push(firstLine);
  for (let line in lines) {
    const borderedLine = `${borderY}${lines[line]}${borderY}\n`;
    borderedText.push(borderedLine);
  }
  borderedText.push(lastLine);

  return borderedText.join("");
};

const addMargin = (text, left = 0, right = 0, bottom = 0, up = 0) => {
  const xPaddedText = text.split("\n").map((line) =>
    " ".repeat(left).concat(line).concat(" ".repeat(right))
  ).join("\n");
  const length = getLineLength(xPaddedText);
  const xyPaddedText = `${" ".repeat(length)}\n`.repeat(up).concat(xPaddedText)
    .concat(
      `\n${" ".repeat(length)}`.repeat(bottom),
    );
  return xyPaddedText;
};

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
  border: Border.NONE,
};

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
export const style = (text, opt) => {
  const currStyle = { ...DEFAULT_STYLE, ...opt };
  if (currStyle.height < 1) currStyle.height = text.split("\n").length;
  if (currStyle.width < getLineLength(text)) {
    currStyle.width = getLineLength(text);
  }

  let currText;
  let currTextHeight;
  switch (currStyle.align) {
    case Align.LEFT:
      currText = text.split("\n").map((line) =>
        (opt.foreground ?? "").concat(opt.background ?? "") //aplly colours
          .concat(
            line.padEnd(currStyle.width, " "), // align left
            opt.background || opt.foreground ? ansi.style.reset : "",
          ) // reset colours
      ).join("\n");
      currTextHeight = currText.split("\n").length;
      currText = currText.concat(
        `\n${opt.background ?? ""}${" ".repeat(currStyle.width)}${opt.background ? ansi.style.reset : ""
          }` // apply background colour
          .repeat(currStyle.height - currTextHeight),
      ); // add blank lines below the text to attain the opt.height
      break;
    case Align.RIGHT:
      currText = text.split("\n").map((line) =>
        (opt.foreground ?? "").concat(opt.background ?? "") //apply colours
          .concat(
            line.padStart(currStyle.width, " "), // align right
            opt.background || opt.foreground ? ansi.style.reset : "",
          ) // aplly colours
      ).join("\n");
      currTextHeight = currText.split("\n").length;
      currText = currText.concat(
        `\n${opt.background ?? ""}${" ".repeat(currStyle.width)}${opt.background ? ansi.style.reset : ""
          }` // apply background colour
          .repeat(currStyle.height - currTextHeight),
      ); // add blank lines below the text
      break;
    case Align.CENTER:
      const hGap = Math.floor(
        (currStyle.width -
          text.split("\n").reduce(
            (length, line) => line.length > length ? line.length : length,
            0,
          )) / 2,
      );

      currText = text.split("\n").map((line) =>
        `${opt.foreground ?? ""}${opt.background ?? ""}` // add colour to text
          .concat(
            " ".repeat(hGap),
            line,
            " ".repeat(hGap), // add blank spaces left and right of the text
            opt.foreground || opt.background ? ansi.style.reset : "",
          )
      ) // reset colour
        .join("\n");

      // # Add blank lines below the text to align it to the top of the container
      currText = currText.concat(`\n${(opt.background ?? "") // add background colour to blank lines
        .concat(" ", opt.background ? ansi.style.reset : "")
        .repeat(getLineLength(currText))
        }` // blank line with length equal to the text line
        .repeat(currStyle.height - currText.split("\n").length)); // add blank lines below the text
      break;
    case Align.BOTTOM:
      currText = text.split("\n").map((line) =>
        (opt.foreground ?? "").concat(opt.background ?? "") //aplly colours
          .concat(
            line.padEnd(currStyle.width, " "), // align left
            opt.background || opt.foreground ? ansi.style.reset : "",
          ) // reset colours
      ).join("\n");

      currText = `${opt.background ?? ""}${" ".repeat(currStyle.width)}${opt.background ? ansi.style.reset : ""
        }\n`.repeat(currStyle.height - currText.split("\n").length).concat(
          currText,
        ); // add blank lines above the text
      break;
    case Align.MIDDLE:
      const vGap = Math.floor(
        (currStyle.height / 2) - (text.split("\n").length / 2),
      );
      currText = text.split("\n").map((line) =>
        `${opt.foreground ?? ""}${opt.background ?? ""}`.concat(
          line.padEnd(currStyle.width, " "),
          opt.background || opt.foreground ? ansi.style.reset : "",
        )
      ).join("\n"); // align left

      currText = `${opt.background ?? ""}${" ".repeat(currStyle.width)}${opt.background ? ansi.style.reset : ""
        }\n` // blank lines above
        .repeat(vGap).concat(
          currText, // text lines
          `\n${opt.background ?? ""}${" ".repeat(currStyle.width)}${opt.background ? ansi.style.reset : ""
            }`
            .repeat(vGap), // add blank lines below
        );
      break;
    case Align.TOP:
      currText = text.split("\n").map((line) =>
        line.padEnd(currStyle.width, " ")
      ).join("\n"); // align left
      currText = currText.concat(
        `\n${" ".repeat(currStyle.width)}`.repeat(
          currStyle.height - currText.split("\n").length,
        ),
      ); // add blank lines below
      break;
  }

  if (currStyle.paddingLeft) {
    currText = currText.split("\n").map((line) =>
      " ".repeat(currStyle.paddingLeft).concat(line)
    ).join("\n");
  }
  if (currStyle.paddingRight) {
    currText = currText.split("\n").map((line) =>
      line.concat(" ".repeat(currStyle.paddingRight))
    ).join("\n");
  }
  if (currStyle.paddingTop) {
    currText = `${" ".repeat(getLineLength(currText))}\n`.repeat(
      currStyle.paddingTop,
    ).concat(currText);
  }
  if (currStyle.paddingBottom) {
    currText = currText.concat(
      `\n${" ".repeat(getLineLength(currText))}`.repeat(
        currStyle.paddingBottom,
      ),
    );
  }

  if (opt.border) {
    currText = addBorder(opt.border, currText);
  }
  return addMargin(
    currText,
    opt.marginLeft,
    opt.marginRight,
    opt.marginBottom,
    opt.marginTop,
  );
};

const getBorders = (borderType) => {
  let borderX,
    borderY,
    cornerUpperRight,
    cornerUpperLeft,
    cornerLowerRight,
    cornerLowerLeft;
  switch (borderType) {
    case Border.THICK:
      borderX = "━";
      borderY = "┃";
      cornerUpperRight = "┓";
      cornerLowerRight = "┛";
      cornerUpperLeft = "┏";
      cornerLowerLeft = "┗";
      break;

    case Border.DOUBLE:
      borderX = "═";
      borderY = "║";
      cornerUpperRight = "╗";
      cornerLowerRight = "╝";
      cornerUpperLeft = "╔";
      cornerLowerLeft = "╚";
      break;

    case Border.NORMAL:
      borderX = "─";
      borderY = "│";
      cornerUpperRight = "┐";
      cornerLowerRight = "┘";
      cornerUpperLeft = "┌";
      cornerLowerLeft = "└";
      break;

    case Border.ROUNDED:
      borderX = "─";
      borderY = "│";
      cornerUpperRight = "╮";
      cornerLowerRight = "╯";
      cornerUpperLeft = "╭";
      cornerLowerLeft = "╰";
      break;

    case Border.HIDDEN:
      borderX = " ";
      borderY = " ";
      cornerUpperRight = " ";
      cornerLowerRight = " ";
      cornerUpperLeft = " ";
      cornerLowerLeft = " ";
      break;
    default:
      return text;
  }

  return {
    borderX,
    borderY,
    cornerLowerLeft,
    cornerUpperLeft,
    cornerLowerRight,
    cornerUpperRight,
  };
};

export const style2 = (text, options) => {
  const opt = { ...DEFAULT_STYLE, ...options };
  opt.width = (() => {
    const currentWidth = opt.width - getLineLength(text) + opt.marginRight +
      opt.marginLeft + opt.paddingRight + opt.paddingLeft + 2;
    const diff = opt.width - currentWidth;
    if (diff > 0) return opt.width - diff + 1;
    return Math.abs(currentWidth);
  })();
  const {
    borderX,
    borderY,
    cornerUpperRight,
    cornerUpperLeft,
    cornerLowerRight,
    cornerLowerLeft,
  } = getBorders(opt.border);
  const marginLeft = " ".repeat(opt.marginLeft);
  const marginRight = " ".repeat(opt.marginRight);
  const styledLeft = `${marginLeft}${borderY}${" ".repeat(opt.paddingLeft)}`;
  const styledRight = `${" ".repeat(opt.paddingRight)}${borderY}${marginRight}`;
  const hGapCount = opt.width - getLineLength(text) >= 0
    ? opt.width - getLineLength(text)
    : 0;
  const hAlignmentGap = " ".repeat(hGapCount);
  const alignRight = opt.align === Align.RIGHT ? hAlignmentGap : "";
  const alignLeft = opt.align === Align.LEFT ||
    (opt.align !== Align.RIGHT && opt.align !== Align.CENTER)
    ? hAlignmentGap
    : "";
  const alignCenter = opt.align === Align.CENTER
    ? " ".repeat(hGapCount / 2)
    : "";

  const styledText = text.split("\n").map((line) =>
    `${styledLeft}${alignRight}${alignCenter}${line}${alignCenter}${alignLeft}${styledRight}\n`
  ).join("");

  const lineLength = getLineLength(styledText);
  const lineLengthWithoutBorder = lineLength - opt.marginLeft -
    opt.marginRight - (opt.border === Border.NONE ? 0 : 2);
  const blankLineWithBorder = `${marginLeft}${borderY}${" ".repeat(lineLengthWithoutBorder)
    }${borderY}${marginRight}`;

  const noOfLines = styledText.split("\n").length;

  const topAlignmentGap = opt.align === Align.TOP ||
    (opt.align !== Align.BOTTOM && opt.align !== Align.MIDDLE)
    ? "\n".concat(blankLineWithBorder).repeat(opt.height - noOfLines)
    : "";
  const bottomAlignmentGap = opt.align === Align.BOTTOM
    ? blankLineWithBorder.concat("\n").repeat(opt.height - noOfLines)
    : "";
  const middleAlignmentGap = opt.align === Align.MIDDLE
    ? blankLineWithBorder.concat("\n").repeat((opt.height - noOfLines) / 2)
    : "";

  const borderH = borderX.repeat(lineLengthWithoutBorder);
  const marginTop = opt.marginTop
    ? " ".repeat(lineLength).concat("\n").repeat(opt.marginTop)
    : "";
  const topBorder =
    `${marginLeft}${cornerUpperLeft}${borderH}${cornerUpperRight}${marginRight}\n`;
  const paddingTop = opt.paddingTop
    ? blankLineWithBorder.concat("\n").repeat(opt.paddingTop)
    : "";
  const styledTop =
    `${marginTop}${topBorder}${paddingTop}${bottomAlignmentGap}${middleAlignmentGap}`;

  const marginBottom = opt.marginBottom
    ? "\n".concat(" ".repeat(lineLength)).repeat(opt.marginBottom)
    : "";
  const bottomBorder =
    `\n${marginLeft}${cornerLowerLeft}${borderH}${cornerLowerRight}${marginRight}`;
  const paddingBottom = opt.paddingBottom
    ? "\n".concat(blankLineWithBorder).repeat(opt.paddingBottom)
    : "";
  const styledBotom =
    `${middleAlignmentGap}${topAlignmentGap}${paddingBottom}${bottomBorder}${marginBottom}`;

  const result = `${styledTop}${styledText}${styledBotom}`;

  return result.split("\n").filter((line) => line).join("\n"); //remove duplicate \n
};

const multiLineText = `┏┳  •  ┏  ┏    
 ┃  ┓  ╋  ╋  ┓┏
┗┛  ┗  ┛  ┛  ┗┫
              ┛`;
const ddName = `shubham
singh  `;
const styledTest = style(multiLineText, {
  paddingBottom: 2,
  paddingTop: 2,
  paddingRight: 2,
  paddingLeft: 2,
  width: 25,
  height: 10,
  align: Align.CENTER,
  border: Border.ROUNDED,
  marginTop: 1,
  marginBottom: 1,
  marginLeft: 1,
  foreground: ansi.style.red,
  background: ansi.style["bg-blue"],
});

// print('lines: ', styledTest.split('\n').length, 'width: ', styledTest.split('\n')[5].length)
// print(styledTest, getLineLength(styledTest));
// print((ansi.style.red ?? '').concat(ansi.style['bg-cyan'] ?? '').concat(multiLineText).concat(ansi.style.reset))
