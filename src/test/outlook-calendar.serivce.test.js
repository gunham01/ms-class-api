const dayjs = require('dayjs');
const { outlookEventService } = require('../service/outlook-event.service');
const { MsteamsController } = require('../controller/msteams.controller');
const {
  sampleCreateClassRequestBody,
} = require('./sample/create-class-request-body.sample');
const fs = require('fs/promises');
const { SchoolWebEvent } = require('../model/school-web-event.model');
const creatingClassSample = require('./sample/creating-class.sample');

jest.setTimeout(999999);

const semester = {
  index: 2,
  startDate: dayjs('2023-01-15T17:00:00.000Z').toDate(),
  startYear: 2022,
  endYear: 2023,
};

/**
 * @type {SchoolWebEvent}
 */
const schoolWebEvent = {
  ...sampleCreateClassRequestBody,
  hasOnlineMeeting: true,
  semester: {
    ...sampleCreateClassRequestBody.semester,
    index: Number.parseInt(sampleCreateClassRequestBody.semester.index),
    startDate: dayjs(sampleCreateClassRequestBody.semester.startDate).toDate(),
  },
};

test('Test dayjs', () => {
  console.log(dayjs(semester.startDate).add(10, 'weeks').format('DD/MM/YYYY'));
});

test('Should convert to outlook calendar entity without error thrown', async () => {
  const outlookEvent =
    outlookEventService.convertSchoolWebEventToOutlookEvents(
      creatingClassSample,
    );
  global.console = console;

  await fs.writeFile(
    './src/resource/temp.json',
    JSON.stringify(outlookEvent, null, 2),
  );
});

test('Should convert date string to date ranges correctly', () => {
  outlookEventService.convertWeekStringToDateRanges('-------8901--45', dayjs());
});

test('Should create class with online meetings', async () => {
  const msTeamController = new MsteamsController();

  const serverResponse = await msTeamController.createClasses({
    body: {
      data: [sampleCreateClassRequestBody],
    },
    // @ts-ignore
    user: {
      email: 'stdse@vnua.edu.vn',
      msAccessToken:
        'eyJ0eXAiOiJKV1QiLCJub25jZSI6InhpMEhmRHMyd0JjZlFwWnBWRGl2SVZ3ZXB2UlhZRGhCNXBMaTY1d0pEdzQiLCJhbGciOiJSUzI1NiIsIng1dCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyIsImtpZCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC84NDUxMTVlNy1hOWNiLTRhZGMtYjZkMy0xNWExMWQzNTI5NjIvIiwiaWF0IjoxNjg3OTUxOTEzLCJuYmYiOjE2ODc5NTE5MTMsImV4cCI6MTY4Nzk1NjM0MywiYWNjdCI6MCwiYWNyIjoiMSIsImFpbyI6IkFWUUFxLzhUQUFBQUNZVzA0ZFFUZjJwbEt2KzQ1UUhjVEkvUk4va1p3aUkwRm1yRlJnZ0FhZ0QvR0R3ZkF3dnF3TnRqZ2ZodG5RSjZ2U0Q3a29Id2FtTG0zY2JxTFlqdmlDZE9UZHpENHN3Mlpvd3ZRQTlVL1hVPSIsImFtciI6WyJwd2QiLCJtZmEiXSwiYXBwX2Rpc3BsYXluYW1lIjoiVlBIViIsImFwcGlkIjoiZTJjNDRlYzAtYmMxMC00NWMwLThjZDYtZGY4YzJmMTMwOTVlIiwiYXBwaWRhY3IiOiIxIiwiaWR0eXAiOiJ1c2VyIiwiaXBhZGRyIjoiMTQuMTkxLjM1LjIxNCIsIm5hbWUiOiJC4buZIG3DtG4gQ05QTSIsIm9pZCI6IjEwZDdlZmQzLWJmZmYtNGJlNS05MjE4LTNiM2E0MzE2NWViMSIsInBsYXRmIjoiMyIsInB1aWQiOiIxMDAzMjAwMUVDMDMwQzM4IiwicmgiOiIwLkFYSUE1eFZSaE11cDNFcTIweFdoSFRVcFlnTUFBQUFBQUFBQXdBQUFBQUFBQUFCeUFJQS4iLCJzY3AiOiJDYWxlbmRhcnMuUmVhZFdyaXRlIENoYW5uZWwuQ3JlYXRlIENoYW5uZWxNZXNzYWdlLlNlbmQgR3JvdXAuUmVhZFdyaXRlLkFsbCBPbmxpbmVNZWV0aW5ncy5SZWFkV3JpdGUgb3BlbmlkIHByb2ZpbGUgVGVhbS5DcmVhdGUgVGVhbS5SZWFkQmFzaWMuQWxsIFRlYW1NZW1iZXIuUmVhZFdyaXRlLkFsbCBVc2VyLlJlYWQgZW1haWwiLCJzaWduaW5fc3RhdGUiOlsia21zaSJdLCJzdWIiOiJaTXlSeFBONy1tLUZZRmUwdEtuLW1aaERVYkNFTXdZQTU1UV9vU2lWeGM4IiwidGVuYW50X3JlZ2lvbl9zY29wZSI6IkFTIiwidGlkIjoiODQ1MTE1ZTctYTljYi00YWRjLWI2ZDMtMTVhMTFkMzUyOTYyIiwidW5pcXVlX25hbWUiOiJzdGRzZUB2bnVhLmVkdS52biIsInVwbiI6InN0ZHNlQHZudWEuZWR1LnZuIiwidXRpIjoiRkVmN1FtLVZSa09kMUFVOFFhZzVBQSIsInZlciI6IjEuMCIsIndpZHMiOlsiYjc5ZmJmNGQtM2VmOS00Njg5LTgxNDMtNzZiMTk0ZTg1NTA5Il0sInhtc19zdCI6eyJzdWIiOiJhVlJLNlk5Qk1SMi00SThmMHVuRS1MbkdkN0tpSzFFMDQxNHZPUF81ZWhNIn0sInhtc190Y2R0IjoxNDQ5MTM0MjQyfQ.HNi3qiw7o54v0dD7ogj8BC-GEs5wRP8PYYNRM09EU32T-fi2nrZfTyusbR6xClLU5aZGzTsEUe6De9-j-U1zPW2pLD_LPnEVsBYydLX-JXmrjwOhrUa8-vMWDN02s1XY8p438nSoIa5U_sYDtoMyNAxJRcJHqq469J_5v09rvABexX-6n0im6kCiNkIjMhi2eg52q7dabePngWA_XOl32CxYutLpu9LGpf_j3RAzmWsvycXkSQNM5ATO8AcazswR74OF5m-YSx3WvYAp5WD-ZjxigbDCvN-OhwDF7BV4X4g-DcVfcByfA10Eq4GxplHHPJphPHkKK1tW6Y22tWEHaw',
    },
  });

  expect(serverResponse.status).toBeLessThan(300);
});
