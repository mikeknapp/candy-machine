import { PixelCrop } from "react-image-crop";
import { apiRequest } from "../api";
import { Project } from "./project";

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
