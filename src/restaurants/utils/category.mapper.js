// 한글/영문/별칭 → FoodCategory enum 매핑
// enum: KOREAN | JAPANESE | CHINESE | WESTERN | FASTFOOD | CAFE | ETC
export function toFoodCategoryEnum(input) {
  const s = String(input ?? "")
    .trim()
    .toLowerCase();
  if (!s) return undefined;

  const table = [
    // 한식
    { keys: ["한식", "korean", "ko"], value: "KOREAN" },

    // 일식
    { keys: ["일식", "japanese", "jp"], value: "JAPANESE" },

    // 중식
    { keys: ["중식", "chinese", "cn"], value: "CHINESE" },

    // 양식
    {
      keys: ["양식", "western", "it", "이탈리아", "스테이크"],
      value: "WESTERN",
    },

    // 패스트푸드 (분식/버거/치킨도 여기로 태워도 됨)
    {
      keys: ["패스트푸드", "패푸", "fastfood", "분식", "버거", "치킨"],
      value: "FASTFOOD",
    },

    // 카페
    { keys: ["카페", "cafe", "커피"], value: "CAFE" },

    // 기타
    { keys: ["기타", "etc", "그외"], value: "ETC" },
  ];

  for (const row of table) {
    if (row.keys.includes(s)) return row.value;
  }
  return undefined; // 매칭 안 되면 카테고리 필터 없이 검색
}
