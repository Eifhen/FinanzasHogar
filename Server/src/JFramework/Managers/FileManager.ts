import ApplicationContext from "../Application/ApplicationContext";
import IFileManager from "./Interfaces/IFileManager";
import ILoggerManager, { LoggEntityCategorys } from "./Interfaces/ILoggerManager";
import LoggerManager from "./LoggerManager";
import fs from "fs/promises";

interface IFileManagerDependencies {
    applicationContext: ApplicationContext;
}

export class FileManager implements IFileManager {

  /** Instancia del logger */
  private readonly _logger: ILoggerManager;

  /** Contexto de aplicación */
  private readonly _applicationContext: ApplicationContext;
  
  constructor (deps: IFileManagerDependencies){
    this._applicationContext = deps.applicationContext;
 
    this._logger = new LoggerManager({
      entityName: "FileManager",
      entityCategory: LoggEntityCategorys.MANAGER,
      applicationContext: this._applicationContext,
    });
  }

  /** Función que permite leer un archivo html y devolverlo */
  public async ReadHTML (filePath: string) : Promise<string> {
    try {
      const html = await fs.readFile(filePath, { encoding: 'utf-8' })
                           .catch(err => {
                              throw err;
                            }); 
      
      return html;
    }
    catch(err:any){
      this._logger.Error("ERROR", "ReadHTML", err);
      throw err;
    }
  }

}