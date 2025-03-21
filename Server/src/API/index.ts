import ServerManager from "../JFramework/Configurations/ServerManager";
import Startup from "./Server/Startup";




/** Inicializa el servidor */
new ServerManager({ startup: Startup }).Start();