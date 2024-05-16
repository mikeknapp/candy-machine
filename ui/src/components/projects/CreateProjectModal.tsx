import {
  Button,
  Checkbox,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  TextInput,
} from "flowbite-react";
import React, { useEffect } from "react";
import { useRecoilState } from "recoil";
import { showNewProjectDialog } from "../../state/atoms";

import { SubmitHandler, useForm } from "react-hook-form";

interface IFormInput {
  dirName: string;
  importDirPath: string;
  autoFileFormat: boolean;
  autoFileNaming: boolean;
}

export function CreateProjectModal() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>();
  const [isOpen, setIsOpen] = useRecoilState(showNewProjectDialog);
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);

  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    console.log(data);
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => document.getElementById("dirName")?.focus(), 100);
    }
  }, [isOpen]);

  return (
    <Modal
      show={isOpen}
      dismissible={true}
      onClose={() => setIsOpen(false)}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>Create New Project</ModalHeader>
        <ModalBody className="flex flex-col gap-5">
          <div>
            <Label htmlFor="dirName">Directory Name</Label>
            <TextInput
              id="dirName"
              placeholder="my_project"
              {...register("dirName", {
                required: "A directory name is required",
                pattern: {
                  value: /^[a-zA-Z0-9_-]*$/,
                  message:
                    "Only alphanumeric characters, underscores, and hyphens allowed",
                },
              })}
            />
            {errors.dirName && (
              <p className="form-error">{errors.dirName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="importDirPath">
              Path to Import Images (optional)
            </Label>
            <TextInput
              id="importDirPath"
              placeholder="C:\Documents\My Images"
              {...register("importDirPath")}
            />
          </div>

          <div className="my-3 flex max-w-md flex-col gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="autoFileFormat"
                defaultChecked
                {...register("autoFileFormat")}
              />
              <Label htmlFor="autoFileFormat" className="flex">
                Auto manage file format (convert to .png)
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="autoFileNaming"
                defaultChecked
                {...register("autoFileNaming")}
              />
              <Label htmlFor="autoFileNaming" className="flex">
                Auto manage file names (i.e. 0001.png)
              </Label>
            </div>
          </div>
        </ModalBody>
        <Modal.Footer>
          <Button
            type="submit"
            gradientDuoTone="greenToBlue"
            isProcessing={isProcessing}
          >
            Create Project
          </Button>
          <Button color="gray" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
