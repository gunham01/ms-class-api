class TeachingEvents {
  subjectId;
  subjectName;
  subjectGroup;
  credit;
  classCodes;
  credit;
  practiceGroup;
  
  dayOfWeekIndex;
  startPeriod;
  endPeriod;
  weekStr;

  location;
  students = {
    listUrl: ""
  };
}

function removeDuplicatedClassNames(classesStr) {
    const classNames = classesStr.split(', ');
    return classNames
        .filter((item, index) => classNames.lastIndexOf(item) === index)
        .join(", ");
}

function isNumber(numberStr) {
    return /^\d+(.\d+)?$/.test(numberStr);
}

function isBlankOrNull(str) {
    return /^\s*\n*$/.test(str) || !str;
}

const tableRows = $.map($('.grid-roll2>table>tbody>tr'), tr => $(tr).find('>td'));
const events = [];
tableRows.forEach((row) => {
  let event = new TeachingEvents();
  $.each(row, (cellIndex, cell) => {
    const cellText = $(cell).text();
    switch (cellIndex) {
      case 0:
        event.subjectId = cellText;
        break;

      case 1:
        event.subjectName = cellText;
        break;

      case 2:
        event.subjectGroup = Number(cellText);
        break;

      case 3:
        event.credit = Number(cellText);
        break;

      case 4:     // Mã lớp
        const classCode = cellText;
        event.classCodes = removeDuplicatedClassNames(classCode);
        break;

      case 6:
        break;

      case 7:     // Nhóm thực hành
        const practiceGroup = cellText.trim().replace('\n', '');
        event.practiceGroup = isBlankOrNull(practiceGroup) ? null : practiceGroup.trim();
        break;

      case 8:
        event.dayOfWeekIndex = ["Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy", "CN"].indexOf(cellText);
        break;

      case 9:
        event.startPeriod = Number(cellText);
        break;

      case 10:    // Số tiết
        event.endPeriod = event.startPeriod + Number(cellText) - 1;
        // console.log('period: ', event.time.period)
        break;

      case 11:
        event.location = cellText;
        break;
        
      case 13:
        event.weekStr = cellText.trim();
        break;

      case 14:    // DSSV
        event.students.listUrl = cell.querySelector('a').href;
        break;
      }
  });

  events.push(event);
})

return events;
