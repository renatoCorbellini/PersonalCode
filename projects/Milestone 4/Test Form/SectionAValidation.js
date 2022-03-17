//pass in ControlName to validate a single item or nothing to validate everything.
var ErrorReporting = true;
var RunAll = false;

if (ControlName == null) {
  RunAll = true;
}

if (ControlName == "Sec A First Name" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Sec A First Name"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Sec A First Name",
      "A value needs to be entered for the First Name."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Sec A First Name");
  }
}

if (ControlName == "Sec A Last Name" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Sec A Last Name"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Sec A Last Name",
      "A value needs to be entered for the Last Name."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Sec A Last Name");
  }
}

if (ControlName == "Sec A Address" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Sec A Address"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Sec A Address",
      "A value needs to be entered for the Address."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Sec A Address");
  }
}

if (ControlName == "Sec A Zip Code" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Sec A Zip Code"),
      "Zip"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Sec A Zip Code",
      "A valid Zip Code needs to be entered (5 digit code)."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Sec A Zip Code");
  }
}

if (ControlName == "Sec A Phone Number" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Sec A Phone Number"),
      "Phone"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Sec A Phone Number",
      "A valid Phone Number needs to be entered (10 digit number sequence)."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Sec A Phone Number");
  }
}

if (ControlName == "Sec A Email" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Sec A Email"),
      "Email"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Sec A Email",
      "A valid Email needs to be entered, without special characters \n Ex: #$%&/()"
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Sec A Email");
  }
}

return ErrorReporting;
