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
import { showNewProjectModalAtom } from "../../state/atoms";

import { SubmitHandler, useForm } from "react-hook-form";
import Project, { NewProjectData } from "../../models/project";

export function CreateProjectModal() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<NewProjectData>();
  const [isOpen, setIsOpen] = useRecoilState(showNewProjectModalAtom);
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);

  const onSubmit: SubmitHandler<NewProjectData> = async (data) => {
    setIsProcessing(true);
    try {
      const resp = await Project.create(data);
      if (resp.errors) {
        for (const [field, message] of Object.entries(resp.errors)) {
          setError(field as keyof NewProjectData, {
            type: "manual",
            message: message as string,
          });
        }
      } else {
        setIsOpen(false);
      }
    } catch (error) {
      alert(`Failed to create project: ${error}`);
    } finally {
      setIsProcessing(false);
    }
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
            <Label htmlFor="importDirPath">Import Images (optional)</Label>
            <TextInput
              id="importDirPath"
              placeholder="C:\Documents\My Images"
              {...register("importDirPath")}
            />
          </div>

          <div className="mb-1 mt-3 flex max-w-md flex-col gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="autoFileFormat"
                defaultChecked
                {...register("autoFileFormat")}
              />
              <Label htmlFor="autoFileFormat" className="flex">
                Auto manage file formats (convert to .png)
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

          <div className="flex flex-row justify-end gap-2 pt-4">
            <Button color="gray" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              gradientDuoTone="greenToBlue"
              isProcessing={isProcessing}
            >
              Create Project
            </Button>
          </div>
        </ModalBody>
      </form>
    </Modal>
  );
}
