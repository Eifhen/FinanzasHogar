import { DataBase } from "../Infraestructure/DataBase";
import ServerManager from "../JFramework/_Internal/ServerManager";
import Startup from "./Server/Startup";




/** Inicializa el servidor */
new ServerManager<DataBase>({ startup: Startup }).Start();