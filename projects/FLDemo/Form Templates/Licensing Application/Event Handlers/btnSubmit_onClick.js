let requiredFieldsMsg =
  "All of the fields have not been filled in completely or there is an issue with the range of the data entered.  Highlight your mouse over the red icon to see how you can resolve the error stopping you from saving this form.";
let requiredFieldstitle = "Required Fields";

let messageData =
  "The License Application is ready for submitting, are you sure you want to submit the current License? Click OK if you want to continue or click Cancel of you want to go back";
let title = "Confirm Submit";

if (VV.Form.Template.FormValidation()) {
  VV.Form.Global.DisplayConfirmMessaging(
    messageData,
    title,
    VV.Form.Template.CallToSubmitApplication(),
    VV.Form.Template.CancelFunction()
  );
} else {
  VV.Form.HideLoadingPanel();
  VV.Form.Global.DisplayMessaging(requiredFieldsMsg, requiredFieldstitle);
}
