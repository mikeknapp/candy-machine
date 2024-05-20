import { Button, Dropdown, Modal } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { BiShapeSquare } from "react-icons/bi";
import { MdFlip, MdRotate90DegreesCw } from "react-icons/md";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useRecoilState, useRecoilValue } from "recoil";
import { API_BASE_URL } from "../../api";
import Project from "../../models/project";
import { selectedImageAtom, showEditImageModalAtom } from "../../state/atoms";

const INITIAL_CROP: Crop = {
  unit: "%",
  x: 25,
  y: 25,
  width: 50,
  height: 50,
};

enum AspectRatio {
  CUSTOM = "Custom",
  SQUARE = "Square",
  FOUR_THREE = "4:3",
  SIXTEEN_NINE = "16:9",
}

function getAspectRatioValue(aspect: AspectRatio): number | undefined {
  switch (aspect) {
    case AspectRatio.CUSTOM:
      return undefined;
    case AspectRatio.SQUARE:
      return 1;
    case AspectRatio.FOUR_THREE:
      return 4 / 3;
    case AspectRatio.SIXTEEN_NINE:
      return 16 / 9;
  }
}

enum Rotation {
  ZERO = 0,
  NINETY = 90,
  ONE_EIGHTY = 180,
  TWO_SEVENTY = 270,
}

export function EditImageModal({ project }: { project: Project }) {
  const selectedImg = useRecoilValue(selectedImageAtom);
  const [showModal, setShowModal] = useRecoilState(showEditImageModalAtom);
  const [crop, setCrop] = useState<Crop>(INITIAL_CROP);
  const [aspect, setAspect] = useState<AspectRatio>(AspectRatio.CUSTOM);
  const [rotate, setRotate] = useState<Rotation>(Rotation.ZERO);
  const [flipHorizontal, setFlipHorizontal] = useState<boolean>(false);
  const [imgSize, setImgSize] = useState({
    w: 0,
    h: 0,
    imgTagW: 0,
    imgTagH: 0,
  });

  const refreshCrop = () => {
    if (!imgSize.w || !imgSize.h) {
      return;
    }
    if (aspect === AspectRatio.CUSTOM) {
      return;
    }
    const newCrop = centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 75,
        },
        getAspectRatioValue(aspect),
        imgSize.w,
        imgSize.h,
      ),
      imgSize.w,
      imgSize.h,
    );
    setCrop(newCrop);
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const {
      naturalWidth: w,
      naturalHeight: h,
      width: imgTagW,
      height: imgTagH,
    } = e.currentTarget;
    setImgSize({ w, h, imgTagW, imgTagH });
    setTimeout(refreshCrop, 100);
  };

  const finalCrop = () => {
    return {
      width: Math.round((crop.width / imgSize.imgTagW) * imgSize.w),
      height: Math.round((crop.height / imgSize.imgTagH) * imgSize.h),
      x: Math.round((crop.x / imgSize.imgTagW) * imgSize.w),
      y: Math.round((crop.y / imgSize.imgTagH) * imgSize.h),
    };
  };

  const saveImage = () => {
    alert("Save!");
  };

  useEffect(() => {
    if (showModal) {
      setAspect(AspectRatio.CUSTOM);
    }
  }, [showModal]);

  useEffect(() => {
    if (showModal && selectedImg) {
      refreshCrop();
    }
  }, [aspect]);

  useEffect(() => {
    console.log(crop);
  }, [crop]);

  return (
    <Modal
      show={showModal}
      dismissible={true}
      onClose={() => setShowModal(false)}
      size="4xl"
    >
      <Modal.Body>
        <div className="flex flex-row justify-center gap-3 py-3">
          <Button
            color="light"
            size="lg"
            onClick={() => {
              setRotate((rotate + 90) % 360);
              console.log(`Rotate: ${rotate}`);
            }}
          >
            <MdRotate90DegreesCw className="mr-2 h-6 w-6" /> Rotate Left
          </Button>

          <Button
            color="light"
            size="lg"
            onClick={() => setFlipHorizontal(!flipHorizontal)}
          >
            <MdFlip className="mr-2 h-6 w-6" /> Flip Horizontal
          </Button>

          <Dropdown
            color="light"
            label={
              <>
                <BiShapeSquare className="mr-2 h-6 w-6" /> Crop Shape
              </>
            }
            size="lg"
          >
            {Object.values(AspectRatio).map((a) => (
              <Dropdown.Item key={a} onClick={() => setAspect(a)}>
                {a}
              </Dropdown.Item>
            ))}
          </Dropdown>
        </div>

        <div className="flex flex-row justify-center bg-black">
          <ReactCrop
            crop={crop}
            key={`edit-image-${imgSize.w}x${imgSize.h}`}
            onChange={(c) => setCrop(c)}
            ruleOfThirds
            minHeight={100}
            minWidth={100}
            keepSelection
            aspect={getAspectRatioValue(aspect)}
            className="relative flex"
          >
            <img
              style={{
                transform: `scaleX(${flipHorizontal ? -1 : 1})`,
              }}
              className="h-[500px]"
              src={`${API_BASE_URL}/project/${project.dirName}/imgs/${selectedImg}${rotate > 0 ? `?rotate=${rotate}` : ""}`}
              onLoad={onImageLoad}
            />
            <div className="absolute bottom-2 left-2 rounded-md bg-yellow-100 p-1 font-mono text-xs">
              {finalCrop().width} x {finalCrop().height}
            </div>
          </ReactCrop>
        </div>

        <div className="flex flex-row justify-end gap-2 pt-4">
          <Button color="gray" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button gradientDuoTone="greenToBlue" onClick={saveImage}>
            Save Modified Image
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
