const capchaInputField = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_txtCaptcha');
const confirmButton    = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_btnXacNhan');

if (capchaInputField) {
	const capchaContent    = document.getElementById('ctl00_ContentPlaceHolder1_ctl00_lblCapcha').textContent;
	capchaInputField.value = capchaContent;
	confirmButton.click();
	return true;
} else {
	return false;
}
