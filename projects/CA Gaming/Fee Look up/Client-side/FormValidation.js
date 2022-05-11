/* eslint-disable no-undef */
//FormValidation for the Fee Lookup Form

//pass in ControlName to validate a single item or nothing to validate everything.
var ErrorReporting = true;
var RunAll = false;
if (ControlName == null) {
  RunAll = true;
}

if (ControlName == "Fee Name" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Fee Name"),
      "DDSelect"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Fee Name",
      "A value needs to be entered for the Fee Name."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Fee Name");
  }
}

if (ControlName == "Fee Value" || RunAll) {
  if (
    VV.Form.Global.CentralNumericValidation(
      VV.Form.GetFieldValue("Fee Value"),
      "0",
      "GreaterThanEqualTo"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Fee Value",
      "A value equal or greater than zero has to be placed in this field."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Fee Value");
  }
}

if (ControlName == "Effectivity Start Date" || RunAll) {
  //if the Start Date is empty
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Effectivity Start Date"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Effectivity Start Date",
      "A date for Effectivity Start Date has to be selected"
    );
    ErrorReporting = false;
  }
  //If the start date is not empty
  else {
    VV.Form.ClearValidationErrorOnField("Effectivity Start Date");
    //if the Effectivity End Date Date is not Empty
    if (VV.Form.GetFieldValue("Effectivity End Date")) {
      if (
        VV.Form.Global.CentralDateValidation2(
          VV.Form.GetFieldValue("Effectivity Start Date"),
          "DateBefore",
          VV.Form.GetFieldValue("Effectivity End Date"),
          "D",
          1
        ) != true
      ) {
        VV.Form.SetValidationErrorMessageOnField(
          "Effectivity Start Date",
          "A date for Effectivity Start Date has to be selected being at least one day before Effectivity End Date"
        );
        ErrorReporting = false;
      } else {
        VV.Form.ClearValidationErrorOnField("Effectivity End Date");
        VV.Form.ClearValidationErrorOnField("Effectivity Start Date");
      }
    }
  }
}
if (ControlName == "Effectivity End Date" || RunAll) {
  //if the contract end date is empty
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Effectivity End Date"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Effectivity End Date",
      "A date for Effectivity End Date has to be selected"
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Effectivity End Date");
    //If Effectivity Start Date Date is not Empty

    if (VV.Form.GetFieldValue("Effectivity Start Date")) {
      if (
        VV.Form.Global.CentralDateValidation2(
          VV.Form.GetFieldValue("Effectivity End Date"),
          "DateAfter",
          VV.Form.GetFieldValue("Effectivity Start Date"),
          "D",
          1
        ) != true
      ) {
        VV.Form.SetValidationErrorMessageOnField(
          "Effectivity End Date",
          "A date for Effectivity End Date has to be selected being at least one day after Effectivity Start Date"
        );
        ErrorReporting = false;
      } else {
        VV.Form.ClearValidationErrorOnField("Effectivity Start Date");
        VV.Form.ClearValidationErrorOnField("Effectivity End Date");
      }
    }
  }
}
if (ErrorReporting == false) {
  return false;
} else {
  return true;
}
