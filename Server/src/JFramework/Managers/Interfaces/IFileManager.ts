



export default interface IFileManager {

  /** Método que permite leer un archivo html y devolverlo */
  ReadHTML: (filePath: string) => Promise<string>; 

}