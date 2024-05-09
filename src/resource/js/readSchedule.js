// Ten lich tren Outlook
// ${subjectId}-${subjectName}-Nhom${subjectGroup}-HK${semesterIndex}-NH(${startYear} - ${endYear})

class TeachingEventOcurrence {
  dayOfWeeks = [];
  startPeriod;
  endPeriod;
  weekStr;
  location;
  practiceGroup;
  students = {
    listUrl: '',
  };
}

class TeachingEvent {
  subjectId;
  subjectName;
  subjectGroup;
  credit;
  classCodes;

  occurrences = [{}];
  students = {
    listUrl: '',
  };
}

function removeDuplicatedClassNames(classesStr) {
  const classNames = classesStr.split(', ');
  return classNames
    .filter((item, index) => classNames.lastIndexOf(item) === index)
    .join(', ');
}

function isNumber(numberStr) {
  return /^\d+(.\d+)?$/.test(numberStr);
}

function isBlankOrNull(str) {
  return /^\s*\n*$/.test(str) || !str;
}

// const tableRows = $.map($('.grid-roll2>table>tbody>tr'), (tr) =>
//   // @ts-ignore
//   $(tr).find('>td'),
// );
const tableRows = Array.from(
  document.querySelectorAll('.grid-roll2>table>tbody>tr'),
).map((row) =>
  Array.from(row.children).map(
    (cell) => cell.querySelector('td div') ?? cell.querySelector('td') ?? cell,
  ),
);
console.log('[INFO]  tableRows:', tableRows)

const events = [];
tableRows.forEach((row) => {
  let newEvent = new TeachingEvent();
  row.forEach((cell, cellIndex) => {
    const cellText = cell.innerHTML.trim().replace(/\&amp;/g, 'và');
    switch (cellIndex) {
      case 0:
        newEvent.subjectId = cellText;
        break;

      case 1:
        newEvent.subjectName = cellText;
        break;

      case 2:
        newEvent.subjectGroup = Number(cellText);
        break;

      case 3:
        newEvent.credit = Number(cellText);
        break;

      case 4: // Mã lớp
        const classCode = cellText;
        newEvent.classCodes = removeDuplicatedClassNames(classCode);
        break;

      case 6:
        break;

      case 7: // Nhóm thực hành
        const practiceGroup = cellText.trim().replace('\n', '');
        newEvent.occurrences[0].practiceGroup = isBlankOrNull(practiceGroup)
          ? null
          : practiceGroup.trim();
        break;

      case 8:
        newEvent.occurrences[0].dayOfWeeks = [
          ['Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy', 'CN'].indexOf(cellText),
        ];
        break;

      case 9:
        newEvent.occurrences[0].startPeriod = Number(cellText);
        break;

      case 10: // Số tiết
        newEvent.occurrences[0].endPeriod =
          newEvent.occurrences[0].startPeriod + Number(cellText) - 1;
        break;

      case 11:
        newEvent.occurrences[0].location = cellText;
        break;

      case 13:
        newEvent.occurrences[0].weekStr = cellText.trim();
        break;

      case 14: // DSSV
        newEvent.students.listUrl = cell.querySelector('a').href;
        newEvent.occurrences[0].students = {
          listUrl: cell.querySelector('a').href,
        };
        break;
    }
  });

  if (
    [newEvent.classCodes, newEvent.students.listUrl].find(
      (str) => !str || str.length === 0,
    )
  ) {
    return;
  }

  // If there's any existing event has the same location and week string,
  // then this new event is that existing event's occurence
  for (const event of events) {
    const newEventOccurence = newEvent.occurrences[0];
    const isSameSubjectGroup =
      event.subjectName === newEvent.subjectName &&
      event.subjectGroup === newEvent.subjectGroup;
    if (isSameSubjectGroup) {
      let hasPushNewOccurence = false;
      for (const occurence of event.occurrences) {
        const hasDifferentTimeRange =
          occurence.startPeriod !== newEventOccurence.startPeriod ||
          occurence.endPeriod !== newEventOccurence.endPeriod;
        if (
          occurence.location === newEventOccurence.location &&
          occurence.weekStr === newEventOccurence.weekStr &&
          hasDifferentTimeRange &&
          !newEventOccurence.practiceGroup
        ) {
          occurence.dayOfWeeks.push(newEventOccurence.dayOfWeeks[0]);
          hasPushNewOccurence = true;
          break;
        }
      }

      if (!hasPushNewOccurence) {
        event.occurrences.push({
          ...newEventOccurence,
          students: {
            listUrl: newEventOccurence.practiceGroup
              ? newEvent.students.listUrl
              : event.students.listUrl,
          },
        });
      }
      return;
    }
  }

  events.push(newEvent);
});

console.log(events);
// @ts-ignore
return events;
