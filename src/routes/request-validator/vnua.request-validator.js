const { checkSchema } = require('express-validator');

class VNUARequestValidator {
  get teachingScheduleRequestValidator() {
    return checkSchema({
      teacherId: {
        in: 'body',
        exists: {
          errorMessage: 'Mã giảng viên không được để trống',
          options: { checkFalsy: true, checkNull: true },
        },
      },
      semesterId: {
        in: 'body',
        exists: {
          errorMessage: 'Mã học kỳ không được để trống',
          options: { checkFalsy: true, checkNull: true },
        },
        isNumeric: {
          errorMessage: 'Mã học kỳ phải là dãy số nguyên',
          options: { no_symbols: true },
        },
      },
    });
  }
}

module.exports = {
  VNUARequestValidator,
};
