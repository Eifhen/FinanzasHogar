import { asClass, asValue, AwilixContainer, ContainerOptions, createContainer, InjectionMode } from "awilix";
import { scopePerRequest } from "awilix-express";
import { MiddleWareFunction } from "./types/WebServerConfigTypes";
import { ITestService } from "../../Application/Services/Interfaces/ITestService";
import TestService from "../../Application/Services/TestService";
import ApplicationContext from "./ApplicationContext";
import IErrorManager from "../Shered/ErrorHandling/Interfaces/IErrorManager";
import ErrorManager from "../Shered/ErrorHandling/ErrorManager";
import DataBaseConfig from "./DataBaseConfig";
import { DataBase } from "../Data/DataBase";
import { Kysely } from "kysely";
import IDataBaseConfig from "./types/IDataBaseConfig";


/**
  Esta clase maneja nuestro contenedor de dependencias
*/
export default class AppContainerConfig {

  /** Propiedad que contiene nuestro contenedor de dependencias */
  private container?: AwilixContainer;

  constructor(options?: ContainerOptions){
    this.container = createContainer({
      injectionMode: InjectionMode.PROXY,
      strict: true,
      ...options
    })
  }

  /**
    @description - Carga los servicios al contenedor de dependencias 
  */
  private RegisterServices = () => {
    this.container?.register({
      
      // database
      database: asClass<IDataBaseConfig>(DataBaseConfig).singleton(),

      // context
      context: asClass<ApplicationContext>(ApplicationContext).scoped(),
       
      // services
      testService: asClass<ITestService>(TestService).scoped(),

      // managers
      errorManager: asClass<IErrorManager>(ErrorManager).scoped(),
     

    });
  }

 
  /** 
   * @description - Método que nos permite manejar nuestro contenedor dentro de express  
   * @returns - retorna un middleware que nos permite manejar nuestro contenedor dentro de express 
  */
  public GetContainer = () : MiddleWareFunction => {
    this.RegisterServices();
    return scopePerRequest(this.container!);
  }

}