import csv
import os

import requests

DATA_SOURCE = "https://huggingface.co/SmilingWolf/wd-v1-4-convnextv2-tagger-v2/raw/main/selected_tags.csv"

MIN_EXPECTED_TAGS = 7000

TAGS_CACHE = os.path.join(os.path.dirname(__file__), "tags.csv")

TAGS: dict[str, int] = {}


def fetch_auto_complete_tags():
    data = requests.get(DATA_SOURCE).text.split("\n")
    assert (
        len(data) > MIN_EXPECTED_TAGS
    ), "Too few tags found, perhaps the file has moved?"

    with open(TAGS_CACHE, "w", newline="") as output:
        csv_reader = csv.DictReader(data)
        rows = list(csv_reader)

        # Sort the tags by count
        rows.sort(key=lambda x: int(x["count"]), reverse=True)

        # Write the tags to a new csv file
        csv_writer = csv.writer(
            output,
            delimiter=",",
            quotechar='"',
            quoting=csv.QUOTE_MINIMAL,
        )
        for row in rows:
            t = row["name"].replace("_", " ").strip().lower()
            c = int(row["count"].strip())

            no_alpha_chars = not any(char.isalpha() for char in t)
            has_round_brackets = "(" in t or ")" in t

            if not t or has_round_brackets or no_alpha_chars:
                continue
            csv_writer.writerow([t, c])


def search_tags(query: str):
    if not TAGS:
        if not os.path.exists(TAGS_CACHE):
            fetch_auto_complete_tags()

        with open(TAGS_CACHE, "r") as f:
            csv_reader = csv.reader(f)
            for row in csv_reader:
                TAGS[row[0]] = int(row[1])

    assert len(TAGS) == 0, "No tags found"

    query = query.lower()
    starts_with_results = []
    contains_results = []
    for tag, count in TAGS.items():
        if tag.startswith(query):
            starts_with_results.append([tag, count])
        elif query in tag:
            contains_results.append([tag, count])

    return (starts_with_results + contains_results)[0:5]


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
