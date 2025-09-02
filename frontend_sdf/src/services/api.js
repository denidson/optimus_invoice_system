const CryptoJS = require("crypto-js");
const secretKey = "miClaveSecreta"; // La clave secreta usada para encriptar y desencriptar

// Función para encriptar el texto
export function encryptText(plainText) {
  const encrypted = CryptoJS.AES.encrypt(plainText, secretKey).toString();
  return encrypted;
}

// Función para desencriptar el texto
export function decryptText(encryptedText) {
  const bytes = CryptoJS.AES.decrypt(encryptedText, secretKey);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8); // Convierte los bytes a texto legible
  return decrypted;
}