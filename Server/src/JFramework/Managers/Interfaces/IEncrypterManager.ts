



/** Clase que permite manejar el encryptado */
export default interface IEncrypterManager {

  /** Permite encriptar un valor ingresado ej: un password */
  Encrypt(value:string): Promise<string>;

  /** Permite comparar 2 valores encryptados */
  Compare(value: string, hashedValue: string): Promise<boolean>;
}