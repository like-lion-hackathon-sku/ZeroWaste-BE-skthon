export const verifyStampsRequestDto = (payload, body) => {
  return {
    ownerId: payload.id,
    code: body.code,
  };
};
