/* eslint-disable @typescript-eslint/no-unsafe-return */

import { FunctionReturning, Constructor } from "awilix";
import { before } from "awilix-express";
import { NextFunction, Response } from "express";
import { InternalServerException } from "../../ErrorHandling/Exceptions";
import ApplicationRequest from "../ApplicationRequest";
import { ApplicationRequestHandler, ApplicationMiddleware, isMiddleware } from "../../Middlewares/Types/MiddlewareTypes";
import { ClassConstructor } from "../../Utils/Types/CommonTypes";
import ApplicationContext from "../../Configurations/ApplicationContext";


type MiddlewareFactory = FunctionReturning<ApplicationRequestHandler> | Constructor<ApplicationMiddleware>;

/**
 * Decorador que combina inyección de dependencias y aplicación de middleware.
 * @param middlewareFactory - La fábrica (o clase) que define el middleware y sus dependencias.
 */
export default function Middlewares(middlewareFactory: MiddlewareFactory | MiddlewareFactory[]) {
	return (target: any, propertyKey: string | symbol) => {

		/**Normalizamos a array */
		const factories: MiddlewareFactory[] = Array.isArray(middlewareFactory) ? middlewareFactory : [middlewareFactory];

		/** Envolvemos cada fabrica, y por cada factory creamos una función que 
		 * en tiempo de ejecución, extrae el contenedor del request, resuelve las 
		 * dependencias del middleware y ejecuta su lógica. */
		const wrappedMiddlewares = factories.map((factory) => {
			return (req: ApplicationRequest, res: Response, next: NextFunction) => {

				// Obtenemos el contenedor inyectado en la request (awilix-express se encarga de asignarlo)
				const applicationContext = req.container.Resolve<ApplicationContext>("applicationContext");

				/** Se declara como any ya que no sabemos si el middleware es una función o 
				 * una clase que extiende de ApplicationMiddleware */
				let resolvedMiddleware:any;

				if (isMiddleware(factory)) {
					//console.log("Es ApplicationMiddleware =>", factory);

					// Resolvemos el middleware si se trata de una instancia de ApplicationMiddleware
					resolvedMiddleware = req.container.ResolveClass(factory as ClassConstructor<ApplicationMiddleware>);

					// Si es un objeto que implementa ApplicationMiddleware, intentamos invocar su método Intercept.
					return (resolvedMiddleware as ApplicationMiddleware).Intercept(req, res, next) ;
				}
				else if (typeof factory === 'function') {

					// Resolvemos el middleware si se trata de una funcion
					resolvedMiddleware = req.container.ResolveFactory(factory);
					return (resolvedMiddleware as ApplicationRequestHandler)(req, res, next);
				}
				else {
					throw new InternalServerException(
						"MiddlewareWithInjection",
						"middleware-instance-type-exception",
						applicationContext,
						__filename
					);
				}
			};
		})

		/** Convertir propertyKey a string en caso de que sea un symbol. */
		const keyName = typeof propertyKey === 'string' ? propertyKey : propertyKey.toString();

		/** Usamos el decorador @before de awilix-express para que el middleware se ejecute
			antes del método del controlador.*/
		return before(wrappedMiddlewares)(target, keyName);
	};
}
