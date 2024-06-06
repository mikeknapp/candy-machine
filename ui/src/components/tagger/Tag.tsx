import { useThemeMode } from "flowbite-react";
import React, { useMemo } from "react";
import tinycolor from "tinycolor2";

export interface TagProps {
  text: string;
  color?: string;
  onClick?: () => void;
  isSelected?: boolean;
  isDisabled?: boolean;
}

export const Tag: React.FC<TagProps> = ({
  text,
  onClick = undefined,
  color = null,
  isSelected = false,
  isDisabled = true,
}) => {
  const { computedMode } = useThemeMode();
  const isDarkMode = computedMode === "dark";

  // Find the most readable version of this color for black text.
  const bgColor = useMemo(() => {
    if (!isSelected || !color) {
      return undefined;
    }
    // If the color is already black, don't change it, since that's for the misc category.
    if (color.startsWith("#000")) {
      return color;
    }
    let newColor = tinycolor(color);
    newColor = isDarkMode ? newColor : newColor.setAlpha(0.25);
    let i = 0;
    while (
      i < 20 &&
      tinycolor
        .mostReadable(newColor, ["#000", "#fff"])
        .toHexString()
        .startsWith("#fff")
    ) {
      newColor = newColor.lighten(10);
      i++;
    }
    return newColor.toRgbString();
  }, [color, isDarkMode, isSelected]);

  // In case something goes wrong with background color, ensure the text can be read.
  const textColor = bgColor
    ? tinycolor.mostReadable(bgColor, ["#000", "#fff"])
    : undefined;

  let inner: React.JSX.Element = <>{text}</>;

  // If the tag has a fill in suffix, like {type}, color that part blue.
  const match = text.match(/{([^}]+)}/);
  if (match) {
    const fillInSuffix = match[0];
    const suffix = text.split(fillInSuffix)[1];
    inner = (
      <>
        <span className="text-blue-700 dark:text-teal-400">{fillInSuffix}</span>
        <span>{suffix}</span>
      </>
    );
  }

  return React.createElement(onClick ? "button" : "div", {
    className: `whitespace-nowrap text-sm rounded-md border-[1px] border-slate-500 dark:border-slate-700 px-[10px] pt-[5px] pb-[6px] drop-shadow-md dark:text-white disabled:opacity-50 font-mono ${isSelected ? "" : "bg-slate-200 dark:bg-slate-800"}`,
    onClick: onClick,
    style: {
      backgroundColor: bgColor,
      color: textColor,
    },
    disabled: isDisabled,
    children: inner,
  });
};
