import { Button, Modal } from "flowbite-react";
import React, { useContext, useState } from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi2";
import { ProjectContext } from "../../app";

type DeleteImageModalProps = {
  selectedImg: string;
  show: boolean;
  onClose: () => void;
};

export function DeleteImageModal(props: DeleteImageModalProps) {
  const projectContext = useContext(ProjectContext);

  const [isDeleting, setIsDeleting] = useState(false);

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
            <Button
              color="failure"
              disabled={isDeleting}
              isProcessing={isDeleting}
              onClick={async () => {
                setIsDeleting(true);
                await projectContext.deleteImage(props.selectedImg);
                props.onClose();
                setIsDeleting(false);
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
