// Get the values from the form field controls
const quantity = VV.Form.GetFieldValue("Product Quantity");
const unitPrice = VV.Form.GetDropDownListItemValue("Product Unit Price");

// Calculate product total

return quantity * unitPrice;
