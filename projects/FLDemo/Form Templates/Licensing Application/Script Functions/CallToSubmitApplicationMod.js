let messageData =
  "The License Application has been submited. You will receive an email notification soon.";
var title = "Success";

let currentStatus = VV.Form.GetFieldValue("Status");

if (currentStatus === "Returned") {
  VV.Form.SetFieldValue("Status", "Resubmitted", false);
} else {
  let dateToday = Date();
  VV.Form.SetFieldValue("Status", "Submitted", false);
  VV.Form.SetFieldValue("Date Submitted", dateToday.toString(), false);
}

VV.Form.ShowLoadingPanel();
VV.Form.DoAjaxFormSave().then(function () {
  VV.Form.HideLoadingPanel();
  VV.Form.Global.DisplayMessaging(messageData, title);
  VV.Form.SetFieldValue("Tab Control", "Business Information", true);
});
