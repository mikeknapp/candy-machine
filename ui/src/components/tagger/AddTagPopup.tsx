import { Modal, ModalBody, TextInput } from "flowbite-react";
import React, { useEffect, useRef, useState } from "react";
import { useApp } from "../../hooks/useApp";

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
    if (props.show && props.tagTemplate && ref.current) {
      // Select any text that looks like {...} in the text area.
      const match = props.tagTemplate.match(/({[^}]+})/);
      if (match) {
        setTimeout(() => {
          ref.current.focus();
          ref.current.setSelectionRange(
            match.index,
            match.index + match[1].length,
          );
        }, 50);
      }
    } else {
      // Just focus.
      setTimeout(() => ref.current?.focus(), 50);
    }
  }, [props.show, props.tagTemplate, ref.current]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    app.project.addTagToSelectedImage(props.category, value);
    closeAndCleanup();
  };

  return (
    <Modal popup dismissible show={props.show} onClose={closeAndCleanup}>
      <ModalBody className="p-4">
        <form onSubmit={onSubmit}>
          <TextInput
            ref={ref}
            sizing="lg"
            className="font-mono text-4xl"
            onChange={(e) => setValue(e.target.value)}
            value={value}
          />
        </form>
      </ModalBody>
    </Modal>
  );
}
