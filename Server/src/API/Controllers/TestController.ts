import { GET, POST, route } from "awilix-express";
import { ITestService } from "../../Application/Services/Interfaces/ITestService";
import { NextFunction, Response } from "express";
import ILoggerManager, { LoggEntityCategorys, LoggerTypes } from "../../JFramework/Managers/Interfaces/ILoggerManager";
import LoggerManager from "../../JFramework/Managers/LoggerManager";
import { HttpStatusCode } from "../../JFramework/Utils/HttpCodes";
import IUsuariosSqlRepository from "../../Dominio/Repositories/IUsuariosSqlRepository";
import ApplicationException from "../../JFramework/ErrorHandling/ApplicationException";
import ApplicationArgs from "../../JFramework/Helpers/ApplicationArgs";
import ApplicationRequest from "../../JFramework/Helpers/ApplicationRequest";
import { InternalServerException, ValidationException } from "../../JFramework/ErrorHandling/Exceptions";
import RateLimiterMiddleware from "../../JFramework/Security/RateLimiter/RateLimiterMiddleware";
import ExampleMiddleware from "../../JFramework/Middlewares/ExampleMiddleware";
import Middlewares from '../../JFramework/Helpers/Decorators/Middlewares';
import { DEFAULT_NUMBER } from "../../JFramework/Utils/const";
import SignUpDTO from "../../Application/DTOs/SignUpDTO";
import AppImage from "../../JFramework/Helpers/DTOs/AppImage";
import ApplicationContext from "../../JFramework/Configurations/ApplicationContext";
import ICloudStorageManager from "../../JFramework/External/CloudStorage/Interfaces/ICloudStorageManager";
import CsrfValidationMiddleware from "../../JFramework/Middlewares/CsrfValidationMiddleware";


interface TestControllerDependencies {
	testService: ITestService;
	usuariosRepository: IUsuariosSqlRepository;
	cloudStorageManager: ICloudStorageManager;
	applicationContext: ApplicationContext;
}

@route("/test")
export default class TestController {

	private readonly _testService: ITestService;
	private readonly _logger: ILoggerManager;
	private readonly _usuariosRepository: IUsuariosSqlRepository;
	private readonly _cloudStorageManager: ICloudStorageManager;
	private readonly _applicationContext: ApplicationContext;

	constructor(deps: TestControllerDependencies) {
		this._testService = deps.testService;
		this._usuariosRepository = deps.usuariosRepository;
		this._cloudStorageManager = deps.cloudStorageManager;
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
	public async GetAll(req: ApplicationRequest, res: Response, next: NextFunction) {
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
	public async GetError(req: ApplicationRequest, res: Response, next: NextFunction) {
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
	public async GetPromiseError(req: ApplicationRequest, res: Response, next: NextFunction) {
		try {

			this._logger.Activity("GetPromiseError");

			// Generar un unhandledRejection
			await Promise.reject(new Error("Prueba Error GetPromiseError"));

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
	public async GetControledError(req: ApplicationRequest, res: Response, next: NextFunction) {
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
	public async GetFatalError(req: ApplicationRequest, res: Response, next: NextFunction) {
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
	public async GetUsuarios(req: ApplicationRequest, res: Response, next: NextFunction) {
		try {
			this._logger.Activity("GetUsuarios");

			console.log("TEST CONTROLLER | GET USUARIOS contenedor =>", req.container._identifier);

			// const [err, data] = await this._usuariosRepository.paginate({
			//   pageSize: 10,
			//   currentPage: 1,
			// });

			if (this._usuariosRepository) {
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
	public async UploadImage(req: ApplicationRequest, res: Response, next: NextFunction) {
		try {
			this._logger.Activity("UploadImages");
			const result = await this._cloudStorageManager?.Upload(req.body, "casa_1");
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
	public async GetImage(req: ApplicationRequest<any, { id: string }>, res: Response, next: NextFunction) {
		try {
			this._logger.Activity("GetImage");

			const args = new ApplicationArgs<any, { id: string }>(req);
			const id = args.query?.id ?? "";
			if (this._cloudStorageManager) {
				const [error, result] = await this._cloudStorageManager.Get(id);

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
	public async GetTranslations(req: ApplicationRequest<any, { id: string }>, res: Response, next: NextFunction) {
		try {
			this._logger.Activity("GetTranslations");

			const result = this._applicationContext.language.Translate("activar")

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
	public async ActivateAccount(req: ApplicationRequest<any>, res: Response, next: NextFunction) {
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

	@route("/test-schemas")
	@POST()
	public async TestSchemaValidation(req: ApplicationRequest<SignUpDTO>, res: Response, next: NextFunction) {
		try {
			this._logger.Activity("TestSchemaValidation");

			const data = SignUpDTO.Validate(req.body);
			if (!data.isValid) {
				// throw new BadRequestException("SignUp", data.errorMessage, this._applicationContext, __filename);
				throw new ValidationException("TestSchemaValidation", data.errorData, this._applicationContext, __filename, data.innerError)
			}

			const fotoVal = AppImage.Validate(req.body.foto);
			if (!fotoVal.isValid) {
				// throw new BadRequestException("SignUp", fotoVal.errorMessage, this._applicationContext, __filename);
				throw new ValidationException("TestSchemaValidation", fotoVal.errorData, this._applicationContext, __filename, fotoVal.innerError)
			}

			res.status(HttpStatusCode.OK).send();
		}
		catch (err: any) {
			if (err instanceof ApplicationException) {
				return next(err);
			}

			return next(new InternalServerException(
				"TestSchemaValidation",
				err.message,
				this._applicationContext,
				__filename,
				err
			));
		}
	}

	@route("/csrf")
	@GET()
	@Middlewares(CsrfValidationMiddleware)
	public async TestGetCSRF(req: ApplicationRequest<any>, res: Response, next: NextFunction) {
		try {
			this._logger.Activity("TestCSRF");

			/** Obtenemos los datos de la cookie */
			const cookieData = this._applicationContext.settings.apiData.cookieData.csrfTokenCookie;

			/** Obtenemos el nombre del header */
			const csrfHeader = this._applicationContext.settings.apiData.headers.csrfTokenHeader;

			/** Valor de la cookie */
			const cookie = req.cookies[cookieData.name];

			/** Obtenemos el token del header */
			const token = req.get(csrfHeader);

			res.status(HttpStatusCode.OK).send({
				headers: req.headers,
				cookies: req.cookies,
				signedCookies: req.signedCookies,
				token: {
					header: csrfHeader,
					value: token,
				},
				csrfCookie: {
					name: cookieData.name,
					value: cookie
				}
			});
		}
		catch (err: any) {
			next(new InternalServerException(
				"TestCSRF",
				err.message,
				this._applicationContext,
				__filename,
				err
			));
		}
	}

	@route("/csrf")
	@POST()
	@Middlewares(CsrfValidationMiddleware)
	public async TestPostCSRF(req: ApplicationRequest<any>, res: Response, next: NextFunction) {
		try {
			this._logger.Activity("TestCSRF");

			/** Obtenemos los datos de la cookie */
			const cookieData = this._applicationContext.settings.apiData.cookieData.csrfTokenCookie;

			/** Obtenemos el nombre del header */
			const csrfHeader = this._applicationContext.settings.apiData.headers.csrfTokenHeader;

			/** Valor de la cookie */
			const cookie = req.cookies[cookieData.name];

			/** Obtenemos el token del header */
			const token = req.get(csrfHeader);

			res.status(HttpStatusCode.OK).send({
				headers: req.headers,
				cookies: req.cookies,
				signedCookies: req.signedCookies,
				token: {
					header: csrfHeader,
					value: token,
				},
				csrfCookie: {
					name: cookieData.name,
					value: cookie
				}
			});
		}
		catch (err: any) {
			next(new InternalServerException(
				"TestCSRF",
				err.message,
				this._applicationContext,
				__filename,
				err
			));
		}
	}

}