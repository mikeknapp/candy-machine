import { useThemeMode } from "flowbite-react";
import React from "react";
import tinycolor from "tinycolor2";

export interface TagProps {
  text: string;
  color?: string;
  onClick?: () => void;
  isSelected?: boolean;
}

export const Tag: React.FC<TagProps> = ({
  text,
  onClick = undefined,
  color = null,
  isSelected = false,
}) => {
  const { computedMode } = useThemeMode();
  let inner: React.JSX.Element = <>{text}</>;

  // If the tag has a fill in suffix, like {type}, color that part blue.
  const match = text.match(/{([^}]+)}/);
  if (match) {
    const fillInSuffix = match[0];
    const suffix = text.split(fillInSuffix)[1];
    inner = (
      <>
        <span className="text-blue-700">{fillInSuffix}</span>
        <span>{suffix}</span>
      </>
    );
  }

  const bgColor =
    isSelected && color
      ? computedMode === "dark"
        ? color
        : tinycolor(color).setAlpha(0.3).toRgbString()
      : undefined;

  const textColor = bgColor
    ? tinycolor.mostReadable(bgColor, ["#000", "#fff"])
    : undefined;

  return React.createElement(onClick ? "button" : "div", {
    className: `whitespace-nowrap text-sm rounded-md border-[1px] border-slate-500 dark:border-slate-700 px-[10px] pb-[8px] pt-[5px] drop-shadow-md dark:text-white ${isSelected ? "" : "bg-slate-200 dark:bg-slate-800"}`,
    onClick: onClick,
    style: {
      backgroundColor: bgColor,
      color: textColor,
    },
    children: inner,
  });
};
