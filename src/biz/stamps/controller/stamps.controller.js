import { StatusCodes } from "http-status-codes";
import { verifyStampsRequestDto } from "../dto/request/stamps.request.dto.js";
import { verifyStamps } from "../service/stamps.service.js";

export const handleVerifyStamps = async (req, res, next) => {
  /*
    #swagger.tags = ['Stamps']
    #swagger.summary = "스탬프 사용 처리"
    #swagger.requestBody = {
      required : true,
      content:{
        "application/json":{
          schema:{
            type:"object",
            properties:{
              code:{
                type:"string",
                example:"code"
              }
            }
          }
        }
      }
    }
  */
  if (req.payload.role != "BIZ") throw new Error("사업자 계정이 아닙니다.");
  const result = await verifyStamps(
    verifyStampsRequestDto(req.payload, req.body)
  );
  res.status(StatusCodes.ACCEPTED).success(result);
};
