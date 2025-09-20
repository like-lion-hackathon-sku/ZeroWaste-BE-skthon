import { verifyStampsResponseDto } from "../dto/response/stamps.response.dto.js";
import { expireStampCode } from "../repository/stamps.repository.js";

export const verifyStamps = async (data) => {
  const customerId = await expireStampCode(data);
  if (customerId === -1) throw new Error("유효하지 않은 쿠폰 번호 입니다.");
  return verifyStampsResponseDto(customerId);
};
