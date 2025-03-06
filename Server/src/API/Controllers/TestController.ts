import { GET, POST, route } from "awilix-express";
import { ITestService } from "../../Application/Services/Interfaces/ITestService";
import { NextFunction, Request, Response } from "express";
import ILoggerManager, { LoggEntityCategorys, LoggerTypes } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import { HttpStatusCode } from "../../JFramework/Utils/HttpCodes";
import ApplicationContext from "../../JFramework/Context/ApplicationContext";
import IUsuariosSqlRepository from "../../Dominio/Repositories/IUsuariosSqlRepository";
import ApplicationException from "../../JFramework/ErrorHandling/ApplicationException";
import ImageStrategyDirector from "../../JFramework/CloudStorage/ImageStrategyDirector";
import ApplicationArgs from "../../JFramework/Helpers/ApplicationArgs";
import ApplicationRequest from "../../JFramework/Helpers/ApplicationRequest";
import { InternalServerException } from "../../JFramework/ErrorHandling/Exceptions";
import RateLimiterMiddleware from "../../JFramework/Security/RateLimiter/RateLimiterMiddleware";
import ExampleMiddleware from "../../JFramework/Middlewares/ExampleMiddleware";
import Middlewares from '../../JFramework/Decorators/Middlewares';
import { DEFAULT_NUMBER } from "../../JFramework/Utils/const";


interface TestControllerDependencies {
	testService: ITestService;
	usuariosRepository: IUsuariosSqlRepository;
	imageDirector: ImageStrategyDirector;
	applicationContext: ApplicationContext;
}

@route("/test")
export default class TestController {

	private readonly _testService: ITestService;
	private readonly _logger: ILoggerManager;
	private readonly _usuariosRepository: IUsuariosSqlRepository;
	private readonly _imageDirector: ImageStrategyDirector;
	private readonly _applicationContext: ApplicationContext;

	constructor(deps: TestControllerDependencies) {
		this._testService = deps.testService;
		this._usuariosRepository = deps.usuariosRepository;
		this._imageDirector = deps.imageDirector;
		this._applicationContext = deps.applicationContext;
		this._logger = new LoggerManager({
			entityName: "TestController",
			entityCategory: LoggEntityCategorys.CONTROLLER,
			applicationContext: deps.applicationContext
		});
	}

	@route("/")
	@GET() 
	@Middlewares([ExampleMiddleware, RateLimiterMiddleware("generalLimiter")])
	public async GetAll (req: Request, res: Response, next: NextFunction) {
		try {
			this._logger.Activity("GetAll");
			const data = await this._testService.GetAll();
			return res.status(HttpStatusCode.OK).send(data);
		}
		catch (err) {
			this._logger.Error(LoggerTypes.ERROR, "GetAll");
			next(err);
		}
	}

	@route("/error")
	@GET()
	public async GetError(req: Request, res: Response, next: NextFunction) {
		try {
			this._logger.Activity("GetError");

			// Generar un Error
			throw new Error("Error Nuevo")

		}
		catch (err: any) {
			this._logger.Error("ERROR", "GetError");
			next(err);
		}
	}

	@route("/error/promise")
	@GET()
	public async GetPromiseError(req: Request, res: Response, next: NextFunction){
		try {

			this._logger.Activity("GetPromiseError");

			// Generar un unhandledRejection
			Promise.reject(new Error("Prueba Error GetPromiseError"));

			// Responder para verificar comportamiento del cliente
			return res.status(HttpStatusCode.OK).send({ message: "Este endpoint genera un unhandledRejection" });
		}
		catch (err: any) {
			this._logger.Error("ERROR", "GetPromiseError");
			next(err);
		}
	}

	@route("/error/controled")
	@GET()
	public async GetControledError(req: Request, res: Response, next: NextFunction){
		try {
			this._logger.Activity("GetControledError");

			// Forzar un error dentro del setTimeout
			setTimeout(() => {
				try {
					// Generar un error en el setTimeout
					throw new Error("Prueba Error GetControledError");
				} catch (err: any) {
					// Manejar el error y evitar que se propague
					this._logger.Error("ERROR", `Error manejado dentro del setTimeout: ${err.message}`);
				}
			}, DEFAULT_NUMBER);

			res.status(HttpStatusCode.OK).send("El servidor generará un Exception");
		}
		catch (err: any) {
			next(err);
		}
	}

	@route("/error/fatal")
	@GET()
	public async GetFatalError(req: Request, res: Response, next: NextFunction){
		try {
			this._logger.Activity("GetFatalError");
			const TIMER = 2000;

			// Forzar un uncaughtException fuera del flujo de Express
			setTimeout(() => {
				try {
					// Generar un error en el setTimeout
					throw new Error("Prueba Error GetFatalError");
				} catch (err: any) {
					console.error("error =>", err);
					// Manejar al hacer throw propagamos el Error por fuera de Express
					throw err;
				}
			}, TIMER);

			res.status(HttpStatusCode.OK).send("El servidor generará un uncaughtException");
		}
		catch (err: any) {
			next(err);
		}
	}

	@route("/usuarios")
	@GET()
	@Middlewares([RateLimiterMiddleware("generalLimiter")])
	public async GetUsuarios (req: Request, res: Response, next: NextFunction) {
		try {
			this._logger.Activity("GetUsuarios");

			// const [err, data] = await this._usuariosRepository.paginate({
			//   pageSize: 10,
			//   currentPage: 1,
			// });

			if(this._usuariosRepository){
				const [err, data] = await this._usuariosRepository.GetAll();
	
				if (err) {
					throw err;
				}
	
				return res.status(HttpStatusCode.OK).send(data);
			}

			throw new Error("No instance");
		}
		catch (err: any) {
			this._logger.Error("ERROR", "GetUsuarios");

			if (err instanceof ApplicationException) {
				return next(err);
			}

			return next(new InternalServerException(
				"GetUsuarios",
				err.message,
				this._applicationContext,
				__filename,
				err
			));
		}
	}


	@route("/images")
	@POST()
	public async UploadImage(req: Request, res: Response, next: NextFunction){
		try {
			this._logger.Activity("UploadImages");
			const result = await this._imageDirector?.Upload(req.body, "casa_1");
			return res.status(HttpStatusCode.OK).send(result);
		}
		catch (err: any) {
			this._logger.Error("ERROR", "GetUsuarios");

			if (err instanceof ApplicationException) {
				return next(err);
			}

			return next(new InternalServerException(
				"UploadImage",
				err.message,
				this._applicationContext,
				__filename,
				err
			));
		}
	}

	@route("/images")
	@GET()
	public async GetImage(req: ApplicationRequest<any, { id: string }>, res: Response, next: NextFunction){
		try {
			this._logger.Activity("GetImage");

			const args = new ApplicationArgs<any, { id: string }>(req);
			const id = args.query?.id ?? "";
			if(this._imageDirector){
				const [error, result] = await this._imageDirector.Get(id);
	
				if (error) {
					throw new Error("No encontrado")
				}
	
				return res.status(HttpStatusCode.OK).send(result);
			}

			throw new Error("no instance");
		}
		catch (err: any) {
			this._logger.Error("ERROR", "GetImage");

			if (err instanceof ApplicationException) {
				return next(err);
			}

			return next(new InternalServerException(
				"GetImage",
				err.message,
				this._applicationContext,
				__filename,
				err
			));
		}
	}


	@route("/translations")
	@GET()
	public async GetTranslations(req: ApplicationRequest<any, { id: string }>, res: Response, next: NextFunction){
		try {
			this._logger.Activity("GetTranslations");

			const result = this._applicationContext.translator.Translate("activar")

			res.status(HttpStatusCode.OK).send(result);

		}
		catch (err: any) {
			this._logger.Error("ERROR", "GetTranslations");

			if (err instanceof ApplicationException) {
				return next(err);
			}

			return next(new InternalServerException(
				"GetTranslations",
				err.message,
				this._applicationContext,
				__filename,
				err
			));
		}
	}


	@route("/activate-account/:token")
	@GET()
	public async ActivateAccount(req: ApplicationRequest<any>, res: Response, next: NextFunction){
		try {
			this._logger.Activity("ActivateAccount");
			const param = req.params.token;
			res.status(HttpStatusCode.OK).send(param);
		}
		catch (err: any) {
			next(new InternalServerException(
				"ActivateAccount",
				err.message,
				this._applicationContext,
				__filename,
				err
			));
		}
	}

}