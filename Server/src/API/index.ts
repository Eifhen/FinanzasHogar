import ServerBuilder from "../JFramework/Server/ServerBuilder";
import Startup from "./Server/Startup";



/** Inicializa el servidor */
new ServerBuilder({ startupBuilder: new Startup() }).Start();