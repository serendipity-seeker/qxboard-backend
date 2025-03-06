const pick = (obj: object, keys: string[]) => {
  return keys.reduce<{ [key: string]: unknown }>((finalObj, key) => {
    if (obj && Object.hasOwnProperty.call(obj, key)) {
      finalObj[key] = obj[key as keyof typeof obj];
      if (finalObj[key] == "true" || finalObj[key] == "false") {
        finalObj[key] = finalObj[key] === "true";
      }
    }
    return finalObj;
  }, {});
};

export default pick;
