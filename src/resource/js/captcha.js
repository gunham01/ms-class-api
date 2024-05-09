const capchaInputField = document.getElementById(
  'ctl00_ContentPlaceHolder1_ctl00_txtCaptcha',
);
const confirmButton = document.getElementById(
  'ctl00_ContentPlaceHolder1_ctl00_btnXacNhan',
);

function fillCatcha() {
  if (capchaInputField) {
    const capchaContent = document.getElementById(
      'ctl00_ContentPlaceHolder1_ctl00_lblCapcha',
    ).textContent;
    // @ts-ignore
    capchaInputField.value = capchaContent;

    // delay
    for (let i = 0; i < 100000; i++) {
      console.log(i);
    }

    confirmButton.click();
    return true;
  } else {
    return false;
  }
}

// @ts-ignore
return fillCatcha();
