VV.Form.Template.PayLicensingApplication();

VV.Form.SetFieldValue("Total Paid", VV.Form.GetFieldValue("Total Owed"), false);
VV.Form.SetFieldValue("Status", "Paid", true);
VV.Form.SetFieldValue("Transaction ID", "123456789", true);

var today = new Date();
VV.Form.SetFieldValue(
  "Date Paid",
  today.getMonth() + 1 + "/" + today.getDate() + "/" + today.getFullYear(),
  true
);
