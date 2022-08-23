let displayState = VV.Form.GetFieldValue("Display State");

displayState = (displayState - 1).toString();
VV.Form.SetFieldValue("Display State", displayState, true);
