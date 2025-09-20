// src/badges/controller/badges.controller.js

import {
  parseListBadgesRequest,
  parseListMyBadgesRequest,
} from "../dto/request/badges.request.dto.js";
import { listBadgesSvc, listMyBadgesSvc } from "../service/badges.service.js";
import {
  mapBadge,
  mapMyBadge,
  wrapList,
  wrapListWithExtra,
} from "../dto/response/badges.response.dto.js";

/**
 * 전체 배지 조회
 * GET /api/badges?type=USER|RESTAURANT&page=1&size=20
 */
export const handleListBadges = async (req, res, next) => {
  try {
    /*
      #swagger.summary = '전체 배지 조회'
      #swagger.tags = ['Badges']

      // ✅ 쿼리 파라미터를 인풋 칸으로 보이게 (schema 사용 X)
      #swagger.parameters['type'] = {
        in: 'query',
        name: 'type',
        description: '배지 타입 필터 (생략 시 전체)',
        type: 'string',
        enum: ['USER', 'RESTAURANT']
      }
      #swagger.parameters['page'] = {
        in: 'query',
        name: 'page',
        description: '페이지(1부터)',
        type: 'integer',
        default: 1
      }
      #swagger.parameters['size'] = {
        in: 'query',
        name: 'size',
        description: '페이지 크기(최대 100)',
        type: 'integer',
        default: 20
      }
    */
    const dto = parseListBadgesRequest(req);
    const { items, ...meta } = await listBadgesSvc(dto);
    const payload = items.map(mapBadge);

    return res.status(200).json(wrapList({ items: payload, ...meta }));
  } catch (err) {
    next(err);
  }
};

/**
 * 내 배지 조회
 * GET /api/badges/me?page=1&size=20
 * (인증 필요: cookie 기반 / auth.middleware에서 req.user.id 세팅)
 */
export const handleListMyBadges = async (req, res, next) => {
  try {
    /*
      #swagger.summary = '사용자 배지 조회'
      #swagger.tags = ['Badges']
      #swagger.security = [{ cookieAuth: [] }]
      #swagger.parameters['page'] = {
        in: 'query',
        name: 'page',
        description: '페이지(1부터)',
        type: 'integer',
        default: 1
      }
      #swagger.parameters['size'] = {
        in: 'query',
        name: 'size',
        description: '페이지 크기(최대 100)',
        type: 'integer',
        default: 20
      }
    */
    const dto = parseListMyBadgesRequest(req); // req.user.id는 미들웨어가 보장
    const { rows, reviewCount, ...meta } = await listMyBadgesSvc(dto);
    const payload = rows.map(mapMyBadge);

    // stats.reviewCount를 함께 내려줌 (프론트 한 번에 사용)
    return res.status(200).json(
      wrapListWithExtra({
        items: payload,
        ...meta,
        extra: { stats: { reviewCount } },
      })
    );
  } catch (err) {
    next(err);
  }
};
