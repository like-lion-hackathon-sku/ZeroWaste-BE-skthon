export const registerRestaurantResponseDto = (data) => {
  return {
    restaurantId: data,
  };
};

// 현준 식당 상세 조회
export const getBizRestaurantDetailResponseDto = ({ restaurant, stats }) => {
  if (!restaurant) return null;

  const {
    id,
    name,
    category,
    address,
    telephone,
    mapx,
    mapy,
    feedback,
    createdAt,
    updatedAt,
    restaurantPhoto = [],
    menu = [],
    stampReward = [],
  } = restaurant;

  return {
    id,
    name,
    category,
    address,
    telephone,
    mapx,
    mapy,
    feedback: feedback ?? null,
    createdAt,
    updatedAt: updatedAt ?? null,

    photos: restaurantPhoto.map((p) => ({
      id: p.id,
      photoName: p.photoName,
      createdAt: p.createdAt,
    })),

    menu: menu.map((m) => ({
      id: m.id,
      name: m.name,
      photo: m.photo,
    })),

    benefits: stampReward
      .slice() // 원본 불변
      .sort((a, b) => a.condition - b.condition)
      .map((b) => ({
        id: b.id,
        condition: b.condition,
        reward: b.reward,
      })),

    stats: {
      reviewCount: stats?.reviewCount ?? 0,
      reviewAvg: stats?.reviewAvg ?? null, // 리뷰 없으면 null
      favoriteCount: stats?.favoriteCount ?? 0,
    },
  };
};

export const deleteBizRestaurantResponseDto = (ok) => {
  return { deleted: !!ok };
};

export const listBizRestaurantsResponseDto = (data) => {
  return {
    page: data.page,
    size: data.size,
    total: data.total,
    items: data.items.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      address: r.address,
      telephone: r.telephone,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    })),
  };
};
