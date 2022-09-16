let displayState = VV.Form.GetFieldValue("Display State");
let screen = parseInt(displayState) + 1;

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
    screen = 4;
    break;
  case 6:
    screen = 5;
    break;

  default:
    break;
}

displayState = (screen - 1).toString();
VV.Form.SetFieldValue("Display State", displayState, true);
