import {
  Button,
  Checkbox,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  TextInput,
} from "flowbite-react";
import React from "react";
import { useRecoilState } from "recoil";
import { showNewProjectDialog } from "../../state/atoms";

export function CreateProjectModal() {
  const [isOpen, setIsOpen] = useRecoilState(showNewProjectDialog);
  const [dirPath, setDirPath] = React.useState<string>("");

  return (
    <Modal
      show={isOpen}
      dismissible={true}
      onClose={() => setIsOpen(false)}
      size="lg"
    >
      <ModalHeader>Create New Project</ModalHeader>
      <ModalBody>
        <Label htmlFor="dir-name">Directory Name</Label>
        <TextInput
          id="dir-name"
          className="mb-4 mt-2"
          placeholder="my_project"
        />

        <Label htmlFor="import-path">Path to Import Images (optional)</Label>
        <TextInput
          id="import-path"
          className="mb-4 mt-2"
          placeholder="C:\Documents\My Images"
          value={dirPath}
          onChange={(e) => setDirPath(e.target.value)}
        />

        <div className="mb-4 mt-5 flex max-w-md flex-col gap-4">
          <div className="flex items-center gap-2">
            <Checkbox id="convert-png" defaultChecked />
            <Label htmlFor="convert-png" className="flex">
              Auto manage file format (convert to .png)
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="rename-imgs" defaultChecked />
            <Label htmlFor="rename-imgs" className="flex">
              Auto manage file names (i.e. 0001.png)
            </Label>
          </div>
        </div>
      </ModalBody>
      <Modal.Footer>
        <Button
          gradientDuoTone="greenToBlue"
          onClick={() => setIsOpen(false)}
          isProcessing={true}
        >
          Create Project
        </Button>
        <Button color="gray" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
