import { TeacherScheduleProvider } from "../../crawler/teacher-schedule-provider.js";


async function main() {
  console.log(await TeacherScheduleProvider.getSchedule("cnp02", "20212"));
}

main();
