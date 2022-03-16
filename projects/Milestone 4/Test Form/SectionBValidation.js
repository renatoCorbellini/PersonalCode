//pass in ControlName to validate a single item or nothing to validate everything.
var ErrorReporting = true;
var RunAll = false;

if (ControlName == null) {
  RunAll = true;
}

if (ControlName == "Sec B First Name" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Sec B First Name"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Sec B First Name",
      "A value needs to be entered for the First Name."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Sec B First Name");
  }
}

if (ControlName == "Sec B Last Name" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Sec B Last Name"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Sec B Last Name",
      "A value needs to be entered for the Last Name."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Sec B Last Name");
  }
}

if (ControlName == "Sec B Address" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Sec B Address"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Sec B Address",
      "A value needs to be entered for the Address."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Sec B Address");
  }
}

if (ControlName == "Sec B Zip Code" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Sec B Zip Code"),
      "Zip"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Sec B Zip Code",
      "A valid value needs to be entered for the Zip Code."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Sec B Zip Code");
  }
}

if (ControlName == "Sec B Phone Number" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Sec B Phone Number"),
      "Phone"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Sec B Phone Number",
      "A valid value needs to be entered for the Phone Number."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Sec B Phone Number");
  }
}

return ErrorReporting;
