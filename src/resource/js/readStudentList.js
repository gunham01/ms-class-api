class Student {
  id = 0;
  name = "";

  constructor() {}
}

function getStudentInfoFromTableRow(row) {
  let student = new Student();
  $.each(row, (cellIndex, cell) => {
    const cellData = $(cell).text();
    // console.log(cell);
    switch (cellIndex) {
      case 1:
        student.id = Number(cellData);
        break;

      case 2:
        student.name = "" + cellData;
        break;

      case 3:
        student.name += " " + cellData;
        break;

      default:
        break;
    }
  });

  return student;
}

const studentTableRows = $.map(
  $("#ctl00_ContentPlaceHolder1_ctl00_gvDSSinhVien >tbody>tr"),
  (tr) => $(tr).find(">td>span")
).slice(1); // Bỏ dòng đầu tiên, dòng mà chứa tiêu đề của các cột (table headers)
let studentList = [];
studentTableRows.forEach((row) =>
  studentList.push(getStudentInfoFromTableRow(row))
);

return studentList;
