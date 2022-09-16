let messageData =
  "The License is ready for renewing, are you sure you want to renew the current License? Click OK to continue or click Cancel to go back.";
let title = "Confirm Renewal";

VV.Form.Global.DisplayConfirmMessaging(
  messageData,
  title,
  VV.Form.Template.CreateRenewalLicense,
  VV.Form.Template.CancelFunction
);
