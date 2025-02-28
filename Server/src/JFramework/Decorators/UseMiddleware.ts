/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Response, NextFunction } from 'express';
import { before, Constructor } from 'awilix-express';
import { ApplicationRequestHandler, ApplicationMiddleware, isMiddleware } from '../Middlewares/types/MiddlewareTypes';
import { FunctionReturning } from 'awilix';
import ApplicationContext from '../Application/ApplicationContext';
import ApplicationRequest from '../Application/ApplicationRequest';
import { InternalServerException } from '../ErrorHandling/Exceptions';



type MiddlewareFactory = FunctionReturning<ApplicationRequestHandler> | Constructor<ApplicationMiddleware>;

/**
 * Decorador que combina inyección de dependencias y aplicación de middleware.
 * @param middlewareFactory - La fábrica (o clase) que define el middleware y sus dependencias.
 */
export default function Middleware(middlewareFactory: MiddlewareFactory | MiddlewareFactory[]) {
	return (target: any, propertyKey: string | symbol) => {

		/**Normalizamos a array */
		const factories: MiddlewareFactory[] = Array.isArray(middlewareFactory) ? middlewareFactory : [middlewareFactory];

		/** Envolvemos cada fabrica, y por cada factory creamos una función que 
		 * en tiempo de ejecución, extrae el contenedor del request, resuelve las 
		 * dependencias del middleware y ejecuta su lógica. */
		const wrappedMiddlewares = factories.map((factory) => {
			return (req: ApplicationRequest, res: Response, next: NextFunction) => {
				// Obtenemos el contenedor inyectado en la request (awilix-express se encarga de asignarlo)
				const container = req.container;
				const applicationContext = container.resolve<ApplicationContext>("applicationContext");
				let resolvedMiddleware: ApplicationRequestHandler | ApplicationMiddleware;

				if (isMiddleware(factory)) {
					// console.log("Es ApplicationMiddleware =>", factory);

					// Resolvemos el middleware si se trata de una instancia de ApplicationMiddleware
					resolvedMiddleware = container.build(factory as Constructor<ApplicationMiddleware>);

					// Si es un objeto que implementa ApplicationMiddleware, intentamos invocar su método Intercept.
					return resolvedMiddleware.Intercept(req, res, next);
				}
				else if (typeof factory === 'function') {
					// console.log("Es Middleware Funcion =>", factory);

					// Resolvemos el middleware si se trata de una funcion
					resolvedMiddleware = container.build(factory);
					return resolvedMiddleware(req, res, next);
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
