import { GET, route } from "awilix-express";
import { ITestService } from "../../Application/Services/Interfaces/ITestService";
import { NextFunction, Request, Response } from "express";
import ILoggerManager, { LoggEntityCategorys, LoggerTypes } from "../../Infraestructure/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../Infraestructure/Managers/LoggerManager";
import ApplicationContext from "../../Infraestructure/Configurations/ApplicationContext";
import IErrorManager from "../../Infraestructure/Shered/ErrorHandling/Interfaces/IErrorManager";
import { HttpStatusCode, HttpStatusMessage } from "../../Infraestructure/Utils/HttpCodes";
import IDataBaseConfig from "../../Infraestructure/Configurations/types/IDataBaseConfig";



interface TestControllerDependencies {
  testService: ITestService;
  errorManager: IErrorManager;
  context: ApplicationContext;
  database: IDataBaseConfig;
}

@route("/test")
export default class TestController {

  private readonly _testService: ITestService;
  private readonly _context: ApplicationContext;
  private readonly _logger: ILoggerManager;
  private readonly _errorManager: IErrorManager;
  private readonly _database: IDataBaseConfig;

  constructor(deps: TestControllerDependencies) {
    this._testService = deps.testService;
    this._context = deps.context;
    this._errorManager = deps.errorManager;
    this._database = deps.database;
    this._logger = new LoggerManager({
      context: this._context,
      entityName: "TestController",
      entityCategory: LoggEntityCategorys.CONTROLLER,
    });
  }


  @route("/")
  @GET()
  public GetAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this._logger.Activity("GetAll");
      const data = await this._testService.GetAll();
      return res.status(200).send(data);
    }
    catch (err) {
      this._logger.Error(LoggerTypes.ERROR, "GetAll");
      next(err);
    }
  }

  @route("/error")
  @GET()
  public GetError = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this._logger.Activity("GetError");

      // Generar un Error
      throw new Error("Error Nuevo")
  
    }
    catch(err:any){
      this._logger.Error("ERROR", "GetError");
      next(this._errorManager.GetException(HttpStatusCode.InternalServerError, "Error Prueba", __filename, err));
    }
  }

  @route("/error/promise")
  @GET()
  public GetPromiseError = async (req: Request, res: Response, next: NextFunction) => {
    try {
      
      this._logger.Activity("GetPromiseError");
  
      // Generar un unhandledRejection
      Promise.reject(new Error("Prueba Error GetPromiseError"));
  
      // Responder para verificar comportamiento del cliente
      return res.status(200).send({ message: "Este endpoint genera un unhandledRejection" });
    }
    catch(err:any){
      this._logger.Error("ERROR", "GetPromiseError");
      throw this._errorManager.GetException(HttpStatusCode.BadRequest, "Error Prueba", __dirname, err);
    }
  }

  @route("/error/controled")
  @GET()
  public GetControledError = (req: Request, res: Response, next: NextFunction) => {
    try {
      this._logger.Activity("GetControledError");

      // Forzar un error dentro del setTimeout
      setTimeout(() => {
        try {
          // Generar un error en el setTimeout
          throw new Error("Prueba Error GetControledError");
        } catch (err: any) {
          // Manejar el error y evitar que se propague
          this._logger.Error("ERROR", "Error manejado dentro del setTimeout: " + err.message);
        }
      }, 0);

      res.status(200).send("El servidor generará un Exception");
    }
    catch (err: any) {
      throw err;
    }
  }


  @route("/error/fatal")
  @GET()
  public GetFatalError = (req: Request, res: Response, next: NextFunction) => {
    try {
      this._logger.Activity("GetFatalError");

      // Forzar un uncaughtException fuera del flujo de Express
      setTimeout(() => {
        try {
          // Generar un error en el setTimeout
          throw new Error("Prueba Error GetFatalError");
        } catch (err: any) {
          // Manejar al hacer throw propagamos el Error por fuera de Express
          throw new Error("Prueba Error GetFatalError");
        }
      }, 0);

      res.status(200).send("El servidor generará un uncaughtException");
    }
    catch (err: any) {
      throw err;
    }
  }


  @route("/usuarios")
  @GET()
  public GetUsuarios = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this._logger.Activity("GetUsuarios");
      const usuarios = await this._database.instance.selectFrom("usuarios").selectAll().execute();
      return res.status(HttpStatusCode.OK).send(usuarios);
    }
    catch(err:any){
      this._logger.Error("ERROR", "GetUsuarios");
      next(this._errorManager.GetException(
        HttpStatusCode.InternalServerError, 
        HttpStatusMessage.InternalServerError, 
        __filename, 
        err
      ));
    }
  }

}