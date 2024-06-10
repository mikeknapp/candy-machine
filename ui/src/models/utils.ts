import { CategoryData } from "../components/tagger/TagCategory";

export function cleanTag(tag: string, trim: boolean = true): string {
  // Trim (if applicable), to lower case, and remove more than one space in a row.
  let result = tag.toLowerCase().replace(/\s{2,}/g, " ");
  if (trim) {
    result = result.trim();
  }
  return result;
}

export function removeSynoymsFromLayout(
  synonyms: string[],
  tagLayout: CategoryData[],
): CategoryData[] {
  return tagLayout.map((category) => {
    return {
      ...category,
      tags: category.tags.filter((tag) => !synonyms.includes(tag)),
    };
  });
}
