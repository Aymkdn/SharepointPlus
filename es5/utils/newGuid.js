/**
  @name $SP().newGuid
  @function
  @category utils
  @description Create an unique GUID (based on Sharepoint function called SP.Guid.newGuid())
 */
export default function newGuid() {
  for (var a = "", c = 0; c < 32; c++) {
    var b = Math.floor(Math.random() * 16);

    switch (c) {
      case 8:
        a += "-";
        break;

      case 12:
        b = 4;
        a += "-";
        break;

      case 16:
        b = b & 3 | 8;
        a += "-";
        break;

      case 20:
        a += "-";
    }

    a += b.toString(16);
  }

  return a;
}