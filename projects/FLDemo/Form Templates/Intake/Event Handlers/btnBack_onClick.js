let displayState = VV.Form.GetFieldValue("Display State");
let screen = parseInt(displayState) + 1;
// let isBusiness =
//   VV.Form.GetFieldValue("BusinessOrYourself") == "Business" ? true : false;
let isBusinessSelected =
  VV.Form.GetFieldValue("Existing Business") != "Select Item" ? true : false;
isBusinessSelected = isBusinessSelected ? true : false;

let isFacilitySelected =
  VV.Form.GetFieldValue("Existing Facility") != "Select Item" ? true : false;
isFacilitySelected = isFacilitySelected ? true : false;

switch (screen) {
  case 2:
    screen = 1;
    break;
  case 3:
    screen = 2;
    break;
  case 4:
    screen = 3;
    break;
  case 5:
    if (isBusinessSelected) {
      screen = 3;
    } else {
      screen = 4;
    }
    break;
  case 6:
    screen = 5;
    break;
  case 7:
    if (isFacilitySelected) {
      screen = 5;
    } else {
      screen = 6;
    }
    break;

  default:
    break;
}

displayState = (screen - 1).toString();
VV.Form.SetFieldValue("Display State", displayState, true);
VV.Form.Global.EvaluateGroupsandConditions(["Display State"]);
