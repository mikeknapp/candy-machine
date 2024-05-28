import { Button, Modal } from "flowbite-react";
import React, { useMemo } from "react";
import { HiArrowRight } from "react-icons/hi2";
import { useRecoilState } from "recoil";
import { Project } from "../../models/project";
import { projectRequiresSetupSelector } from "../../state/atoms";
import { SuggestedAutoTags } from "./SuggestedAutoTags";
import { CATEGORIES } from "./Tagger";

export function ProjectCategoriesModal({ project }: { project: Project }) {
  const [isOpen, setIsOpen] = useRecoilState(projectRequiresSetupSelector);

  const tags = useMemo(() => {
    // Remove any tags that are already in a category.
    return project.autoTags.filter((tag) => {
      return !CATEGORIES.flat().some((category) =>
        category.tags.includes(tag.tag),
      );
    });
  }, [project]);

  if (tags.length === 0) {
    return null;
  }

  return (
    <Modal
      show={isOpen}
      size="2xl"
      onClose={() => setIsOpen(false)}
      dismissible
      theme={{
        root: {
          base: "fixed inset-x-0 top-0 z-50 h-screen !overflow-hidden md:inset-0 md:h-full",
        },
      }}
    >
      <Modal.Header>Setup Your Project Tags</Modal.Header>
      <Modal.Body>
        <p className="pb-3 dark:text-white">
          Here are {tags.length} tags to consider adding to your project's tag
          list. Remember, don't tag things in the image that are
          <em>implicit</em> in your trigger word. For example, when training a
          face, don't tag someone's mole or freckles. You want the model to
          learn those things. Only tag things you want to be able to control in
          your prompt.
        </p>
        <SuggestedAutoTags tags={tags} />
      </Modal.Body>
      <Modal.Footer className="justify-end ">
        <Button
          gradientDuoTone="greenToBlue"
          size="xl"
          onClick={() => setIsOpen(false)}
        >
          Start Tagging <HiArrowRight className="ml-2 h-6 w-6" />
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
