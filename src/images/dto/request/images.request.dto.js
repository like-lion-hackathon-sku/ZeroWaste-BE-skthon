export const getPhotoUrlRequestDto = (params) => {
  return {
    type: parseInt(params.fileType),
    name: params.fileName,
  };
};
