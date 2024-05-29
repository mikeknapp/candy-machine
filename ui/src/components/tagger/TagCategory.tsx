import React, { useEffect } from "react";
import { Tag } from "./Tag";

export interface ClickableTag {
  id: string;
  className: string;
  [key: string]: string;
}

export type CategoryData = {
  title: string;
  tags: string[];
  color: string;
};

export type TagCategoryProps = {
  category: CategoryData;
  i: number;
};

export function TagCategory(props: TagCategoryProps) {
  const selectedClass = `img-tag-selected-${props.i}`;

  const [tags, setTags] = React.useState<Array<ClickableTag>>([]);

  const onTagUpdate = (index: number, newTag: ClickableTag) => {
    console.log("onTagUpdate");
    const updatedTags = [...tags];
    updatedTags.splice(index, 1, newTag);
    setTags(updatedTags);
  };

  const handleAddition = (tag: ClickableTag) => {
    setTags((prevTags) => {
      return [...prevTags, tag];
    });
  };

  const handleDrag = (tag: ClickableTag, currPos: number, newPos: number) => {
    console.log("handleDrag");
    const newTags = tags.slice();

    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag);

    // re-render
    setTags(newTags);
  };

  const handleTagClick = (index: number) => {
    // Toggle the "image-tag" className.
    setTags((prevTags) => {
      const newTags = [...prevTags];
      newTags[index] = {
        ...newTags[index],
        className: newTags[index].className === "" ? selectedClass : "",
      };
      return newTags;
    });
  };

  useEffect(() => {
    setTags(
      props.category.tags.map((tag) => {
        return { id: tag, text: tag, className: "" };
      }),
    );
  }, [props.category]);

  return (
    <div key={props.category.title} className="mb-4 flex w-full flex-col">
      <h2
        className="mb-2 flex flex-row items-center gap-2 border-l-4 pl-2 text-sm font-bold dark:text-white"
        style={{
          borderColor: props.category.color,
        }}
      >
        {props.category.title.toUpperCase()}
      </h2>
      <div className="flex w-[90%] flex-row flex-wrap gap-2">
        {tags.map((tag, i) => (
          <Tag
            text={tag.text}
            onClick={() => handleTagClick(i)}
            color={props.category.color}
            isSelected={tag.className === selectedClass}
          />
        ))}
        {/* <ReactTags
          tags={tags}
          separators={[SEPARATORS.ENTER, SEPARATORS.COMMA]}
          handleAddition={handleAddition}
          onTagUpdate={onTagUpdate}
          suggestions={SUGGESTIONS}
          handleTagClick={handleTagClick}
          allowUnique={true}
          allowDragDrop={false}
          placeholder={`${props.category.title} tags`}
        /> */}
      </div>
    </div>
  );
}
