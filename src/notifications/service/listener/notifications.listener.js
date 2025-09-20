import { sendNewNotification } from "../notifications.service.js";
export const onSendNotification = async (data) => {
  await sendNewNotification(data);
};
