import { NextFunction, Response } from "express";
import ApplicationRequest from "../Helpers/ApplicationRequest";
import { ApplicationMiddleware } from "./Types/MiddlewareTypes";
import ApplicationContext from '../Context/ApplicationContext';



interface ExampleMiddlewareDependencies {
	applicationContext:ApplicationContext;
}

export default class ExampleMiddleware extends ApplicationMiddleware {

	private readonly _applicationContext:ApplicationContext;

	constructor(deps:ExampleMiddlewareDependencies){
		super();
		this._applicationContext = deps.applicationContext;
	}

	public async Intercept (req: ApplicationRequest, res: Response, next: NextFunction) : Promise<any> {
		try {
			console.log("Prueba Example");
			return next();
		}
		catch(err:any){
			return next(err);
		}
	}

}