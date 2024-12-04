import cors, { CorsOptions } from 'cors';
import express, { Application, Router } from "express";
import { Server } from 'http';
import { MiddleWareFunction, WebServerBuildOptions } from './types/WebServerConfigTypes';
import { loadControllers } from 'awilix-express';


/**
  Clase que maneja la configuración del servidor web
  @method Start - Inicia el servidor web
  @method Build - Aplica la configuración definida a nuestro servidor web 
*/
export default class WebServerConfig {

  private app:Application;
  private PORT: number = Number(process.env.PORT ?? 0);
  private api_route: string = process.env.API_BASE_ROUTE ?? "";
  private controllers_route: string = process.env.CONTROLLERS ?? "";

  constructor(){
    this.app = express();
  }

  /** Método privado que inicializa los controladores */
  private LoadControllers = () => {
    this.app.use(
      this.api_route, 
      loadControllers(this.controllers_route, { cwd: __dirname})
    );
  }

  /** Método privado que maneja los middlewares de la aplicación */
  private Middlewares = (middlewares?: MiddleWareFunction[]) => {
    if(middlewares && middlewares.length > 0){
      middlewares.forEach(middleware => {
        this.app.use(middleware)
      })
    }
  }

  /** Método privado que maneja los Cors de la aplicación */
  private CorsConfig = (options?: CorsOptions) => {
    this.app.use(cors({
      origin: "*",
      methods: 'GET,PUT,POST,DELETE',
      credentials: true,
      ...options
    }));
  }

  /** Método privado que maneja la respuesta JSON de la aplicación */
  private JsonConfig = (limit: string = "10mb") => {
    const json = express.json({limit: limit});
    this.app.use(json);
  }

  /** 
   @description - Método que aplica la configuración de nuestro webservice
   @param {WebServerBuildOptions} options - Objeto de configuración del webService
   @returns - Instancia de la clase {WebServerConfig} 
  */
  public Build = (options?:WebServerBuildOptions) : WebServerConfig => {
    this.CorsConfig(options?.cors);
    this.JsonConfig(options?.json_limit);
    this.Middlewares(options?.middlewares);
    this.LoadControllers();
    this.Middlewares(options?.nextMiddlewares);

    return this;
  }

  /**
   * @description - Método que inicializa el servidor webn
   * @param callback - Callback a ejecutar cuando el servidor web inicia, recibe el Port como parámetro
   * @returns Server - Retorna el objeto del servidor web
  */
  public Start = (callback?: (port:number)=> void) : Server =>  {
    return this.app.listen(this.PORT, ()=>{
      if(callback){
        callback(this.PORT);
      }
    });
  }
}