export function mapBadge(b) {
  return { id: b.id, name: b.name, description: b.description, type: b.type };
}

export function mapMyBadge(ub) {
  return {
    id: ub.id, // user_badge row id
    badgeId: ub.badgeId,
    acquiredAt: ub.acquiredAt,
    badge: ub.badge ? mapBadge(ub.badge) : null,
  };
}

export function wrapList({ items, page, size, total, totalPages }) {
  return {
    resultType: "SUCCESS",
    data: { list: items, pagination: { page, size, total, totalPages } },
    error: null,
  };
}

export function wrapListWithExtra({
  items,
  page,
  size,
  total,
  totalPages,
  extra,
}) {
  return {
    resultType: "SUCCESS",
    data: {
      list: items,
      pagination: { page, size, total, totalPages },
      ...(extra ? { ...extra } : {}),
    },
    error: null,
  };
}
