import BusinessTranslatorProvider from "../Infraestructure/Translations/BusinessTranslatorProvider";
import ServerInitializerManager from "../JFramework/Configurations/ServerInitializerManager";
import Startup from "./Server/Startup";




/** Inicializa el servidor */
new ServerInitializerManager({
	startup: Startup,
	translator: BusinessTranslatorProvider
}).Start();