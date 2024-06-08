import { useState } from "react";

export interface TagSearchProvider {
  tagQuery: string;
  hasFocus: boolean;
  updateTagSearch: (
    value: string,
    hasFocus: boolean,
    exiting?: boolean,
  ) => void;
}

export function TagSearch(): TagSearchProvider {
  const [tagQuery, setTagQuery] = useState("");
  const [hasFocus, setHasFocus] = useState(false);
  const [willClearQuerySoon, setWillClearQuerySoon] =
    useState<NodeJS.Timeout | null>(null);

  const updateTagSearch = (
    value: string,
    hasFocus: boolean,
    exiting = false,
  ) => {
    if (willClearQuerySoon) {
      clearTimeout(willClearQuerySoon);
      setWillClearQuerySoon(null);
    }
    if (hasFocus || exiting) {
      setTagQuery(value);
    } else if (tagQuery) {
      // The user has left the search box, but we clear the search after a reasonable time.
      // Otherwise it's easy to see only a partial list of tags.
      setWillClearQuerySoon(setTimeout(() => setTagQuery(""), 5000));
    }
    setHasFocus(hasFocus);
  };

  return { tagQuery, hasFocus, updateTagSearch };
}
