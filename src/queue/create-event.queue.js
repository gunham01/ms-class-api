const { JobStatus } = require('@prisma/client');
const Prisma = require('../database/prisma.database');
const { SchoolWebEvent } = require('../model/school-web-event.model');

class CreateEventQueue {
  /**
   * @param {{
   *  classId: string,
   *  creatingClass: SchoolWebEvent,
   *  userId: string
   * }} param0 
   */
  add({ classId, creatingClass, userId }) {
    
    const attendeeSize = creatingClass.occurrences
      .map(({ students: { value } }) => value.length) // get student list length
      .reduce((total, current) => total + current, 0);
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
    const {users, is_check, hasOnlineMeeting, ...necessaryFields}  = creatingClass;
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
   * @param {string} id
   * @param {JobStatus} status
   */
  updateStatus(id, status) {
    return Prisma.createEventQueue.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }
}

module.exports = {
  createEventQueue: new CreateEventQueue(),
};
