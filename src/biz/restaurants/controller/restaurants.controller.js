import { StatusCodes } from "http-status-codes";
import { registerRestaurant } from "../service/restaurants.service.js";
import { registerRestaurantRequestDto } from "../dto/request/restaurants.request.dto.js";

export const handleRegisterRestaurant = async (req, res, next) => {
  /*
        #swagger.tags = ['Biz']
        #swagger.summary = "식당 추가"
        #swagger.requestBody = {
            required : true,
            content:{
            "multipart/form-data":{
                schema:{
                type:"object",
                properties:{
                    name:{ type:"string", example:"맘스터치 수원탑동점" },
                    category:  { type:"string", example:"FASTFOOD"},
                    address: {type:"string", example:"경기 수원시 권선구 금호로 222"},
                    telephone: {type:"string", example:"0312973690"},
                    mapx:{type:"string", example:"1269742621"},
                    mapy:{type:"string", example:"372750674"},
                    images:{ type:"array", items:{ type:"string", format:"binary" } },
                    menuImages: {type: "array", items:{type:"string", format:"binary"}},
                    menuMetadatas: { 
                        type:"array",
                        items:{
                            type:"string"
                        }
                    },
                    benefits:{
                        type:"array",
                        items:{
                            type:"object",
                            properties:{
                                condition:{type:"number",example:5},
                                reward:{type:"string", example:"군만두 4개 세트"}
                            }
                        }
                    }

                },
                }
            }
            }
        }
    */
  if (req.payload.role != "BIZ") throw new Error("사업자 계정이 아닙니다.");
  const result = await registerRestaurant(
    registerRestaurantRequestDto(req.body, req.files, req.payload)
  );
  res.status(StatusCodes.CREATED).success(result);
};
