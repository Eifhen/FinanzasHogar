import { Application } from "express";
import express from 'express';
import cors, { CorsOptions } from 'cors';
import { DEFAULT_JSON_RESPONSE_LIMIT } from "../Utils/const";


export default class ServerConfig {

	/** Instancia de express */
	private _app: Application;

	constructor(app: Application) {

		/** Inicializamos nuestra instancia de express */
		this._app = app;
	}

	/** Método que maneja la respuesta JSON de la aplicación */
	public AddJsonResponse (limit: string = DEFAULT_JSON_RESPONSE_LIMIT){
		const json = express.json({ limit });
		this._app.use(json);
	}

	/** Método que maneja los Cors de la aplicación */
	public async AddCors(options?: CorsOptions): Promise<void>{
		this._app.use(cors({
			origin: "*",
			methods: 'GET,PUT,POST,DELETE',
			credentials: true,
			...options
		}));
	}
	
}