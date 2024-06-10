import { DependencyList, useContext, useEffect } from "react";
import { AppContext, TagSearchContext } from "../app";

export interface UseShortcutProps {
  description?: string; // Adds the shortcut to the '?' modal.
  keys: string | string[];
  onKeyDown: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
  deps: DependencyList;
}

export interface ShortcutInfo {
  description: string;
  keys: string[];
}

export function useShortcut(
  args: UseShortcutProps,
  obeyDisabledShortcuts = true,
) {
  const appContext = useContext(AppContext);
  const { hasFocus: searchHasFocus } = useContext(TagSearchContext);

  // Register the shortcut with the app.
  if (args.description && !appContext.hasShortcut(args.description)) {
    appContext.registerShortcut({
      description: args.description,
      keys: Array.isArray(args.keys) ? args.keys : [args.keys],
    });
  }

  useEffect(() => {
    const onKeyDownCallback = (event: KeyboardEvent) => {
      const isCorrectKey = Array.isArray(args.keys)
        ? args.keys.includes(event.key)
        : args.keys === event.key;

      const keyboardShortcutsEnabled = !(
        obeyDisabledShortcuts &&
        (searchHasFocus || appContext.disableKeyboardShortcuts)
      );

      if (isCorrectKey && keyboardShortcutsEnabled) {
        args.onKeyDown(event);
      }
    };
    window.addEventListener("keydown", onKeyDownCallback);

    const onKeyUpCallback = (event: KeyboardEvent) =>
      args.onKeyUp && args.onKeyUp(event);
    window.addEventListener("keyup", onKeyUpCallback);

    return () => {
      window.removeEventListener("keydown", onKeyDownCallback);
      if (args.onKeyUp) {
        window.removeEventListener("keyup", onKeyUpCallback);
      }
    };
  }, [appContext.disableKeyboardShortcuts, searchHasFocus, ...args.deps]);
}
