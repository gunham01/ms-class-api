const startDateStr = $('#ctl00_ContentPlaceHolder1_ctl00_lblNote')
  .text()
  .match(/\d+\/\d+\/\d+/)[0];
const seletedSemesterText = $('#ctl00_ContentPlaceHolder1_ctl00_ddlChonNHHK')
  .find(':selected')
  .text();
const [index, startYear, endYear] = seletedSemesterText.match(/\d+/g);

return {
  index,
  startDateStr,
  startYear: Number(startYear),
  endYear: Number(endYear),
};
