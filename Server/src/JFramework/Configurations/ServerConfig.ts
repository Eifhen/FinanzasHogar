import { Application } from "express";
import express from 'express';
import cors, { CorsOptions } from 'cors';


export default class ServerConfig {

  /** Instancia de express */
  private _app: Application;

  constructor(app: Application) {

    /** Inicializamos nuestra instancia de express */
    this._app = app;
  }

  /** Método que maneja la respuesta JSON de la aplicación */
  AddJsonResponse = (limit: string = "10mb") => {
    const json = express.json({ limit: limit });
    this._app.use(json);
  }

  /** Método que maneja los Cors de la aplicación */
  public AddCors = async (options?: CorsOptions): Promise<void> => {
    this._app.use(cors({
      origin: "*",
      methods: 'GET,PUT,POST,DELETE',
      credentials: true,
      ...options
    }));
  }
  
}