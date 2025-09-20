import { addNewStamp } from "../../../stamps/service/stamps.service.js";
export const onCreateNewStamp = async (data) => {
  await addNewStamp(data);
};
