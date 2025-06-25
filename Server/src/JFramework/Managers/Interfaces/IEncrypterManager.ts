

/** Tipo de encryptación */
export type EncryptionType = "hash" | "aes-256-cbc";

/** Representa el payload de un encriptado */
export type EncryptionData = {
  iv: string,
  value: string
}


/** Clase que permite manejar el encryptado */
export default interface IEncrypterManager {

  /** Permite encriptar un valor ingresado ej: un password */
  Encrypt(value:string, secret?: string, type?: EncryptionType): Promise<string>;

  /** Permite desencriptar un valor */
  Decrypt(value: string, secret?: string, type?: EncryptionType): Promise<string>

  /** Permite comparar 2 valores encryptados */
  Compare(value: string, hashedValue: string): Promise<boolean>;
}


