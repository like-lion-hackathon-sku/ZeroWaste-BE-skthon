import { StatusCodes } from "http-status-codes";
import { registerRestaurant } from "../service/restaurants.service.js";
import { registerRestaurantRequestDto } from "../dto/request/restaurants.request.dto.js";

// 현준 추가
import { getBizRestaurantDetailSvc } from "../service/restaurants.service.js";
import { parseGetBizRestaurantDetailRequest } from "../dto/request/restaurants.request.dto.js";
import { getBizRestaurantDetailResponseDto } from "../dto/response/restaurants.response.dto.js";

import {
  deleteBizRestaurantSvc,
  listBizRestaurantsSvc,
} from "../service/restaurants.service.js";
import {
  parseDeleteBizRestaurantRequest,
  parseListBizRestaurantsRequest,
} from "../dto/request/restaurants.request.dto.js";
import {
  deleteBizRestaurantResponseDto,
  listBizRestaurantsResponseDto,
} from "../dto/response/restaurants.response.dto.js";

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
  const result = await registerRestaurant(
    registerRestaurantRequestDto(req.body, req.files, req.payload)
  );
  res.status(StatusCodes.CREATED).success(result);
};

// 현준 식당 상세 조회
/**
 * **[Biz-Restaurants]**
 * **<🕹️ Controller>**
 * ***handleGetBizRestaurantDetail***
 * GET /api/biz/restaurants/:restaurantId
 * - 오너가 소유한 식당의 상세 정보 + 통계(리뷰 평균/개수, 즐겨찾기 수)
 */
export const handleGetBizRestaurantDetail = async (req, res, next) => {
  try {
    /*
      #swagger.tags = ['Biz']
      #swagger.summary = '내 식당 상세 조회'
      #swagger.description = '오너 본인이 소유한 식당의 상세 정보(사진/메뉴/혜택)와 통계를 반환합니다.'
      #swagger.parameters['restaurantId'] = {
        in: 'path',
        name: 'restaurantId',
        required: true,
        description: '식당 ID',
        type: 'integer',
        example: 12
      }
      #swagger.responses[200] = { description: '조회 성공' }
      #swagger.responses[401] = { description: '로그인 필요' }
      #swagger.responses[403] = { description: '권한 없음' }
      #swagger.responses[422] = { description: '존재하지 않는 식당' }
    */
    const reqDto = parseGetBizRestaurantDetailRequest(req);
    const result = await getBizRestaurantDetailSvc(reqDto);
    const resDto = getBizRestaurantDetailResponseDto(result);
    return res.status(StatusCodes.OK).success(resDto);
  } catch (err) {
    return next(err);
  }
};

/**
 * 사업체 식당 삭제
 * DELETE /api/biz/restaurants/:restaurantId
 */
export const handleDeleteBizRestaurant = async (req, res, next) => {
  try {
    /*
      #swagger.tags = ['Biz']
      #swagger.summary = '사업체 식당 삭제'
      #swagger.description = '오너가 소유한 식당을 삭제합니다.'
      #swagger.parameters['restaurantId'] = {
        in: 'path',
        required: true,
        description: '삭제할 식당 ID',
        schema: { type: 'integer', example: 12 }
      }
      #swagger.responses[200] = { description: '삭제 성공' }
      #swagger.responses[401] = { description: '로그인 필요' }
      #swagger.responses[403] = { description: '권한 없음' }
      #swagger.responses[404] = { description: '식당 없음' }
    */
    const dto = parseDeleteBizRestaurantRequest(req);
    const result = await deleteBizRestaurantSvc(dto);
    return res
      .status(StatusCodes.OK)
      .success(deleteBizRestaurantResponseDto(result));
  } catch (err) {
    next(err);
  }
};

/**
 * 사업체 내 식당 전체 조회
 * GET /api/biz/restaurants
 */
export const handleListBizRestaurants = async (req, res, next) => {
  try {
    /*
      #swagger.tags = ['Biz']
      #swagger.summary = '사업체 내 식당 전체 조회'
      #swagger.description = '오너가 등록한 모든 식당 목록을 페이지네이션으로 조회합니다.'
      #swagger.parameters['page'] = { in: 'query', required: false, schema: { type: 'integer', example: 1 } }
      #swagger.parameters['size'] = { in: 'query', required: false, schema: { type: 'integer', example: 20 } }
      #swagger.responses[200] = { description: '조회 성공' }
      #swagger.responses[401] = { description: '로그인 필요' }
    */
    const dto = parseListBizRestaurantsRequest(req);
    const result = await listBizRestaurantsSvc(dto);
    return res
      .status(StatusCodes.OK)
      .success(listBizRestaurantsResponseDto(result));
  } catch (err) {
    next(err);
  }
};
