import { Button, Modal, ModalBody, ModalHeader } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { useProject } from "../../hooks/useProject";
import { State } from "../../models/base";

export function ErrorSavingModal() {
  const project = useProject();
  const [show, setShow] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const clearError = () => {
    project.setStateAndNotify(State.Loaded);
    project.selectedImage?.setStateAndNotify(State.Loaded);
    setShow(false);
  };

  useEffect(() => {
    setShow(
      project.state === State.ErrorSaving ||
        project.selectedImage?.state === State.ErrorSaving,
    );
  }, [project.isError, project.selectedImage?.isError]);

  return (
    <Modal popup dismissible show={show} onClose={clearError} size="sm">
      <ModalHeader />
      <ModalBody>
        <div className="text-center">
          <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            Error Saving Project. Check Console and Server Logs.
          </h3>
          <div className="flex justify-center gap-4">
            <Button color="gray" onClick={clearError}>
              Nevermind
            </Button>
            <Button
              color="failure"
              disabled={isRetrying}
              isProcessing={isRetrying}
              onClick={async () => {
                setIsRetrying(true);
                const success =
                  (await project?.selectedImage?.saveTags()) &&
                  (await project?.save());
                if (success) {
                  setShow(false);
                }
                setIsRetrying(false);
              }}
            >
              Retry
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
