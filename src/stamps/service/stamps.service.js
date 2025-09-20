import { createStamp } from "../repository/stamps.repository.js";
import { eventEmitter } from "../../index.js";
export const addNewStamp = async (data) => {
  const stampId = await createStamp(data);
  eventEmitter.emit("SEND_NOTIFICATION", {
    eventType: "STAMP_ACQUIRED",
    userId: data.userId,
    stampId,
  });
};
