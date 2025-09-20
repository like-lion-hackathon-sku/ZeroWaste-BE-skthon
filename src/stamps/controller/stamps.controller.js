import { StatusCodes } from "http-status-codes";
import {
  getAllStampsRequestDto,
  useStampRequestDto,
} from "../dto/request/stamps.request.dto.js";
import {
  getAllStamps,
  getStampsHistories,
  useStamps,
} from "../service/stamps.service.js";

export const handleUseStamp = async (req, res, next) => {
  /*
    #swagger.tags = ['Stamps']
    #swagger.summary = "스탬프 사용"
     #swagger.requestBody = {
      required : true,
      content:{
        "application/json":{
          schema:{
            type:"object",
            properties:{
              restaurantId:{
                type:"number",
                example:1
              },
              condition:{
                type:"number",
                example:5
              }
            }
          }
        }
      }
    }
    */
  const code = await useStamps(useStampRequestDto(req.payload, req.body));
  res.status(StatusCodes.CREATED).success(code);
};

export const handleGetAllStamps = async (req, res, next) => {
  /*
  #swagger.tags = ['Stamps']
  #swagger.summary = "보유 스탬프 목록"
*/
  const results = await getAllStamps(getAllStampsRequestDto(req.payload));
  res.status(StatusCodes.OK).success(results);
};

export const handleGetStampHistories = async (req, res, next) => {
  /*
    #swagger.tags = ['Stamps']
    #swagger.summary = "스탬프 내역"    
  */
  const histories = await getStampsHistories(
    getAllStampsRequestDto(req.payload)
  );
  res.status(StatusCodes.OK).success(histories);
};
