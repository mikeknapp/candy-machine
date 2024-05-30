import { PixelCrop } from "react-image-crop";
import { apiRequest } from "../api";
import { Project } from "./project";

export interface SelectedImageTags {
  projectName: string;
  image: string;
  tags: string[];
}

export const imgSize = (
  filename: string,
): { width: number; height: number } => {
  // Extract the height and width from the image ID i.e. f4227273f1f071f_589x753_0.png
  const matches = filename.match(/_(\d+)x(\d+)_/);
  if (!matches) {
    return { width: 0, height: 0 };
  }
  const width = parseInt(matches[1]);
  const height = parseInt(matches[2]);
  return { width, height };
};

export const imgAspectRatio = (filename: string) => {
  const { width, height } = imgSize(filename);
  if (!width || !height) {
    return undefined;
  }
  return width / height;
};

export const deleteImage = async (
  project: Project,
  filename: string,
): Promise<boolean> => {
  const response = await apiRequest(`/project/${project.name}/img/delete`, {
    body: JSON.stringify({
      filename: filename,
    }),
  });
  if (!response.success) {
    console.error("Error deleting image:", response.errors);
    return false;
  }
  return true;
};

export const editImage = async (
  project: Project,
  filename: string,
  rotate: number,
  flip: boolean,
  crop: PixelCrop,
): Promise<string> => {
  const response = await apiRequest<{ newFilename: string }>(
    `/project/${project.name}/img/edit`,
    {
      body: JSON.stringify({
        filename: filename,
        rotate: rotate,
        flip: flip,
        crop: crop,
      }),
    },
  );
  if (!response.success) {
    console.error("Error editing image:", response.errors);
    return null;
  }
  return response.data.newFilename;
};
