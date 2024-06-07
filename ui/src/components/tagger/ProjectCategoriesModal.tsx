import { Button, Modal } from "flowbite-react";
import React from "react";
import { HiArrowRight } from "react-icons/hi";
import { useAppState } from "../../hooks/useApp";
import { SuggestedAutoTags } from "./SuggestedAutoTags";

export function ProjectCategoriesModal() {
  const [appValue, app] = useAppState(
    "project.requiresSetup",
    "project.autoTags",
  );

  if (appValue.project.autoTags.length === 0) {
    return null;
  }

  return (
    <Modal
      show={appValue.project.requiresSetup}
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
        Setup Project-Specific Tags{" "}
        <span className="text-sm text-gray-400 dark:text-gray-200">
          (optional)
        </span>
      </Modal.Header>
      <Modal.Body>
        <p className="p-1 text-sm dark:text-white">
          Here{" "}
          {appValue.project.autoTags.length === 1
            ? "is a tag"
            : "are some tags"}{" "}
          you might want to add to your project. Generally you don't want to tag
          things <em>already</em> implicit in your trigger word. For example,
          when training a face, if you tag someone's distinctive mole or
          freckles, the model may not learn them as part of your trigger word.
          Your tags should <em>resemble the prompt</em> you'd like to use once
          the model is trained.
        </p>
        <SuggestedAutoTags />
      </Modal.Body>
      <Modal.Footer className="justify-center ">
        <Button
          gradientDuoTone="greenToBlue"
          size="xl"
          onClick={() => app.project.setRequiresSetup(false)}
          fullSized
        >
          Start Tagging <HiArrowRight className="ml-2 h-6 w-6" />
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
