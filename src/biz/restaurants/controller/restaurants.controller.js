import { StatusCodes } from "http-status-codes";
import { registerRestaurant } from "../service/restaurants.service.js";
import { registerRestaurantRequestDto } from "../dto/request/restaurants.request.dto.js";
import {
  listMyBizRestaurants,
  getMyBizRestaurantDetail,
  removeMyBizRestaurant,
} from "../service/restaurants.service.js";
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
    registerRestaurantRequestDto(req.body, req.files, req.payload),
  );
  res.status(StatusCodes.CREATED).success(result);
};

export const handleListMyBizRestaurants = async (req, res, next) => {
  /*
      #swagger.tags = ['Biz']
      #swagger.summary = '내 사업체 식당 목록 조회'
      #swagger.description = 'owner(사장님) 본인이 등록한 식당 목록을 페이지네이션으로 조회합니다.'
      #swagger.security = [{ "bearerAuth": [] }]
      #swagger.parameters['page'] = {
        in: 'query',
        required: false,
        schema: { type: 'integer', default: 1, minimum: 1 },
        description: '페이지(1부터 시작)'
      }
      #swagger.parameters['size'] = {
        in: 'query',
        required: false,
        schema: { type: 'integer', default: 20, minimum: 1, maximum: 50 },
        description: '페이지 크기(최대 50)'
      }
      #swagger.responses[200] = {
        description: '조회 성공',
        schema: {
          resultType: 'SUCCESS',
          error: null,
          success: {
            page: 1,
            size: 20,
            total: 123,
            items: [
              {
                id: 101,
                name: '테스트 식당',
                category: 'KOREAN',
                address: '서울특별시 어딘가 1-2',
                telephone: '02-1234-5678',
                mapx: 1270123456,
                mapy: 375987654,
                createdAt: '2025-09-20T12:34:56.000Z',
                updatedAt: '2025-09-20T12:34:56.000Z'
              }
            ]
          }
        }
      }
      #swagger.responses[401] = {
        description: '인증 필요',
        schema: { resultType: 'FAILURE', error: 'UNAUTHORIZED', success: null }
      }
    */
  try {
    const ownerId = req.payload?.id ?? req.user?.id;
    if (!ownerId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        resultType: "FAILURE",
        error: "UNAUTHORIZED",
        success: null,
      });
    }
    const page = Math.max(1, parseInt(req.query.page ?? "1", 10) || 1);
    const size = Math.min(
      50,
      Math.max(1, parseInt(req.query.size ?? "20", 10) || 20),
    );

    const data = await listMyBizRestaurants({ ownerId, page, size });
    return res.status(StatusCodes.OK).success(data);
  } catch (e) {
    next(e);
  }
};

/* 내 식당 상세 조회 */
export const handleGetMyBizRestaurantDetail = async (req, res, next) => {
  /*
      #swagger.tags = ['Biz']
      #swagger.summary = '내 사업체 식당 상세 조회'
      #swagger.description = 'owner(사장님) 본인이 등록한 식당의 상세 정보를 조회합니다.'
      #swagger.security = [{ "bearerAuth": [] }]
      #swagger.parameters['restaurantId'] = {
        in: 'path',
        required: true,
        schema: { type: 'integer', example: 123 },
        description: '조회할 식당 ID'
      }
      #swagger.responses[200] = {
        description: '조회 성공',
        schema: {
          resultType: 'SUCCESS',
          error: null,
          success: {
            id: 123,
            name: '테스트 식당',
            category: 'KOREAN',
            address: '서울특별시 어딘가 1-2',
            telephone: '02-1234-5678',
            mapx: 1270123456,
            mapy: 375987654,
            createdAt: '2025-09-20T12:34:56.000Z',
            updatedAt: '2025-09-20T12:34:56.000Z',
            restaurantPhoto: [
              { id: 1, restaurantId: 123, photoName: 'rest_abc.jpg', createdAt: '2025-09-20T12:34:56.000Z' }
            ],
            menu: [
              { id: 10, restaurantId: 123, name: '비빔밥', photo: 'menu_xxx.jpg' }
            ],
            stampReward: [
              { id: 5, restaurantId: 123, condition: 5, reward: '군만두 4개' }
            ]
          }
        }
      }
      #swagger.responses[400] = {
        description: '잘못된 식당 ID',
        schema: { resultType: 'FAILURE', error: 'INVALID_RESTAURANT_ID', success: null }
      }
      #swagger.responses[401] = {
        description: '인증 필요',
        schema: { resultType: 'FAILURE', error: 'UNAUTHORIZED', success: null }
      }
      #swagger.responses[404] = {
        description: '식당 없음(또는 접근 권한 없음)',
        schema: { resultType: 'FAILURE', error: 'RESTAURANT_NOT_FOUND_OR_FORBIDDEN', success: null }
      }
    */
  try {
    const ownerId = req.payload?.id ?? req.user?.id;
    if (!ownerId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        resultType: "FAILURE",
        error: "UNAUTHORIZED",
        success: null,
      });
    }
    const restaurantId = Number(req.params.restaurantId);
    if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        resultType: "FAILURE",
        error: "INVALID_RESTAURANT_ID",
        success: null,
      });
    }

    const row = await getMyBizRestaurantDetail({ ownerId, restaurantId });
    return res.status(StatusCodes.OK).success(row);
  } catch (e) {
    if (e.status === 404) {
      return res.status(StatusCodes.NOT_FOUND).json({
        resultType: "FAILURE",
        error: "RESTAURANT_NOT_FOUND_OR_FORBIDDEN",
        success: null,
      });
    }
    next(e);
  }
};

/* 내 식당 삭제 */
export const handleDeleteMyBizRestaurant = async (req, res, next) => {
  /*
      #swagger.tags = ['Biz']
      #swagger.summary = '내 사업체 식당 삭제'
      #swagger.description = 'owner(사장님) 본인이 등록한 식당을 삭제합니다.'
      #swagger.security = [{ "bearerAuth": [] }]
      #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: 'object',
              required: ['restaurantId'],
              properties: {
                restaurantId: { type: 'integer', example: 123, description: '삭제할 식당 ID' }
              }
            }
          }
        }
      }
      #swagger.responses[200] = {
        description: '삭제 성공',
        schema: { resultType: 'SUCCESS', error: null, success: { deleted: true } }
      }
      #swagger.responses[400] = {
        description: '잘못된 요청(restaurantId 없음 또는 음수/0)',
        schema: { resultType: 'FAILURE', error: 'RESTAURANT_ID_REQUIRED', success: null }
      }
      #swagger.responses[401] = {
        description: '인증 필요',
        schema: { resultType: 'FAILURE', error: 'UNAUTHORIZED', success: null }
      }
      #swagger.responses[404] = {
        description: '식당 없음(또는 접근 권한 없음)',
        schema: { resultType: 'FAILURE', error: 'RESTAURANT_NOT_FOUND_OR_FORBIDDEN', success: null }
      }
    */
  try {
    const ownerId = req.payload?.id ?? req.user?.id;
    if (!ownerId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        resultType: "FAILURE",
        error: "UNAUTHORIZED",
        success: null,
      });
    }
    const { restaurantId } = req.body ?? {};
    const rid = Number(restaurantId);
    if (!Number.isInteger(rid) || rid <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        resultType: "FAILURE",
        error: "RESTAURANT_ID_REQUIRED",
        success: null,
      });
    }

    const result = await removeMyBizRestaurant({ ownerId, restaurantId: rid });
    return res.status(StatusCodes.OK).success(result);
  } catch (e) {
    if (e.status === 404) {
      return res.status(StatusCodes.NOT_FOUND).json({
        resultType: "FAILURE",
        error: "RESTAURANT_NOT_FOUND_OR_FORBIDDEN",
        success: null,
      });
    }
    next(e);
  }
};
