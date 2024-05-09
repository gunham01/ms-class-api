const { EventStatus } = require('@prisma/client');
const Prisma = require('../database/prisma.database');

/**
 * @typedef {import('@prisma/client').MsEvent} MsEvent
 */

class MsEventRepsoitory {
  create(contentInJson, { classId, userId }) {
    return Prisma.msEvent.create({
      data: {
        json: JSON.stringify(contentInJson),
        attendeeSize: contentInJson.attendees.length,
        classId,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  /**
   *
   * @param {any[]} jsonList
   * @param {{ classId: string, userId: string }} param1
   * @returns
   */
  createInBatch(jsonList, { classId, userId }) {
    return Prisma.msEvent.createMany({
      data: jsonList.map((json) => ({
        json: JSON.stringify(json),
        attendeeSize: json.attendees.length,
        classId,
        userId,
      })),
    });
  }

  /**
   * @param {MsEvent} event
   */
  update(event) {
    return Prisma.msEvent.update({
      where: {
        id: event.id,
      },
      data: event,
    });
  }

  /**
   * @param {string} userId
   */
  getByUserIdOrderByAttendeeSizeAsc(userId) {
    return Prisma.msEvent.findMany({
      where: {
        userId,
        status: {
          notIn: [EventStatus.CREATED, EventStatus.CREATE_FAILED],
        },
      },
      orderBy: {
        attendeeSize: 'asc',
      },
    });
  }

  stopAllCreatingEvents() {
    return Prisma.msEvent.updateMany({
      where: {
        status: EventStatus.CREATING,
      },
      data: {
        status: EventStatus.NOT_CREATED,
      },
    });
  }
}

module.exports = new MsEventRepsoitory();
