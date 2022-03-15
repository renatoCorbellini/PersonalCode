var messageData = "The form has been saved.";
var title = "Form Saved";
//Measuring the form validation
if (VV.Form.Template.FormValidation() === true) {
  if (VV.Form.GetFieldValue("Status") == "Select Item") {
    VV.Form.SetFieldValue("Status", "Active");
    VV.Form.Global.EvaluateGroupsandConditions(["Status"]);
  }

  VV.Form.ShowLoadingPanel();

  if (VV.Form.GetFieldValue("Form Saved") == "false") {
    VV.Form.SetFieldValue("Form Saved", "true");

    VV.Form.DoPostbackSave();
    VV.Form.HideLoadingPanel();
    VV.Form.Global.DisplayMessaging(messageData, title);
  } else {
    VV.Form.DoAjaxFormSave().then(function (resp) {
      VV.Form.HideLoadingPanel();
      VV.Form.Global.DisplayMessaging(messageData, title);
    });
  }
} else {
  VV.Form.HideLoadingPanel();
  VV.Form.Global.ValidationLoadModal(control.value);
}
