import { Button, Dropdown, Modal, Spinner } from "flowbite-react";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { IconType } from "react-icons";
import { BiShapeSquare } from "react-icons/bi";
import { FcCheckmark } from "react-icons/fc";
import { MdFlip, MdRotate90DegreesCw } from "react-icons/md";
import {
  TbCrop11,
  TbCrop11Filled,
  TbCrop169,
  TbCrop169Filled,
  TbCrop32,
  TbCrop32Filled,
} from "react-icons/tb";
import ReactCrop, {
  PercentCrop,
  centerCrop,
  convertToPercentCrop,
  convertToPixelCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useRecoilState, useRecoilValue } from "recoil";
import { API_BASE_URL } from "../../api";
import Project from "../../models/project";
import { selectedImageAtom, showCropImageModalAtom } from "../../state/atoms";

const INITIAL_CROP: PercentCrop = {
  unit: "%",
  x: 25,
  y: 25,
  width: 50,
  height: 50,
};

const INITIAL_SIZE = {
  w: 0, // Actual size of the image.
  h: 0,
  imgTagW: 0, // Scaled size inside a img tag.
  imgTagH: 0,
};

enum AspectRatio {
  SQUARE = "Square",
  FOUR_THREE = "4:3",
  SIXTEEN_NINE = "16:9",
  NINE_SIXTEEN = "9:16",
  CUSTOM = "Custom",
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
    case AspectRatio.NINE_SIXTEEN:
      return 9 / 16;
  }
}

enum Rotation {
  ZERO = 0,
  NINETY = 90,
  ONE_EIGHTY = 180,
  TWO_SEVENTY = 270,
}

export function CropImageModal({ project }: { project: Project }) {
  const selectedImg = useRecoilValue(selectedImageAtom);
  const [showModal, setShowModal] = useRecoilState(showCropImageModalAtom);

  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<PercentCrop>(INITIAL_CROP);
  const [aspect, setAspect] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [rotate, setRotate] = useState<Rotation>(Rotation.ZERO);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [flipHorizontal, setFlipHorizontal] = useState<boolean>(false);
  const [imgSize, setImgSize] = useState(INITIAL_SIZE);

  const refreshCrop = () => {
    if (aspect !== AspectRatio.CUSTOM) {
      const newCrop = centerCrop(
        makeAspectCrop(
          {
            unit: "%",
            x: 25,
            y: 25,
            width: 50,
          },
          getAspectRatioValue(aspect),
          imgSize.w,
          imgSize.h,
        ),
        imgSize.w,
        imgSize.h,
      );
      setCrop(newCrop);
    }
  };

  const onImageLoad = () => {
    setTimeout(() => {
      const imgEl = imgRef.current as HTMLImageElement;
      const {
        naturalWidth: w,
        naturalHeight: h,
        width: imgTagW,
        height: imgTagH,
      } = imgEl;
      setImgSize({
        w,
        h,
        imgTagW: Math.round(imgTagW),
        imgTagH: Math.round(imgTagH),
      });
      setIsRotating(false);
    }, 100);
  };

  const getAspectRatioIcon = (
    aspect: AspectRatio,
    outline = false,
  ): ReactNode => {
    let styling = "h-6 w-6 mr-2";
    let icon: IconType;
    switch (aspect) {
      case AspectRatio.CUSTOM:
        icon = BiShapeSquare;
        break;
      case AspectRatio.SQUARE:
        icon = outline ? TbCrop11 : TbCrop11Filled;
        break;
      case AspectRatio.FOUR_THREE:
        icon = outline ? TbCrop32 : TbCrop32Filled;
        break;
      case AspectRatio.SIXTEEN_NINE:
        icon = outline ? TbCrop169 : TbCrop169Filled;
        break;
      case AspectRatio.NINE_SIXTEEN:
        styling = `${styling} rotate-90`;
        icon = outline ? TbCrop169 : TbCrop169Filled;
        break;
    }
    return React.createElement(icon, { className: styling });
  };

  const saveImage = () => {
    const finalCrop = convertToPixelCrop(crop, imgSize.w, imgSize.h);
    console.log("Final crop", finalCrop);
    alert("Save!");
  };

  useEffect(() => {
    if (showModal) {
      setAspect(AspectRatio.SQUARE);
    }
  }, [showModal]);

  useEffect(() => {
    if (showModal && selectedImg) {
      refreshCrop();
    }
  }, [imgSize, aspect]);

  useEffect(() => {
    if (showModal && selectedImg) {
      setCrop(INITIAL_CROP);
      setAspect(AspectRatio.SQUARE);
      setRotate(Rotation.ZERO);
      setFlipHorizontal(false);
      setImgSize(INITIAL_SIZE);
    }
  }, [selectedImg]);

  const pixelCrop = convertToPixelCrop(crop, imgSize.w, imgSize.h);

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
            disabled={isRotating}
            color="light"
            size="lg"
            onClick={() => {
              setIsRotating(true);
              setAspect(AspectRatio.SQUARE);
              setRotate((rotate + 90) % 360);
            }}
          >
            <MdRotate90DegreesCw className="mr-2 h-6 w-6" /> Rotate Left
          </Button>

          <Button
            disabled={isRotating}
            color="light"
            size="lg"
            onClick={() => setFlipHorizontal(!flipHorizontal)}
          >
            <MdFlip className="mr-2 h-6 w-6" /> Flip Horizontal
          </Button>

          <Dropdown
            disabled={isRotating}
            color="light"
            label={<>{getAspectRatioIcon(aspect, true)} Crop Shape</>}
            size="lg"
          >
            {Object.values(AspectRatio).map((a) => (
              <Dropdown.Item key={a} onClick={() => setAspect(a)}>
                {getAspectRatioIcon(a)}
                {a} {aspect === a && <FcCheckmark className="ml-2" />}
              </Dropdown.Item>
            ))}
          </Dropdown>
        </div>

        <div className="relative flex h-[500px] flex-row items-center justify-center bg-black">
          {isRotating && <Spinner size="lg" />}
          <ReactCrop
            crop={crop}
            key={`edit-image-${project.name}-${selectedImg}-${imgSize.w}x${imgSize.h}`}
            onChange={(c) => {
              // Prevent crop from going out of bounds. (There seems to be bug with click and drag.)
              c.x = Math.max(0, c.x);
              c.y = Math.max(0, c.y);
              c.width = Math.min(imgSize.imgTagW, c.width);
              c.height = Math.min(imgSize.imgTagH, c.height);
              setCrop(
                convertToPercentCrop(c, imgSize.imgTagW, imgSize.imgTagH),
              );
            }}
            ruleOfThirds
            minHeight={100}
            minWidth={100}
            keepSelection
            aspect={getAspectRatioValue(aspect)}
            className={`flex ${isRotating ? "hidden" : ""}`}
          >
            <img
              ref={imgRef}
              key={`edit-image-${selectedImg}-${rotate}`}
              style={{
                transform: `scaleX(${flipHorizontal ? -1 : 1})`,
              }}
              className="h-[500px]"
              src={`${API_BASE_URL}/project/${project.name}/imgs/${selectedImg}${rotate > 0 ? `?rotate=${rotate}` : ""}`}
              onLoad={onImageLoad}
            />
          </ReactCrop>
          {pixelCrop && (
            <div className="absolute bottom-2 left-2 rounded-md bg-yellow-100 p-1 font-mono text-xs">
              {Math.round(pixelCrop.width)} x {Math.round(pixelCrop.height)}
            </div>
          )}
        </div>

        <div className="flex flex-row justify-end gap-2 pt-4">
          <Button color="gray" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            disabled={isRotating}
            gradientDuoTone="greenToBlue"
            onClick={saveImage}
          >
            Save Modified Image
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
