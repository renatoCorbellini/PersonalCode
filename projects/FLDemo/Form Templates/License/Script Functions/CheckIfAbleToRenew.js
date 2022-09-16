let expireDate = VV.Form.GetFieldValue("Expiration Date");

expireDate = new Date(expireDate);
const datetoday = new Date();

// Get the ms between the two dates
const msBetweenDates = Math.abs(expireDate.getTime() - datetoday.getTime());

// Convert ms to days                     hour  min  sec   ms
const daysBetweenDates = msBetweenDates / (24 * 60 * 60 * 1000);

if (daysBetweenDates < 120) {
  VV.Form.SetFieldValue("Able to Renew", "true", true);
} else {
  VV.Form.SetFieldValue("Able to Renew", "false", true);
}

VV.Form.DoAjaxFormSave();
