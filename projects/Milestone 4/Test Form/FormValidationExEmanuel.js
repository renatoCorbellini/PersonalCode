//FormValidation for the Individual Record
//pass in ControlName to validate a single item or nothing to validate everything.
// paremeters:
//  ControlName: the name of the control to validate

var ErrorReporting = true;
var RunAll = false;

if (ControlName == null) {
  RunAll = true;
}

if (ControlName == "Establishment Name" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Establishment Name"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Establishment Name",
      "A value needs to be entered for the Establishment Name."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Establishment Name");
  }
}

if (ControlName == "Establishment Address" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Establishment Address"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Establishment Address",
      "A value needs to be entered for the Establishment Address."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Establishment Address");
  }
}

if (ControlName == "Establishment City" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Establishment City"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Establishment City",
      "A value needs to be entered for the Establishment City."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Establishment City");
  }
}

if (ControlName == "Establishment Zip Code" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Establishment Zip Code"),
      "Zip"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Establishment Zip Code",
      "A value needs to be entered for the Establishment Zip Code."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Establishment Zip Code");
  }
}

if (ControlName == "Establishment Phone" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Establishment Phone"),
      "Phone"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Establishment Phone",
      "A value needs to be entered for the Establishment Phone."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Establishment Phone");
  }
}

if (ControlName == "Establishment State" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Establishment State"),
      "DDSelect"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Establishment State",
      "A value needs to be selected."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Establishment State");
  }
}

if (ControlName == "Applicant" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Applicant"),
      "DDSelect"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Applicant",
      "A value needs to be selected."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Applicant");
  }
}

if (ControlName == "Applicant Address" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Applicant Address"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Applicant Address",
      "A value needs to be entered for the Applicant Address."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Applicant Address");
  }
}

if (ControlName == "Applicant City" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Applicant City"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Applicant City",
      "A value needs to be entered for the Applicant City."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Applicant City");
  }
}

if (ControlName == "Applicant Zip Code" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Applicant Zip Code"),
      "Zip"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Applicant Zip Code",
      "A value needs to be entered for the Applicant Zip Code."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Applicant Zip Code");
  }
}

if (ControlName == "Applicant Phone" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Applicant Phone"),
      "Phone"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Applicant Phone",
      "A value needs to be entered for the Applicant Phone."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Applicant Phone");
  }
}

if (ControlName == "Applicant State" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Applicant State"),
      "DDSelect"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Applicant State",
      "A value needs to be selected."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Applicant State");
  }
}

if (ControlName == "Owner 1 First Name" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Owner 1 First Name"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Owner 1 First Name",
      "A value needs to be entered for the Owner 1 First Name."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Owner 1 First Name");
  }
}

if (ControlName == "Owner 1 MI" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Owner 1 MI"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Owner 1 MI",
      "A value needs to be entered for the Owner 1 MI."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Owner 1 MI");
  }
}

if (ControlName == "Owner 1 Last Name" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Owner 1 Last Name"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Owner 1 Last Name",
      "A value needs to be entered for the Owner 1 Last Name."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Owner 1 Last Name");
  }
}

if (ControlName == "Owner 1 Title" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Owner 1 Title"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Owner 1 Title",
      "A value needs to be entered for the Owner 1 Title."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Owner 1 Title");
  }
}

if (ControlName == "Owner 1 Email Address" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Owner 1 Email Address"),
      "Email"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Owner 1 Email Address",
      "Please enter the Owner 1 Email Address in the form of a valid Email."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Owner 1 Email Address");
  }
}

if (ErrorReporting == false) {
  return false;
} else {
  return true;
}
