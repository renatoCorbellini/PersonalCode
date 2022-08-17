let displayState = VV.Form.GetFieldValue("Display State");
let screen = parseInt(displayState) + 1;
let requiredFieldsMsg =
  "All of the fields have not been filled in completely or there is an issue with the range of the data entered.  Highlight your mouse over the red icon to see how you can resolve the error stopping you from saving this form.";
let title = "Required Fields";

switch (screen) {
  case 1:
    screen = 2;
    break;

  case 2:
    if (VV.Form.Template.FormValidation_Screen2()) {
      screen = 3;
    } else {
      VV.Form.HideLoadingPanel();
      VV.Form.Global.DisplayMessaging(requiredFieldsMsg, title);
    }
    break;

  case 3:
    let isBusinessSelected =
      VV.Form.GetFieldValue("Existing Business") != "Select Item"
        ? true
        : false;
    isBusinessSelected = isBusinessSelected ? true : false;

    if (isBusinessSelected) {
      VV.Form.SetFieldValue(
        "Business ID",
        VV.Form.GetFieldValue("Existing Business"),
        true
      );
      VV.Form.DoAjaxFormSave().then(function () {
        screen = 5;
        displayState = (screen - 1).toString();
        VV.Form.SetFieldValue("Display State", displayState, true);
      });
    } else {
      screen = 4;
    }
    break;

  case 4:
    if (VV.Form.Template.FormValidation_Screen4()) {
      VV.Form.Template.CallToCreateUpdateBusiness();
    } else {
      VV.Form.HideLoadingPanel();
      VV.Form.Global.DisplayMessaging(requiredFieldsMsg, title);
    }
    break;

  case 5:
    let isFacilitySelected =
      VV.Form.GetFieldValue("Existing Facility") != "Select Item"
        ? true
        : false;
    isFacilitySelected = isFacilitySelected ? true : false;

    if (isFacilitySelected) {
      VV.Form.DoAjaxFormSave().then(function () {
        screen = 7;
        displayState = (screen - 1).toString();
        VV.Form.SetFieldValue("Display State", displayState, true);
      });
    } else {
      screen = 6;
    }
    break;

  case 6:
    if (VV.Form.Template.FormValidation_Screen6()) {
      VV.Form.Template.CallToCreateUpdateFacility();
    } else {
      VV.Form.HideLoadingPanel();
      VV.Form.Global.DisplayMessaging(requiredFieldsMsg, title);
    }
    break;

  case 7:
    if (VV.Form.Template.FormValidation_Screen7()) {
      VV.Form.Template.CallToCreateUpdateIndividual();
    } else {
      VV.Form.HideLoadingPanel();
      VV.Form.Global.DisplayMessaging(requiredFieldsMsg, title);
    }
    break;

  case 8:
    VV.Form.Template.OpenBusinessRecord();
    break;

  default:
    console.log(
      "Something went wrong. Please contact system adminstrators for help."
    );
    break;
}

//Max for San Mateo Demo. Can Delete after 12/14/2021
// if (VV.Form.GetFieldValue("Display State") == 3) {
//   let bizAddress = VV.Form.GetFieldValue("Business Address");
//   let bizCity = VV.Form.GetFieldValue("Business City");
//   let bizZip = VV.Form.GetFieldValue("Business Zip Code");
//   let bizState = VV.Form.GetFieldValue("Business State");
//   let bizPhone = VV.Form.GetFieldValue("Business Phone");

//   VV.Form.SetFieldValue("Location Address", bizAddress);
//   VV.Form.SetFieldValue("Location City", bizCity);
//   VV.Form.SetFieldValue("Location State", bizState);
//   VV.Form.SetFieldValue("Location Zip Code", bizZip);
//   VV.Form.SetFieldValue("Location Phone", bizPhone);
// }

displayState = (screen - 1).toString();
VV.Form.SetFieldValue("Display State", displayState, true);
VV.Form.Global.EvaluateGroupsandConditions(["Display State"]);
