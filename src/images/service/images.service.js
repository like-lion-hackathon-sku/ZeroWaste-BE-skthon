import { generatePresignedUrlForGet } from "../../utils/s3.js";
import { getPhotoUrlResponseDto } from "../dto/response/images.response.dto.js";
export const getPhotoUrl = async (data) => {
  const url = generatePresignedUrlForGet(data.type, data.name);
  return getPhotoUrlResponseDto({ url });
};
