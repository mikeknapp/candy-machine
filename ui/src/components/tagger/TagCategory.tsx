import React, { useEffect } from "react";

export interface Tag {
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

  const [tags, setTags] = React.useState<Array<Tag>>([]);

  const onTagUpdate = (index: number, newTag: Tag) => {
    console.log("onTagUpdate");
    const updatedTags = [...tags];
    updatedTags.splice(index, 1, newTag);
    setTags(updatedTags);
  };

  const handleAddition = (tag: Tag) => {
    setTags((prevTags) => {
      return [...prevTags, tag];
    });
  };

  const handleDrag = (tag: Tag, currPos: number, newPos: number) => {
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
    <div key={props.category.title} className="mb-10 flex w-full flex-col">
      <h2 className="mb-2 text-base font-bold dark:text-white">
        {props.category.title.toUpperCase()}
      </h2>
      <div className="flex w-[90%] flex-row flex-wrap">
        {tags.map((tag) => tag.text).join(", ")}
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
