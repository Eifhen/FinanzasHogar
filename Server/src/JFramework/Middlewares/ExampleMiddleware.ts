import { NextFunction, Response } from "express";
import ApplicationRequest from "../Application/ApplicationRequest";
import { ApplicationMiddleware } from "./types/MiddlewareTypes";
import ApplicationContext from '../Application/ApplicationContext';



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
			console.log("Prueba Example =>");
			return next();
		}
		catch(err:any){
			return next(err);
		}
	}

	
	// public Init () : MiddleWareFunction | Promise<MiddleWareFunction> {
	//   return this.Intercept;
	// } 

}