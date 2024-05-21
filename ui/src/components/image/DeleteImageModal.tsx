import { Button, Modal } from "flowbite-react";
import React from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi2";
import { Project } from "../../models/project";

type DeleteImageModalProps = {
  project: Project;
  selectedImg: string;
  show: boolean;
  onClose: () => void;
};

export function DeleteImageModal({ ...props }: DeleteImageModalProps) {
  const deleteImage = async () => {
    // Delete the image
    alert("delete coming soon!");
    props.onClose();
  };

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
            Are you sure you want to delete this image? This can't be undone.
          </h3>
          <div className="flex justify-center gap-4">
            <Button color="failure" onClick={deleteImage}>
              {"Yes, I'm sure"}
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
