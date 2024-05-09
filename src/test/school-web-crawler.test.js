const {
  TeacherScheduleProvider,
} = require('../crawler/teacher-schedule-provider');
const fs = require('fs/promises');
const { outlookEventService } = require('../service/outlook-event.service');
require('dotenv').config();

jest.setTimeout(120_000);

test('Should fecthed teacher schedule successfully', async () => {
  const teacherScheduleProvider = new TeacherScheduleProvider();
  const teachingWebSchedule = await teacherScheduleProvider.getSchedule(
    'cnp02',
    '20231',
  );

  console.log('Read event count: ' + teachingWebSchedule.events.length);

  // for (const event of teachingWebSchedule.events) {
  //   delete event.students.value;
  // }

  console.log(
    "Read events' summary: ",
    teachingWebSchedule.events.map(
      (event, index) =>
        `${index + 1}. ${event.subjectName} - Nhóm ${
          event.subjectGroup
        } - Diễn ra ${event.occurrences.length}`,
    ),
  );

  await fs.writeFile(
    './src/resource/json/teacher-schedule.json',
    JSON.stringify(teachingWebSchedule, null, 2),
  );
});

test('Should convert to Outlook events correctly', async () => {
  const teacherScheduleProvider = new TeacherScheduleProvider();
  const teachingWebSchedule = await teacherScheduleProvider.getSchedule(
    'CNP02',
    '20221',
  );

  const result = outlookEventService.convertSchoolWebEventToOutlookEvents(
    teachingWebSchedule.events[0],
  );

  await fs.writeFile(
    './src/resource/temp.json',
    JSON.stringify(result, null, 2),
  );
});
