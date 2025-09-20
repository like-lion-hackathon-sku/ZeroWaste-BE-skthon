import { prisma } from "../../db.config.js";
export const createNotification = async (data) => {
  return await prisma.$transaction(async (tx) => {
    const notification = await tx.notification.create({
      data: {
        type: data.eventType,
      },
    });
    if (data.eventType === "STAMP_ACQUIRED") {
      await tx.stampNotification.create({
        data: {
          stampId: data.stampId,
          notificationId: notification.id,
        },
      });
    } else if (data.eventType === "BADGE_ACQUIRED") {
      await tx.badgeNotification.create({
        data: {
          badgeId: data.badgeId,
          notificationId: notification.id,
        },
      });
    } else if (data.eventType === "BIZ_BADGE_ACQUIRED") {
      await tx.restaurantBadgeNotification.create({
        data: {
          badgeId: data.badgeId,
          notificationId: notification.id,
        },
      });
    } else if (data.eventType === "BIZ_NEW_REVIEW") {
      await tx.reviewNotification.create({
        data: {
          reviewId: data.reviewId,
          notificatonId: notification.id,
        },
      });
    }
    const acceptedNotification = await tx.acceptedNotification.create({
      data: {
        notificationId: notification.id,
        userId: data.userId,
      },
    });
    return acceptedNotification.id;
  });
};
