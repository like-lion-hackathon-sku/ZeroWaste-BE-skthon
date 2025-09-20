import EventEmitter from "events";
import { onCreateNewStamp } from "../stamps/service/listener/stamps.listener.js";
import { onSendNotification } from "../notifications/service/listener/notifications.listener.js";

export const initEventEmitter = () => {
  const eventEmitter = new EventEmitter();
  eventEmitter.on("REQUEST_ADD_STAMP", onCreateNewStamp);
  eventEmitter.on("SEND_NOTIFICATION", onSendNotification);
  return eventEmitter;
};

export default initEventEmitter;
