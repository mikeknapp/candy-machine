import { Modal, ModalBody, TextInput, ToggleSwitch } from "flowbite-react";
import React, { useEffect, useRef, useState } from "react";
import { useApp } from "../../hooks/useApp";
import { cleanTag } from "../../models/utils";
import { Tag } from "./Tag";

export interface AddTagPopupProps {
  show: boolean;
  onClose: () => void;
  category: string;
  tagTemplate: string;
}

export function AddTagPopup(props: AddTagPopupProps) {
  const ref = useRef<HTMLInputElement>(null);

  const app = useApp();
  const [value, setValue] = useState(props.tagTemplate);
  const [hide, setHide] = useState(true);

  const closeAndCleanup = () => {
    app.disableKeyboardShortcuts = false;
    props.onClose();
  };

  useEffect(() => {
    app.disableKeyboardShortcuts = props.show;
    if (props.show && props.tagTemplate) {
      // Select any text that looks like {...} in the text area.
      const match = props.tagTemplate.match(/({[^}]+})/);
      if (match) {
        setTimeout(() => {
          ref.current?.focus();
          if (match.index !== undefined) {
            ref.current?.setSelectionRange(
              match.index,
              match.index + match[1].length,
            );
          }
        }, 50);
      }
    } else {
      // Just focus.
      setTimeout(() => ref.current?.focus(), 50);
    }
  }, [props.show, props.tagTemplate]);

  const addTag = (tag: string) => {
    app.project.addTagToSelectedImage(props.category, tag, hide);
    closeAndCleanup();
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addTag(value);
  };

  const suggestedTags = app.project.suggestTags(cleanTag(value));

  const isAlreadyShownInLayout = app.project
    .allLayoutTags()
    .includes(cleanTag(value));

  return (
    <Modal popup dismissible show={props.show} onClose={closeAndCleanup}>
      <ModalBody className="h-[400px] p-4">
        <div className="mx-1 my-2 font-bold text-gray-800 dark:text-gray-200">
          Add Tag to {props.category.toUpperCase()}
        </div>
        <form onSubmit={onSubmit}>
          <div className="mb-10 h-[350px] flex-col justify-between">
            <div className="mb-3 flex flex-col items-end gap-2">
              <TextInput
                id="add-tag-input"
                ref={ref}
                sizing="lg"
                placeholder="Add tag..."
                className="w-full font-mono text-4xl"
                onChange={(e) => setValue(e.target.value)}
                value={cleanTag(value, false)}
              />
              <ToggleSwitch
                label="Show in Tag Screen"
                disabled={cleanTag(value) === "" || isAlreadyShownInLayout}
                checked={!hide || isAlreadyShownInLayout}
                onChange={() => setHide(!hide)}
              />
            </div>
            {suggestedTags && (
              <div className="flex max-h-[300px] w-full flex-row flex-wrap justify-center gap-2 p-3">
                {suggestedTags.sort().map((example, i) => (
                  <Tag
                    key={`quick-add-${i}`}
                    text={example}
                    onClick={() => addTag(cleanTag(example))}
                    isDisabled={false}
                  />
                ))}
              </div>
            )}
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
}
