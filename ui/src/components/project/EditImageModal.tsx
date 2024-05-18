import { Button, Modal } from "flowbite-react";
import React, { useEffect, useState } from "react";
import ReactCrop, { type Crop } from "react-image-crop";
import { useRecoilState, useRecoilValue } from "recoil";
import { API_BASE_URL } from "../../api";
import Project from "../../models/project";
import { selectedImageAtom, showEditImageModalAtom } from "../../state/atoms";

import "react-image-crop/dist/ReactCrop.css";

const INITIAL_CROP: Crop = {
  unit: "%",
  x: 25,
  y: 25,
  width: 50,
  height: 50,
};

export function EditImageModal({ project }: { project: Project }) {
  const selectedImg = useRecoilValue(selectedImageAtom);
  const [showModal, setShowModal] = useRecoilState(showEditImageModalAtom);
  const [crop, setCrop] = useState<Crop>(INITIAL_CROP);

  const saveImage = () => {
    console.log("Saving image", crop);
    alert("Save!");
  };

  useEffect(() => setCrop(INITIAL_CROP), [selectedImg]);

  return (
    <Modal
      show={showModal}
      dismissible={true}
      onClose={() => setShowModal(false)}
      size="4xl"
    >
      <Modal.Body>
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          ruleOfThirds
          minHeight={100}
          minWidth={100}
          keepSelection
        >
          <img
            src={`${API_BASE_URL}/project/${project.dirName}/imgs/${selectedImg}`}
          />
        </ReactCrop>

        <div className="flex flex-row justify-end gap-2 pt-4">
          <Button color="gray" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button gradientDuoTone="greenToBlue" onClick={saveImage}>
            Save Image
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
