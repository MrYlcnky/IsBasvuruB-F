export function objectToFormData(
  obj,
  formData = new FormData(),
  parentKey = "",
) {
  if (obj === null || obj === undefined) return formData;

  // Date
  if (obj instanceof Date) {
    if (parentKey) formData.append(parentKey, obj.toISOString());
    return formData;
  }

  // File / Blob
  if (obj instanceof File || obj instanceof Blob) {
    if (parentKey) formData.append(parentKey, obj);
    return formData;
  }

  // Array
  if (Array.isArray(obj)) {
    obj.forEach((value, index) => {
      const key = parentKey ? `${parentKey}[${index}]` : String(index);
      objectToFormData(value, formData, key);
    });
    return formData;
  }

  // Object
  if (typeof obj === "object") {
    Object.keys(obj).forEach((prop) => {
      const value = obj[prop];
      if (value === undefined) return;

      const key = parentKey ? `${parentKey}.${prop}` : prop;
      objectToFormData(value, formData, key);
    });
    return formData;
  }

  // primitive
  if (parentKey) formData.append(parentKey, String(obj));
  return formData;
}
