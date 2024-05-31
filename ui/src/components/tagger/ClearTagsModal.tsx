import { Button, Modal } from "flowbite-react";
import React, { useState } from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi2";
import { useSetRecoilState } from "recoil";
import { Project } from "../../models/project";
import { selectedTagsSelector } from "../../state/atoms";

type ClearTagsModalProps = {
  project: Project;
  selectedImg: string;
  show: boolean;
  onClose: () => void;
};

export function ClearTagsModal(props: ClearTagsModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const setSelectedTags = useSetRecoilState(
    selectedTagsSelector({
      projectName: props.project.name,
      image: props.selectedImg,
    }),
  );

  return (
    <Modal
      show={props.show}
      popup
      dismissible
      onClose={props.onClose}
      size="md"
    >
      <Modal.Header />
      <Modal.Body>
        <div className="text-center">
          <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            Are you sure you want to clear the tags from this image?
          </h3>
          <div className="flex justify-center gap-4">
            <Button
              color="failure"
              disabled={isProcessing}
              isProcessing={isProcessing}
              onClick={async () => {
                setIsProcessing(true);
                setSelectedTags([]);
                props.onClose();
                setIsProcessing(false);
              }}
            >
              Yes, I'm sure
            </Button>
            <Button color="gray" onClick={props.onClose}>
              No, cancel
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
