import { createNotification } from "../repository/notifications.repository.js";
export const sendNewNotification = async (data) => {
  const notificationId = await createNotification(data);
  return notificationId;
};
