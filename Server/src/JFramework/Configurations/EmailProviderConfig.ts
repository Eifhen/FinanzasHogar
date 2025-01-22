


export interface IEmailProviderConfig {
  currentProvider: string;
  providers:IEmailProvider[];
}

export interface IEmailProvider {
  service: string;
  auth: {
    user: string,
    pass: string
  }
}

export class EmailProviderConfig {

  /** Objeto de configuracion */
  private emailConfig = JSON.parse(process.env.EMAIL_CONFIG ?? "") as IEmailProviderConfig; 
  
  /** Proveedores de email */
  public providers: IEmailProvider[] = this.emailConfig?.providers ?? [];

  /** Nombre del proveedor actual */
  public currentProviderName: string = this.emailConfig?.currentProvider ?? "";

  public currentProvider: IEmailProvider;

  constructor(){
    this.currentProvider = this.GetCurrentProvider();
  }

  /** Obtiene el proveedor de email actual */
  private GetCurrentProvider = () : IEmailProvider => {
    const find = this.providers.find(m => m.service === this.currentProviderName);
    
    return find ? find : {
      service: "",
      auth: {
        user: "",
        pass: ""
      }
    }
  }

}