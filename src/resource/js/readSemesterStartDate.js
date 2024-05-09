const startDateStr = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_lblNote')
  .innerHTML
  .match(/\d+\/\d+\/\d+/)[0];
const semesterSelector = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_ddlChonNHHK');
// @ts-ignore
const seletedSemesterText =semesterSelector.options[semesterSelector.selectedIndex].innerHTML; 
const [index, startYear, endYear] = seletedSemesterText.match(/\d+/g);

// @ts-ignore
return {
  index,
  startDateStr,
  startYear: Number(startYear),
  endYear: Number(endYear),
};
