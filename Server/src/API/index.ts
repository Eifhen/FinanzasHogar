import ServerInitializerManager from "../JFramework/Configurations/ServerInitializerManager";
import Startup from "./Server/Startup";




/** Inicializa el servidor */
new ServerInitializerManager({ startup: Startup }).Start();