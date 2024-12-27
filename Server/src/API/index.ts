import ApplicationServer from "../JFramework/Application/ApplicationServer";
import Startup from "./Server/Startup";



/** Inicializa el servidor */
new ApplicationServer({ startupBuilder: new Startup() }).Start();