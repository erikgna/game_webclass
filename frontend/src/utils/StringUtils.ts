class StringUtils {
  private static charList =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  public static generateRandomString(length: number) {
    let result = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * this.charList.length);
      result += this.charList.charAt(randomIndex);
    }
    return result;
  }
}
