function ok(success) {
  return { resultType: "SUCCESS", error: null, success };
}
function fail(error) {
  return { resultType: "FAILURE", error, success: null };
}

/** 주변 식당 검색 응답 DTO */
export const NearbyRestaurantsSuccess = {
  ok: (data) =>
    ok({
      page: data.page,
      size: data.size,
      total: data.total,
      items: (data.items ?? []).map((r) => ({
        id: r.id,
        name: r.name,
        category: r.category,
        address: r.address,
        mapx: r.mapx,
        mapy: r.mapy,
        badges: r.restaurantBadge?.map((rb) => rb.badge?.name) ?? [],
      })),
    }),
  fail,
};

/** 식당 상세 응답 DTO */
export const RestaurantDetailSuccess = {
  ok: (d) =>
    ok({
      id: d.id,
      name: d.name,
      category: d.category,
      address: d.address,
      telephone: d.telephone,
      feedback: d.feedback,
      mapx: d.mapx,
      mapy: d.mapy,
      reviewCount: d._count?.review ?? 0,
      favoriteCount: d._count?.favorite ?? 0,
      isMyFavorite: d.isMyFavorite ?? false,
      photos: d.restaurantPhoto?.map((p) => p.photoName) ?? [],
      menus:
        d.menu?.map((m) => ({ id: m.id, name: m.name, photo: m.photo })) ?? [],
      badges: d.restaurantBadge?.map((rb) => rb.badge?.name) ?? [],
    }),
  fail,
};

/** 식당 리뷰 목록 응답 DTO */
export const RestaurantReviewsSuccess = {
  ok: (data) =>
    ok({
      page: data.page,
      size: data.size,
      total: data.total,
      items: data.items ?? [],
    }),
  fail,
};
