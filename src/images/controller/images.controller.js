import { StatusCodes } from "http-status-codes";
import { getPhotoUrlRequestDto } from "../dto/request/images.request.dto.js";
import { getPhotoUrl } from "../service/images.service.js";

export const handleGetPhotoUrl = async (req, res, next) => {
  const url = await getPhotoUrl(getPhotoUrlRequestDto(req.params));
  res.status(StatusCodes.OK).success(url);
};
