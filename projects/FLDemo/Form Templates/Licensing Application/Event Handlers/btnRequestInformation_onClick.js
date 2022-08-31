let requiredFieldsMsg =
  "A value for the field State Notes or Instructions needs to be entered before requesting additional information from the Applicant. Go to the Business Information tab to complete this field.";
let requiredFieldstitle = "Required Notes or Instructions";

let messageData =
  "The License Application is ready to be returned to the Applicant requesting more information, are you sure you want to return the current License Application to the Applicant? Make sure you have specified the required information to the user before returning the Application. Click OK if you want to continue or click Cancel of you want to go back";
let title = "Confirm Return";

if (VV.Form.Template.FormValidation_Screen3Notes()) {
  VV.Form.Global.DisplayConfirmMessaging(
    messageData,
    title,
    VV.Form.Template.RequestMoreInformation,
    VV.Form.Template.CancelFunction
  );
} else {
  VV.Form.HideLoadingPanel();
  VV.Form.Global.DisplayMessaging(requiredFieldsMsg, requiredFieldstitle);
}
