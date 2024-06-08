import { TextInput } from "flowbite-react";
import React, { useContext, useRef } from "react";
import { FaTimesCircle } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { TagSearchContext } from "../../app";
import { useShortcut } from "../../hooks/useShortcut";

export function TagSearch() {
  const ref = useRef<HTMLInputElement>(null);
  const { tagQuery, hasFocus, updateTagSearch } = useContext(TagSearchContext);

  const exitAndClearQuery = () => {
    setTimeout(() => {
      updateTagSearch("", false, true);
    }, 0);
    ref.current?.blur();
  };

  useShortcut({
    description: "Find Tag",
    keys: "f",
    onKeyDown: () => {
      if (!tagQuery) {
        updateTagSearch("", true);
        setTimeout(() => ref.current?.focus(), 200);
      }
    },
    deps: [tagQuery],
  });

  useShortcut(
    {
      // Clear the search bar on "Escape".
      keys: "Escape",
      onKeyDown: (e) => {
        if (hasFocus) {
          e.preventDefault();
          exitAndClearQuery();
        }
      },
      deps: [hasFocus],
    },
    false,
  );

  return (
    <>
      <div
        className={`transform transition-all duration-300 ${hasFocus ? "w-[200px]" : "w-[140px]"}`}
      >
        <TextInput
          ref={ref}
          key="tag-search"
          className="h-full w-full"
          placeholder={hasFocus ? "" : "Find Tag"}
          size={20}
          icon={FaMagnifyingGlass}
          rightIcon={() =>
            hasFocus ? (
              <FaTimesCircle
                className="!cursor-pointer text-gray-500"
                onClick={() => exitAndClearQuery()}
              />
            ) : undefined
          }
          onFocus={() => updateTagSearch(tagQuery, true)}
          onBlur={() => setTimeout(() => updateTagSearch(tagQuery, false), 500)}
          onChange={(e) => updateTagSearch(e.target.value, true)}
          value={tagQuery}
        />
      </div>
    </>
  );
}
