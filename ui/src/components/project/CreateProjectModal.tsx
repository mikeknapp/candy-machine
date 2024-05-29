import {
  Button,
  Checkbox,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Progress,
  TextInput,
  Tooltip,
} from "flowbite-react";
import React, { useEffect, useState } from "react";
import { isWindows } from "react-device-detect";
import { SubmitHandler, useForm } from "react-hook-form";
import { GoAlertFill } from "react-icons/go";
import { HiInformationCircle } from "react-icons/hi2";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  NewProject,
  createProject,
  importImages,
  loadProject,
} from "../../models/project";
import {
  currentProjectSelector,
  showNewProjectModalAtom,
} from "../../state/atoms";

export function CreateProjectModal() {
  const {
    reset,
    register,
    handleSubmit,
    setError,
    setFocus,
    watch,
    formState: { errors },
  } = useForm<NewProject>();
  const [isOpen, setIsOpen] = useRecoilState(showNewProjectModalAtom);
  const setCurrentProject = useSetRecoilState(currentProjectSelector);

  const importDirPath = watch("importDirPath", "");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [importPercent, setImportPercent] = useState<number>(-1);
  const [totalImages, setTotalImages] = useState<number>(0);

  const onSubmit: SubmitHandler<NewProject> = async (data) => {
    setIsProcessing(true);

    const resp = await createProject(data);
    if (resp.errors) {
      for (const [field, message] of Object.entries(resp.errors)) {
        setError(field as keyof NewProject, {
          type: "manual",
          message: message as string,
        });
      }
      setIsProcessing(false);
      return;
    }

    const newProject = resp.data;
    setIsOpen(false);

    // Import the images if a directory path was provided and show a progress bar.
    if (data.importDirPath) {
      await importImages(
        newProject,
        data.importDirPath,
        data.removeDuplicates,
        async (jsonStr: string) => {
          const data = JSON.parse(jsonStr);
          setTotalImages(data.totalImages ?? 0);
          const pc = Math.max(1, data.percentComplete);
          setImportPercent(Math.min(99, pc));
        },
      );
    }

    // Load the project from the server to get a fresh copy.
    const loadedProject = await loadProject(newProject.name);
    setCurrentProject(loadedProject);
    setImportPercent(-1);
    setIsProcessing(false);
  };

  const getImportStatus = (percent: number, totalImages: number) => {
    if (percent === -1) {
      return "Analyzing images....";
    }

    if (percent < 33 && totalImages === 0) {
      return "Checking images for duplicates...";
    }

    if (percent >= 33 && totalImages > 0 && percent < 66) {
      return `Converting ${totalImages} images to .png...`;
    }

    return "Analyzing images...";
  };

  useEffect(() => {
    if (isOpen) {
      reset();
      setTimeout(() => setFocus("name"), 500);
    } else {
      setIsProcessing(false);
    }
  }, [isOpen]);

  return (
    <>
      <Modal show={isOpen} onClose={() => setIsOpen(false)} size="lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Create New Project</ModalHeader>
          <ModalBody className="flex flex-col gap-5">
            <div>
              <Label htmlFor="name" className="mb-2">
                Project Name <span className="text-small text-red-500">*</span>
              </Label>
              <TextInput
                id="name"
                placeholder="my_project"
                {...register("name", {
                  required: "A project name is required",
                  pattern: {
                    value: /^[a-zA-Z0-9_-]*$/,
                    message:
                      "Only alphanumeric characters, underscores, and hyphens allowed",
                  },
                })}
              />
              {errors.name && (
                <p className="form-error">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="importDirPath">
                Import Directory of Images{" "}
                <span className="text-small text-red-500">*</span>
              </Label>
              <TextInput
                id="importDirPath"
                placeholder={
                  isWindows
                    ? "C:/Documents/My Images"
                    : "/home/user/images/my_images"
                }
                {...register("importDirPath", {
                  required: "A directory path is required",
                })}
              />
              {errors.importDirPath && (
                <p className="form-error">{errors.importDirPath.message}</p>
              )}
              {importDirPath !== "" && (
                <div className="mt-2 flex items-center gap-2">
                  <Checkbox
                    {...register("removeDuplicates")}
                    id="removeDuplicates"
                  />
                  <Label htmlFor="removeDuplicates">
                    Automatically remove duplicates
                  </Label>
                </div>
              )}
            </div>

            <div>
              <Label
                htmlFor="triggerWord"
                className="flex flex-row items-center gap-2"
              >
                Trigger Word
                <Tooltip
                  content="For example, a short made-up word with no existing meaning: i.e. 0xf1ow3r"
                  className="max-w-[300px]"
                >
                  <HiInformationCircle className="h-4 w-4" />
                </Tooltip>
              </Label>
              <TextInput
                id="triggerWord"
                className="mt-1"
                placeholder="0xTrigger"
                {...register("triggerWord", {
                  required: false,
                  pattern: {
                    value: /^[a-zA-Z0-9]*$/,
                    message: "Only alphanumeric characters allowed",
                  },
                })}
              />
              {errors.triggerWord && (
                <p className="form-error">{errors.triggerWord.message}</p>
              )}
            </div>

            <div className="flex flex-row items-center rounded-md bg-yellow-50 p-2 text-sm text-gray-500 dark:bg-slate-800 dark:text-gray-200">
              <GoAlertFill className="mr-2 inline h-5 w-5 text-yellow-300" />
              Always keep a separate backup of your images!
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

      <Modal dismissible={false} show={importPercent > -1}>
        <ModalBody>
          <p className="mb-4 text-center text-2xl font-bold dark:text-white">
            {getImportStatus(importPercent, totalImages)}
          </p>
          <Progress size="xl" color="green" progress={importPercent} />
        </ModalBody>
      </Modal>
    </>
  );
}
