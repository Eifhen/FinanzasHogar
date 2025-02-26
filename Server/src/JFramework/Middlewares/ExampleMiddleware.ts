import { NextFunction, Response } from "express";
import ApplicationRequest from "../Application/ApplicationRequest";
import { ApplicationMiddleware, ApplicationRequestHandler, MiddleWareFunction } from "./types/MiddlewareTypes";
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

  public Intercept : ApplicationRequestHandler = async (req: ApplicationRequest, res: Response, next:NextFunction) => {

    console.log("Prueba Middleware Example =>");
    return next();
  }
  
  public Init = () : MiddleWareFunction | Promise<MiddleWareFunction> => {
    return this.Intercept;
  } 
}