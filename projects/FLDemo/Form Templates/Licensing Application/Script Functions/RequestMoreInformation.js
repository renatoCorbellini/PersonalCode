let confirmMsg =
  "The License Application has been returned to the Applicant requesting more information.";
let title = "Form Return Success";

VV.Form.SetFieldValue("Status", "Returned", true);
VV.Form.SetFieldValue("Form Returned Notification Sent", "true", true);

VV.Form.DoAjaxFormSave().then(() => {
  VV.Form.Global.DisplayMessaging(confirmMsg, title);
});
