//FormValidation for the Individual Record
//pass in ControlName to validate a single item or nothing to validate everything.

let ErrorReporting = true;
let RunAll = false;

if (ControlName == null) {
  RunAll = true;
}

// SCREEN 6

if (ControlName == "Location Type" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Location Type"),
      "DDSelect"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Location Type",
      "A value needs to be selected."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Location Type");
  }
}

if (ControlName == "Location Name" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Location Name"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Location Name",
      "A value needs to be entered for the Location Name."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Location Name");
  }
}

if (ControlName == "Location Address" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Location Address"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Location Address",
      "A value needs to be entered for the Location Address."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Location Address");
  }
}

if (ControlName == "Location Phone" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Location Phone"),
      "Phone"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Location Phone",
      "A value needs to be entered for the Location Phone."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Location Phone");
  }
}

if (ControlName == "Location Zip Code" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Location Zip Code"),
      "Zip"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Location Zip Code",
      "A value needs to be entered for the Location Zip Code."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Location Zip Code");
  }
}

if (ControlName == "Location City" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Location City"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Location City",
      "A value needs to be entered for the Location City."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Location City");
  }
}

if (ControlName == "Location State" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Location State"),
      "DDSelect"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Location State",
      "A value needs to be entered for the Location State."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Location State");
  }
}

if (ErrorReporting == false) {
  return false;
} else {
  return true;
}
