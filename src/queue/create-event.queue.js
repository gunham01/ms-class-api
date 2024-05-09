const { JobStatus } = require('@prisma/client');
const Prisma = require('../database/prisma.database');
const { SchoolWebEvent } = require('../model/school-web-event.model');
const { outlookEventService } = require('../service/outlook-event.service');

class CreateEventQueue {
  /**
   * @param {{
   *  classId: string,
   *  creatingClass: SchoolWebEvent,
   *  userId: string
   * }} param0
   */
  add({ classId, creatingClass, userId }) {
    const msEvents =
      outlookEventService.convertSchoolWebEventToOutlookEvents(creatingClass);
    const attendeeSize = msEvents.reduce((a, b) => a + b.attendees.length, 0);
    return Prisma.createEventQueue.create({
      data: {
        classId,
        attendeeSize: attendeeSize,
        studySchedule: JSON.stringify(creatingClass),
        userId,
      },
    });
  }

  removeUnnecessaryFields(creatingClass) {
    const { users, is_check, hasOnlineMeeting, ...necessaryFields } =
      creatingClass;
    return necessaryFields;
  }

  /**
   * @param {string} userId
   */
  getUserNonCreatedEvents(userId) {
    return Prisma.createEventQueue.findMany({
      where: {
        userId,
        status: 'STALE',
      },
    });
  }

  staleAllInProgessJobs() {
    return Prisma.createEventQueue.updateMany({
      where: {
        status: 'PENDING',
      },
      data: {
        status: 'STALE',
      },
    });
  }

  /**
   *
   * @param {import('@prisma/client').CreateEventQueue} record
   * @param {JobStatus} newStatus
   */
  updateStatus(record, newStatus) {
    return Prisma.createEventQueue.update({
      where: {
        id: record.id,
      },
      data: {
        status: newStatus,
        retryCount:
          record.status === JobStatus.FAIL ? { increment: 1 } : undefined,
      },
    });
  }
}

module.exports = {
  createEventQueue: new CreateEventQueue(),
};
