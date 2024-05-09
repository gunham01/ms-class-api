class Student {
  id = 0;
  name = '';

  constructor() {}
}

function getStudentInfoFromTableRow(row) {
  let student = new Student();
  row.forEach((cell, cellIndex) => {
    const cellData = cell.innerHTML.trim();
    // console.log(cell);
    switch (cellIndex) {
      case 1:
        student.id = Number(cellData);
        break;

      case 2:
        student.name = '' + cellData;
        break;

      case 3:
        student.name += ' ' + cellData;
        break;

      default:
        break;
    }
  });

  return student;
}

const studentTableRows = Array.from(
  document.querySelectorAll(
    '#ctl00_ContentPlaceHolder1_ctl00_gvDSSinhVien >tbody>tr',
  ),
)
  .map((row) =>
    Array.from(row.children).map((element) => element.querySelector('span')),
  )
  .slice(1);

let studentList = [];
studentTableRows.forEach((row) =>
  studentList.push(getStudentInfoFromTableRow(row)),
);

return studentList;
