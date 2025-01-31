import ApplicationContext from "../Application/ApplicationContext";
import { ApplicationPromise, IApplicationPromise } from "../Application/ApplicationPromise";
import IEmailManager from "./Interfaces/IEmailManager";
import ILoggerManager, { LoggEntityCategorys } from "./Interfaces/ILoggerManager";
import LoggerManager from "./LoggerManager";
import { InternalServerException } from "../ErrorHandling/Exceptions";
import { EmailData } from "./Types/EmailManagerTypes";
import IFileManager from "./Interfaces/IFileManager";
import path from "path";
import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import Mail from "nodemailer/lib/mailer";

interface IEmailManagerDependencies {
  applicationContext: ApplicationContext;
  fileManager: IFileManager;
}

export default class EmailManager implements IEmailManager {

  /** Instancia del logger */
  private readonly _logger: ILoggerManager;

  /** Contexto de aplicación */
  private readonly _applicationContext: ApplicationContext;


  /** Manejador de archivos */
  private readonly _fileManager: IFileManager;

  constructor(deps:IEmailManagerDependencies){

    this._applicationContext = deps.applicationContext;
    this._fileManager = deps.fileManager;

    this._logger = new LoggerManager({
      entityName: "EmailManager",
      entityCategory: LoggEntityCategorys.MANAGER,
      applicationContext: this._applicationContext,
    });
  }

  /** Método que permite enviar un email a un usuario */
  public SendEmail = async <T>(data:EmailData<T>) : IApplicationPromise<void> => {
    try {
      this._logger.Activity("SendEmail");
      return ApplicationPromise.Try((async ()=> {
        try {
          /** Email provider */
          const provider = this._applicationContext.settings.emailProviderConfig.currentProvider;

          /** Obtenemos el archivo html */
          const filePath = path.join(__dirname, "../", "templates", data.template.name);
          const html = await this._fileManager.ReadHTML(filePath);

          /** Datos para inyectar en la plantilla */
          const template = handlebars.compile(html); 
          const htmlToSend = template(data.template.data);

          /** Preparamos el transporter */
          const transporter = nodemailer.createTransport({ 
            service: provider.service, 
            auth: { 
              user: provider.auth.user, 
              pass: provider.auth.pass 
            } 
          });

          /** Mail options */
          const mailOptions: Mail.Options = {
            from: provider.auth.user,
            to: data.recipientEmail,
            subject: data.title,
            html: htmlToSend,
            attachments: data.attatchments
          }

          /** Enviar correo */
          transporter.sendMail(mailOptions, (err, info)=>{
            if(err){
              console.log("Error al enviar correo =>", err);
              throw err;
            }
            else{
              console.log("Correo enviado", info.response);
            }
          });

        }
        catch(err:any){
          console.log("Catch =>", err);
          throw err;
        }
      })());
    }
    catch(err:any){
      this._logger.Error("ERROR", "SendMail", err);
      throw new InternalServerException(err.message, this._applicationContext, __filename, err);
    }
  }

}





/**
 import nodeMailer from "nodemailer";

const html = ` 
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap');
      .image {
        object-fit: cover;
        object-position: center;
        width: 240px;
        height: 240px;
        border-radius: 25px;
      }

      h1 {
        font-family: "Nunito", sans-serif;
      }

      .card {
        padding: 20px;
        border-radius: 25%;
        box-shadow: 3px 5px 10px #c2c0c060;
        background-color: #f7f7f7;
        width: 300px;
        height: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
  </style>

  <div class="card">
    <h1>Probando NodeMailer</h1>
    <p>Mensaje para probar las funcionalidades de NodeMailer</p>
    <img class="image" src="cid:uniqueid" width="400" />
  </div>
`

export async function SendMail () {
  try {
    const transporter = nodeMailer.createTransport({
      // host: "mail.openjavascript.info",
      // port: 465,
      // secure: true,
      service: "gmail",
      auth: {
        user: 'jimenezg905@gmail.com',
        pass: 'viyb zuah ajvz dxum'
      }
    });
  
    const info = await transporter.sendMail({
      from: "jimenezg905@gmail.com",
      to: "jimenezg905@protonmail.com",
      subject: "Testing NodeMailer",
      html: html,
      attachments: [{
        filename: 'imagen',
        path: './src/assets/images/portafolio.png',
        cid: 'uniqueid'
      }]
    });
  
    console.log("Message Send =>", info.messageId);
  }
  catch(err){
    console.log("err =>", err);
  }
}


 */