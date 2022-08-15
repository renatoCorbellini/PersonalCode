var displayState = VV.Form.GetFieldValue("Display State");
var screen = parseInt(displayState) + 1;
var requiredFieldsMsg = "Please, fill in all the required fields.";
var title = "Required Fields";
//var isBusiness = VV.Form.GetFieldValue('BusinessOrYourself') == 'Business' ? true : false;
var isBusiness = false;

switch (screen) {
  case 1:
    //if (VV.Form.Template.FormValidation_Screen1()) {
    //    screen = isBusiness ? 2 : 4;
    //} else {
    //    VV.Form.Global.DisplayMessaging(requiredFieldsMsg, title)
    //}
    screen = 3;
    break;

  case 2:
    var isBusinessSelected =
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
        screen = 4;
        displayState = (screen - 1).toString();
        VV.Form.SetFieldValue("Display State", displayState, true);
      });
    } else {
      screen = 3;
    }
    break;

  case 3:
    if (VV.Form.Template.FormValidation_Screen3()) {
      VV.Form.Template.CallToCreateUpdateBusiness();
    } else {
      VV.Form.Global.DisplayMessaging(requiredFieldsMsg, title);
    }
    break;

  case 4:
    var isFacilitySelected =
      VV.Form.GetFieldValue("Existing Facility") != "Select Item"
        ? true
        : false;
    isFacilitySelected = isFacilitySelected ? true : false;

    if (isFacilitySelected) {
      VV.Form.DoAjaxFormSave().then(function () {
        screen = 6;
        displayState = (screen - 1).toString();
        VV.Form.SetFieldValue("Display State", displayState, true);
      });
    } else {
      screen = 5;
    }
    break;

  case 5:
    if (VV.Form.Template.FormValidation_Screen5()) {
      VV.Form.Template.CallToCreateUpdateFacility();
    } else {
      VV.Form.Global.DisplayMessaging(requiredFieldsMsg, title);
    }
    break;

  case 6:
    //if (VV.Form.Template.FormValidation_Screen6()) {
    //    var isNewBuild = VV.Form.GetFieldValue('Facility Or Build') == 'New Build' ? true : false;
    //    var isFoodEstablishment = VV.Form.GetFieldValue('Service to Permit') == 'Food Establishment' ? true : false;
    //    var isMechanical = VV.Form.GetFieldValue('Mechanical') == 'True' ? true : false;
    //    var isElectrical = VV.Form.GetFieldValue('Electrical') == 'True' ? true : false;
    //    var isBodyArt = VV.Form.GetFieldValue('Service to Permit') == 'Body Art' ? true : false; //New for San Mateo can delete when done

    //    if (isNewBuild) {
    //        VV.Form.Template.FillAndRelatePlanningRequest();
    //    }
    //    if (isFoodEstablishment || isBodyArt) {
    //        VV.Form.Template.FillAndRelateFoodEstablishment();
    //    }
    //    if (isMechanical) {
    //        VV.Form.Template.FillInAndRelate_Mechanical()
    //    }
    //    if (isElectrical) {
    //        alert('Electrical Permit form')
    //    }
    //} else {
    //    VV.Form.Global.DisplayMessaging(requiredFieldsMsg, title)
    //}
    VV.Form.Template.OpenBusinessRecord();
    break;

  default:
    console.log("Something went wrong.");
    break;
}
//Max for San Mateo Demo. Can Delete after 12/14/2021
if (VV.Form.GetFieldValue("Display State") == 3) {
  var bizAddress = VV.Form.GetFieldValue("Business Address");
  var bizCity = VV.Form.GetFieldValue("Business City");
  var bizZip = VV.Form.GetFieldValue("Business Zip Code");
  var bizState = VV.Form.GetFieldValue("Business State");
  var bizPhone = VV.Form.GetFieldValue("Business Phone");

  VV.Form.SetFieldValue("Location Address", bizAddress);
  VV.Form.SetFieldValue("Location City", bizCity);
  VV.Form.SetFieldValue("Location State", bizState);
  VV.Form.SetFieldValue("Location Zip Code", bizZip);
  VV.Form.SetFieldValue("Location Phone", bizPhone);
}

displayState = (screen - 1).toString();
VV.Form.SetFieldValue("Display State", displayState, true);
VV.Form.Global.EvaluateGroupsandConditions(["Display State"]);
