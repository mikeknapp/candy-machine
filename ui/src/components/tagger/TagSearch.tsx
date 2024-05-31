import { TextInput, Tooltip } from "flowbite-react";
import React, { useEffect } from "react";
import { FaTimesCircle } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  disableKeyboardShortcutsSelector,
  tagSearchTerm,
} from "../../state/atoms";

export function TagSearch() {
  const ref = React.useRef<HTMLInputElement>(null);
  const [tagSearch, setTagSearch] = useRecoilState(tagSearchTerm);
  const disableShortcuts = useRecoilValue(disableKeyboardShortcutsSelector);

  // Shortcut listener.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (tagSearch !== null) {
          setTagSearch(null);
          ref.current?.blur();
        }
      }
      if (!disableShortcuts && event.key === "f") {
        event.preventDefault();
        setTagSearch("");
        ref.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [disableShortcuts, tagSearch]);

  return (
    <>
      <Tooltip content="Filter tags [f]">
        <TextInput
          ref={ref}
          className="h-full"
          placeholder={tagSearch?.length > 0 ? "Filter Tags" : "Filter"}
          size={tagSearch !== null ? 20 : 3}
          icon={FaMagnifyingGlass}
          rightIcon={() =>
            tagSearch?.length > 0 ? (
              <FaTimesCircle
                className="!cursor-pointer text-gray-500"
                onClick={() => {
                  console.log("here I am!");
                  setTagSearch(null);
                  ref.current?.blur();
                }}
              />
            ) : undefined
          }
          onFocus={() => tagSearch === null && setTagSearch("")}
          onBlur={() => tagSearch?.trim() === "" && setTagSearch(null)}
          onChange={(e) => setTagSearch(e.target.value)}
          value={tagSearch || ""}
        />
      </Tooltip>
    </>
  );
}
