import { DependencyList, useContext, useEffect } from "react";
import { AppContext, TagSearchContext } from "../app";

export interface UseShortcutProps {
  keys: string | string[];
  action: (event: KeyboardEvent) => void;
  deps: DependencyList;
}

export function useShortcut(
  args: UseShortcutProps,
  obeyDisabledShortcuts = true,
) {
  const appContext = useContext(AppContext);
  const { hasFocus: searchHasFocus } = useContext(TagSearchContext);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      const isCorrectKey = Array.isArray(args.keys)
        ? args.keys.includes(event.key)
        : args.keys === event.key;

      const keyboardShortcutsEnabled = !(
        obeyDisabledShortcuts &&
        (searchHasFocus || appContext.disableKeyboardShortcuts)
      );

      if (isCorrectKey && keyboardShortcutsEnabled) {
        args.action(event);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [appContext.disableKeyboardShortcuts, searchHasFocus, ...args.deps]);
}
