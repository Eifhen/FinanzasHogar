import { GET, POST, route } from "awilix-express";
import { ITestService } from "../../Application/Services/Interfaces/ITestService";
import { NextFunction, Request, Response } from "express";
import ILoggerManager, { LoggEntityCategorys, LoggerTypes } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";

import IErrorManager from "../../JFramework/ErrorHandling/Interfaces/IErrorManager";
import { HttpStatusCode, HttpStatusMessage, HttpStatusName } from "../../JFramework/Utils/HttpCodes";
import ApplicationContext from "../../JFramework/Application/ApplicationContext";
import IUsuariosSqlRepository from "../../Dominio/Repositories/IUsuariosSqlRepository";
import ApplicationException from "../../JFramework/ErrorHandling/ApplicationException";
import { NO_REQUEST_ID } from "../../JFramework/Utils/const";
import ImageStrategyDirector from "../../JFramework/Strategies/Image/ImageStrategyDirector";




interface TestControllerDependencies {
  testService: ITestService;
  errorManager: IErrorManager;
 // context: ApplicationContext;
  usuariosRepository: IUsuariosSqlRepository;
  imageDirector: ImageStrategyDirector;
}

@route("/test")
export default class TestController {

  private readonly _testService: ITestService;
 // private readonly _context: ApplicationContext;
  private readonly _logger: ILoggerManager;
  private readonly _errorManager: IErrorManager;
  private readonly _usuariosRepository: IUsuariosSqlRepository;
  private readonly _imageDirector: ImageStrategyDirector;

  constructor(deps: TestControllerDependencies) {
    this._testService = deps.testService;
  //  this._context = deps.context;
    this._errorManager = deps.errorManager;
    this._usuariosRepository = deps.usuariosRepository;  
    this._imageDirector = deps.imageDirector;  
    this._logger = new LoggerManager({
    //  context: this._context,
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
      next(this._errorManager.GetException(
        HttpStatusName.InternalServerError,
        HttpStatusCode.InternalServerError, 
        "Error Prueba", 
        __filename, 
        err
      ));
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
      throw this._errorManager.GetException(
        HttpStatusName.BadRequest,
        HttpStatusCode.BadRequest,
        "Error Prueba", 
        __dirname, 
        err
      );
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

      const [err, data] = await this._usuariosRepository.paginate({
        pageSize: 10,
        currentPage: 1,
      });

      if(err){
        throw new ApplicationException(
          err.message, 
          HttpStatusName.NotFound, 
          HttpStatusCode.NotFound,
          NO_REQUEST_ID,
          __filename, 
          err
        )
      }

      return res.status(HttpStatusCode.OK).send(data);
    }
    catch(err:any){
      this._logger.Error("ERROR", "GetUsuarios");
      
      if(err instanceof ApplicationException) {
        return next(err);
      }

      return next(this._errorManager.GetException(
        HttpStatusName.InternalServerError,
        HttpStatusCode.InternalServerError, 
        HttpStatusMessage.InternalServerError, 
        __filename, 
        err
      ));
    }
  }


  @route("/images")
  @POST()
  public UploadImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this._logger.Activity("UploadImages");

      await this._imageDirector.Upload(req.body, "casa_1");

      return res.status(HttpStatusCode.OK).send("hellow");
    }
    catch(err:any){
      this._logger.Error("ERROR", "GetUsuarios");
      
      if(err instanceof ApplicationException) {
        return next(err);
      }

      return next(this._errorManager.GetException(
        HttpStatusName.InternalServerError,
        HttpStatusCode.InternalServerError, 
        HttpStatusMessage.InternalServerError, 
        __filename, 
        err
      ));
    }
  }

}