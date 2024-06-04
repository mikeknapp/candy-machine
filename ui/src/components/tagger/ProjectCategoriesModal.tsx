import { Button, Modal } from "flowbite-react";
import React from "react";
import { HiArrowRight } from "react-icons/hi";
import { useProjectState } from "../../hooks/useProject";
import { SuggestedAutoTags } from "./SuggestedAutoTags";

export function ProjectCategoriesModal() {
  const [projectValue, project] = useProjectState();

  if (projectValue.autoTags.length === 0) {
    return null;
  }

  return (
    <Modal
      show={projectValue.requiresSetup}
      size="2xl"
      dismissible={false}
      theme={{
        root: {
          base: "fixed inset-x-0 top-0 z-50 h-screen !overflow-hidden md:inset-0 md:h-full",
        },
        header: {
          close: {
            base: "hidden",
          },
        },
      }}
    >
      <Modal.Header className="text-center">
        Setup Your Project Tags{" "}
        <span className="text-sm text-gray-400 dark:text-gray-200">
          (optional)
        </span>
      </Modal.Header>
      <Modal.Body>
        <p className="p-1 dark:text-white">
          Here are {projectValue.autoTags.length} tags that might come in handy.
          Generally you don't want to tag things <i>already</i> implicit in your
          trigger word. For example, when training a face, if you tag someone's
          distinctive mole or freckles, the model may not learn those to be part
          of your trigger word.
        </p>
        <SuggestedAutoTags />
      </Modal.Body>
      <Modal.Footer className="justify-center ">
        <Button
          gradientDuoTone="greenToBlue"
          size="xl"
          onClick={() => project.setRequiresSetup(false)}
          fullSized
        >
          Start Tagging <HiArrowRight className="ml-2 h-6 w-6" />
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
