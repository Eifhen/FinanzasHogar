import ApplicationServer from "../JFramework/Server/ApplicationServer";
import Startup from "./Server/Startup";



/** Inicializa el servidor */
new ApplicationServer({ startupBuilder: new Startup() }).Start();