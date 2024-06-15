import { Modal, ModalBody, TextInput } from "flowbite-react";
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
    app.project.addTagToSelectedImage(props.category, tag);
    closeAndCleanup();
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addTag(value);
  };

  const suggestedTags = app.project.suggestTags(cleanTag(value));

  return (
    <Modal popup dismissible show={props.show} onClose={closeAndCleanup}>
      <ModalBody className="p-4">
        <form onSubmit={onSubmit} className="h-[400px]">
          <TextInput
            id="add-tag-input"
            ref={ref}
            sizing="lg"
            placeholder="Add tag..."
            className="font-mono text-4xl"
            onChange={(e) => setValue(e.target.value)}
            value={cleanTag(value, false)}
          />
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
        </form>
      </ModalBody>
    </Modal>
  );
}
