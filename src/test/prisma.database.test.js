const { HttpMethod, ResponseType } = require('@prisma/client');
const Prisma = require('../database/prisma.database');
const dayjs = require('dayjs');

test('Should run with no thrown error', async () => {
  await Prisma.msGraphApiLog.create({
    data: {
      user: {
        connect: { id: '176b700e-788c-4718-8465-2542c5253507' },
      },
      method: HttpMethod.GET,
      requestUrl: '/me',
      requestBody: 'null',
      responseStatus: 200,
      responseBody: 'null',
      type: ResponseType.SUCCESS,
    },
  });
});

const accessToken =
  'eyJ0eXAiOiJKV1QiLCJub25jZSI6Imotc2ItTFdMM2pUeWZkX1ZTN25OMldZNWg5MG9EbUdfdVdzVW9xZi02bFEiLCJhbGciOiJSUzI1NiIsIng1dCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyIsImtpZCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC84NDUxMTVlNy1hOWNiLTRhZGMtYjZkMy0xNWExMWQzNTI5NjIvIiwiaWF0IjoxNjk1NjQ5NzMxLCJuYmYiOjE2OTU2NDk3MzEsImV4cCI6MTY5NTY1NDQxOCwiYWNjdCI6MCwiYWNyIjoiMSIsImFpbyI6IkFWUUFxLzhVQUFBQWxad2hNS01ROGxWSHBpRng1bmVMbnJtNWlCNThhMExoTnhjTEQrSnFCTnJUTFkvN1lMSXIrbUVSV0EzdHlJM2d3THUyNzNZa3dLY1p4b2lmZTdFM3pKZFIrNHhkUmFMRm1WVmkxMHJZRjhJPSIsImFtciI6WyJwd2QiLCJtZmEiXSwiYXBwX2Rpc3BsYXluYW1lIjoiVlBIViIsImFwcGlkIjoiZTJjNDRlYzAtYmMxMC00NWMwLThjZDYtZGY4YzJmMTMwOTVlIiwiYXBwaWRhY3IiOiIxIiwiaWR0eXAiOiJ1c2VyIiwiaXBhZGRyIjoiMTQuMTkxLjMzLjQ5IiwibmFtZSI6IkLhu5kgbcO0biBDTlBNIiwib2lkIjoiMTBkN2VmZDMtYmZmZi00YmU1LTkyMTgtM2IzYTQzMTY1ZWIxIiwicGxhdGYiOiIzIiwicHVpZCI6IjEwMDMyMDAxRUMwMzBDMzgiLCJyaCI6IjAuQVhJQTV4VlJoTXVwM0VxMjB4V2hIVFVwWWdNQUFBQUFBQUFBd0FBQUFBQUFBQUREQUlBLiIsInNjcCI6IkNhbGVuZGFycy5SZWFkV3JpdGUgQ2hhbm5lbC5DcmVhdGUgQ2hhbm5lbE1lc3NhZ2UuU2VuZCBHcm91cC5SZWFkV3JpdGUuQWxsIE9ubGluZU1lZXRpbmdzLlJlYWRXcml0ZSBvcGVuaWQgcHJvZmlsZSBUZWFtLkNyZWF0ZSBUZWFtLlJlYWRCYXNpYy5BbGwgVGVhbU1lbWJlci5SZWFkV3JpdGUuQWxsIFVzZXIuUmVhZCBlbWFpbCIsInN1YiI6IlpNeVJ4UE43LW0tRllGZTB0S24tbVpoRFViQ0VNd1lBNTVRX29TaVZ4YzgiLCJ0ZW5hbnRfcmVnaW9uX3Njb3BlIjoiQVMiLCJ0aWQiOiI4NDUxMTVlNy1hOWNiLTRhZGMtYjZkMy0xNWExMWQzNTI5NjIiLCJ1bmlxdWVfbmFtZSI6InN0ZHNlQHZudWEuZWR1LnZuIiwidXBuIjoic3Rkc2VAdm51YS5lZHUudm4iLCJ1dGkiOiJFcDVTbWRfSHJreVZRVkZWc1dKWkFBIiwidmVyIjoiMS4wIiwid2lkcyI6WyJiNzlmYmY0ZC0zZWY5LTQ2ODktODE0My03NmIxOTRlODU1MDkiXSwieG1zX3N0Ijp7InN1YiI6ImFWUks2WTlCTVIyLTRJOGYwdW5FLUxuR2Q3S2lLMUUwNDE0dk9QXzVlaE0ifSwieG1zX3RjZHQiOjE0NDkxMzQyNDJ9.aHQHu7aeuUi9k4qk5YVFCfuW0DKX5dmpcADG98rZli3bPj5B3YIM6yQ_w-3HzYQizThGIJQeDGFLQUdYD6RVI98UspVzLedqBss2vSUb6Aiwu6UfHRW0gM1x9v8A3TxPWhUzq6jS91LF0FDvBtphQGkngqe_WKvYK6cS8ExEPVtBdRzNUeno9SIX67Ix60IoDAURwYrIYMDzDWLeHdu-gkvzWWIS-JhpCjQzF2UVGYlkdNs0WLbfC3wqNGdQvcBKHlWQbl1J1jj-fbK7sNm7HMbdRs5MLYjaChm-mWqv4PZV8b464Sk3X_P97Fh7h_I6_TjibR87v-T_KdpthXkQzQ';

test('Should update access token with no thrown error', async () => {
  await Prisma.user.update({
    where: { email: 'stdse@vnua.edu.vn' },
    data: {
      msAccessToken: accessToken,
    },
  });
});

test('Should fetch ms events by class ID with no thrown error', async () => {
  const result = await Prisma.msEvent.findMany({
    where: {
      classId: '2da2d98a-9ef7-44fa-8205-89127b86a1e1',
    },
  });

  console.log('count: ', result.length);

  console.dir(
    result.map((event) => {
      const content = JSON.parse(event.json);

      return {
        subject: content.subject,
        body: content.body.content,
        weekStr: getWeekStr(content),
        attendeeSize: content.attendees.length,
      };
    }),
    { depth: null },
  );
});

function getWeekStr(eventJson) {
  const semestertStartDate = dayjs('2023-01-15T17:00:00.000Z');
  const startTime = dayjs(eventJson.recurrence.range.startDate, 'YYYY-MM-DD');
  const endTime = dayjs(eventJson.recurrence.range.endDate, 'YYYY-MM-DD');
  const startWeek = startTime.diff(semestertStartDate, 'week') + 1;
  const endWeek = endTime.diff(startTime, 'week') + startWeek;

  return `${startWeek}-${endWeek}`;
}
