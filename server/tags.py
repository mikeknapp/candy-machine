def common_suffixes(tags: dict[str, int]) -> dict[str, int]:
    # Build a list of common suffixes.
    # These can be a single word or multiple words. Therefore, we need to look at ngrams.
    # Example 1: "red head scarf", "blue head scarf", "yellow head scarf" -> "head scarf"
    # Example 2: "wide angle", "closeup angle" -> "angle"

    suffixes = {}
    for tag in tags.keys():
        words = tag.split(" ")
        for i in range(1, len(words)):
            suffix = " ".join(words[i:])
            suffixes[suffix] = suffixes.get(suffix, 0) + 1

    # If a suffix is already contained in a longer suffix, remove it.
    suffixes_copy = suffixes.copy()
    for suffix, s_count in suffixes_copy.items():
        for other_suffix, os_count in suffixes_copy.items():
            if (
                len(suffix) < len(other_suffix)
                and suffix in other_suffix
                and s_count <= os_count
            ):
                del suffixes[suffix]
                break

    # Remove any that have count < 2
    suffixes = {k: v for k, v in suffixes.items() if v >= 2}

    return suffixes
