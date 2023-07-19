const { Dayjs } = require('dayjs');
const dayjs = require('dayjs');
const {
  DAY_OF_WEEKS: DAYS_OF_WEEK,
  SCHOOL_PERIOD,
} = require('../constant/date.constant');
const {
  SchoolWebEvent,
  SchoolWebEventOccurrence,
} = require('../model/school-web-event.model');
const { Student } = require('../model/student.model');

/**
 * @typedef {{
 *  index: number,
 *  startDate: Date,
 *  startYear: number,
 *  endYear: number
 * }} Semester
 */
/**
 * @typedef {ReturnType<OutlookEventService['convertSchoolWebEventToOutlookEvents']>} OutlookEvent
 */

class OutlookEventService {

  /**
   * @param {SchoolWebEvent} schoolWebEvent
   */
  convertSchoolWebEventToOutlookEvents(schoolWebEvent) {
    const recurrences = this.generateRecurrences(
      schoolWebEvent,
      schoolWebEvent.semester.startDate
    );

    return recurrences.map((recurrence) => {
      const { other, ...outlookEventRecurrence } = recurrence;
      const { startPeriod, endPeriod } = other;
      const startTimeEndTimePair = this.generateStartEnd(
        dayjs(recurrence.range.startDate),
        {
          startPeriod,
          endPeriod,
        }
      );

      return {
        subject:
          (process.env.ENV === 'dev' ? '[Test - Vui lòng bỏ qua] ' : '') +
          this.generateSubject(schoolWebEvent),
        body: this.generateBody(recurrence, startTimeEndTimePair),
        ...startTimeEndTimePair,
        recurrence: outlookEventRecurrence,
        attendees: this.generateAttendees(recurrence.other.students),
        isOnlineMeeting: !!schoolWebEvent.hasOnlineMeeting,
        ...(schoolWebEvent.hasOnlineMeeting && {
          onlineMeetingProvider: 'teamsForBusiness',
        }),
      };
    });
  }

  /**
   * @param {SchoolWebEvent} schoolWebEvent
   */
  generateSubject(schoolWebEvent) {
    const {
      index: semesterIndex,
      startYear,
      endYear,
    } = schoolWebEvent.semester;
    const semesterStartYearLastTwoDigit = String(startYear).slice(-2);
    const semesterEndYearLastTwoDigit = String(endYear).slice(-2);

    return (
      `${schoolWebEvent.subjectId}-${schoolWebEvent.subjectName}-Nhom${schoolWebEvent.subjectGroup}` +
      `-HK${semesterIndex}-${semesterStartYearLastTwoDigit}-${semesterEndYearLastTwoDigit}`
    );
  }

  /**
   * @param {{
   *  pattern: { daysOfWeek: string[] }
   *  range: { startDate: string, endDate: string }
   *  other: { practiceGroup: string | null }
   * }} recurrence
   * @param {{
   *  start: {dateTime: string},
   *  end: {dateTime: string}
   * }} startEndTime
   */
  generateBody(recurrence, startEndTime) {
    const {
      pattern: { daysOfWeek },
      range: { startDate: startDateStr, endDate: endDateStr },
      other: { practiceGroup },
    } = recurrence;
    const {
      start: { dateTime: startTimeStr },
      end: { dateTime: endTimeStr },
    } = startEndTime;
    const daysOfWeekInVietnamese = {
      Monday: 'thứ Hai',
      Tuesday: 'thứ Ba',
      Wednesday: 'thứ Tư',
      Thursday: 'thứ Năm',
      Friday: 'thứ Sáu',
      Saturday: 'thứ Bảy',
      Sun: 'Chủ Nhật',
    };

    const startDate = dayjs(startDateStr);
    const endDate = dayjs(endDateStr);
    const startTime = dayjs(startTimeStr);
    const endTime = dayjs(endTimeStr);

    return {
      contentType: 'HTML',
      content:
        // `<b>Tên học phần</b>: ${schoolWebEvent.subjectName}<br>` +
        // `<b>Nhóm học phần</b>: ${schoolWebEvent.subjectGroup}<br>` +
        // `<b>Mã học phần</b>: ${schoolWebEvent.subjectId}<br>` +
        // `<b>Phòng</b>: ${location}<br>` +
        (practiceGroup ? `Nhóm thực hành: ${practiceGroup}<br>` : '') +
        `${startTime.format('H:mm')} - ` +
        `${endTime.format('H:mm')} ` +
        `${daysOfWeek
          .map((dayOfWeek) => daysOfWeekInVietnamese[dayOfWeek])
          .join(', ')} ` +
        `hàng tuần, từ ${startDate.format('DD/MM/YYYY')} - ` +
        `${endDate.format('DD/MM/YYYY')}`,
    };
  }

  /**
   * @param {Dayjs} firstStudyDate
   * @param {{startPeriod: number, endPeriod: number}} schoolPeriod
   */
  generateStartEnd(firstStudyDate, schoolPeriod) {
    const [startPeriodTime, endPeriodTime] = [
      SCHOOL_PERIOD[schoolPeriod.startPeriod],
      SCHOOL_PERIOD[schoolPeriod.endPeriod],
    ];
    const startPeriodDateTime = firstStudyDate
      .hour(startPeriodTime.start.hour)
      .minute(startPeriodTime.start.minute)
      .second(0);
    const endPeriodDateTime = firstStudyDate
      .hour(endPeriodTime.end.hour)
      .minute(endPeriodTime.end.minute)
      .second(0);
    const timeZone = 'Asia/Bangkok';
    return {
      start: {
        dateTime: `${startPeriodDateTime.format('YYYY-MM-DDTHH:mm:ss')}`,
        timeZone,
      },
      end: {
        dateTime: `${endPeriodDateTime.format('YYYY-MM-DDTHH:mm:ss')}`,
        timeZone,
      },
    };
  }

  /**
   * @param {SchoolWebEvent} schoolWebEvent
   * @param {Date} semesterStartDate
   */
  generateRecurrences(schoolWebEvent, semesterStartDate) {
    const result = [];
    const occurrences = this.mergeRecurrencesHaveSameDateRangeAndTimeRange(
      schoolWebEvent.occurrences
    );
    for (const occurence of occurrences) {
      const dateRange = this.convertWeekStringToDateRanges(
        occurence.weekStr,
        dayjs(semesterStartDate)
      );

      const recurrence = dateRange.map(({ start, end }) => ({
        pattern: {
          type: 'weekly',
          interval: 1,
          daysOfWeek: occurence.dayOfWeeks.map(
            (dayOfWeek) => DAYS_OF_WEEK[dayOfWeek]
          ),
        },
        range: {
          type: 'endDate',
          startDate: start.format('YYYY-MM-DD'),
          endDate: end.format('YYYY-MM-DD'),
        },
        other: {
          startPeriod: occurence.startPeriod,
          endPeriod: occurence.endPeriod,
          practiceGroup: occurence.practiceGroup,
          students: occurence.students.value,
        },
      }));

      result.push(...recurrence);
    }

    return result;
  }

  /**
   * @private
   * @param {SchoolWebEventOccurrence[]} occurrences
   */
  mergeRecurrencesHaveSameDateRangeAndTimeRange(occurrences) {
    /**
     * @type {SchoolWebEventOccurrence[]}
     */
    const result = [];
    for (const recurrence of occurrences) {
      const existedRecurrence = result.find(
        (item) =>
          item.startPeriod === recurrence.startPeriod &&
          item.endPeriod === recurrence.endPeriod &&
          !item.practiceGroup &&
          !recurrence.practiceGroup
      );
      if (existedRecurrence) {
        existedRecurrence.dayOfWeeks.push(...recurrence.dayOfWeeks);
      } else {
        result.push(recurrence);
      }
    }

    return result;
  }

  /**
   * @param {string} weekString
   * @param {Dayjs} semesterStartDate
   * @return {{start: Dayjs, end: Dayjs}[]}
   */
  convertWeekStringToDateRanges(weekString, semesterStartDate) {
    const weekStringArray = [...weekString];
    const result = [];
    let start = 0,
      end = 0;
    while (start < weekStringArray.length) {
      const currentStartWeekIsRestWeek = weekStringArray[start] === '-';
      if (currentStartWeekIsRestWeek) {
        start++;
      } else {
        end = start;
        while (weekStringArray[end] !== '-' && end < weekStringArray.length) {
          end++;
        }
        result.push({ start: start + 1, end });
        start = end;
      }
    }

    return result.map((item) => ({
      start: semesterStartDate.add(item.start - 1, 'week'),
      end: semesterStartDate.add(item.end - 1, 'week').day(7), // day(7) = To this week Sunday
    }));
  }

  /**
   * @param {Student[]} students
   */
  generateAttendees(students) {
    const result = students.map((student) => ({
      emailAddress: {
        address: `${student.id}@sv.vnua.edu.vn`,
      },
    }));
    console.log('[LOG] : Real attendee list:', result)
    

    if (process.env.ENV === 'dev') {
      return ['637749@sv.vnua.edu.vn'].map((email) => ({
        emailAddress: {
          address: email,
        },
      }));
    }

  }
}

const outlookEventService = new OutlookEventService();
module.exports = {
  outlookEventService: Object.freeze(outlookEventService),
  OutlookEventService,
};
