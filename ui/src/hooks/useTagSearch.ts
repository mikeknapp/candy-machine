import { useState } from "react";

export interface UseTagSearch {
  query: string;
  hasFocus: boolean;
  update: (value: string, hasFocus: boolean, exiting?: boolean) => void;
}

export function useTagSearch(): UseTagSearch {
  const [query, setQuery] = useState("");
  const [hasFocus, setHasFocus] = useState(false);
  const [willClearQuerySoon, setWillClearQuerySoon] =
    useState<NodeJS.Timeout | null>(null);

  const update = (value: string, hasFocus: boolean, exiting = false) => {
    if (willClearQuerySoon) {
      clearTimeout(willClearQuerySoon);
      setWillClearQuerySoon(null);
    }
    if (hasFocus || exiting) {
      setQuery(value);
    } else if (query) {
      // The user has left the search box, but we clear the search after a reasonable time.
      // Otherwise it's easy to see only a partial list of tags.
      setWillClearQuerySoon(setTimeout(() => setQuery(""), 5000));
    }
    setHasFocus(hasFocus);
  };

  return { query, hasFocus, update };
}
