import ServerManager from "../JFramework/_Internal/ServerManager";
import Startup from "./Server/Startup";




/** Inicializa el servidor */
new ServerManager({ startup: Startup }).Start();