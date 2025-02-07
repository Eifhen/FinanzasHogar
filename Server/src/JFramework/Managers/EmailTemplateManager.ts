import { EmailTemplateType, EmailTemplateTypes } from "../Utils/EmailTemplates";
import { IEmailTemplateManager } from "./Interfaces/IEmailTemplateManager";
import { EmailVerificationData } from "./Types/EmailDataManagerTypes";



/** Clase que permite manejar los templates que se van a enviar por correo */
export default class EmailTemplateManager implements IEmailTemplateManager {


  constructor(){}

  /** Permite obtener un determinado template */
  public GetTemplate = <TemplateData>(templateName:EmailTemplateType, templateData:TemplateData) : string  => {
    switch (templateName) {
      case EmailTemplateTypes.VERIFICATION_EMAIL:
        return this.VerificationEmail(templateData as EmailVerificationData);
    
      default:
        throw new Error(`Template "${templateName}" no está definido.`);
    }
  }

  /** Email para verificación */
  private VerificationEmail = (data:EmailVerificationData) => {
  
    return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.headTitle}</title>
    <style>
      ::root {
  
      }
  
      body, table, td, a {
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
  
      table, td {
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }
  
      img {
        -ms-interpolation-mode: bicubic;
      }
  
      table {
        border-collapse: collapse !important;
      }
  
      body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background-color: #ECF0F1;
      }
  
      a:hover {
        opacity: 0.8;
        cursor: pointer;
      }

       @media screen and (max-width: 600px){

          .container {
            width: 100% !important;
          }

          .card_container {
            padding: 0px !important;
          }

          .card {
            height: auto !important;
            width: 90% !important;
          }
        
          .card_button {
            font-size: 16px !important;
            width: 50% !important; 
          }

          .footer_logo {
            display:flex !important;
            align-items: center !important;
            justify-content: center !important;
          }

          .footer_img {
            margin: auto !important;
            display: flex !important;
          }
       }

    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #ECF0F1;">
  
    <!-- Contenedor principal -->
    <table border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
      <tr>
        <td align="center">
          <table class="container" border="0" cellpadding="0" cellspacing="0" style="width:80%; background-color: white;">
            
            <!-- Homer Budget Logo -->
            <tr>
              <td align="center" style="padding: 30px 0px 20px 0px;">
                <img src="${data.homeBudgetLogo}" 
                  alt="logo home_budget" 
                  style="
                    display: block; 
                    width: 120px; 
                    height: auto; 
                    object-fit: cover; 
                    object-position: center; 
                  "
                  >
              </td>
            </tr>
  
            <!-- Divider -->
            <tr><td height="20px"></td></tr>
  
            <!-- Card -->
            <tr>
              <td align="center" class="card_container" style="padding: 20px 20px">
                <div 
                  class="card"
                  style="
                    border: 1px solid #ccc; 
                    border-radius: 25px;
                    width: 65%;
                    height: 300px;
                  ">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" height="100%">
                    <tr>
                      <td align="center" style="padding: 20px;">
                        <h1 style="color:black; margin: 0 0 20px 0; font-weight: bold; font-family: Arial, sans-serif; font-size: 20px;">
                          ${data.subject}
                        </h1>
                        <p style="color: black; margin: 0; padding: 0; font-family: Arial, sans-serif; font-size: 16px; width: 90%; word-wrap: break-word;">
                          ${data.paragraph.greating1} 
                          <span style="color: ${data.paragraph.accentColor} !important;">
                            ${data.paragraph.recipientName}
                          </span>,
                          ${data.paragraph.greating2} 
                          <span style="color: ${data.paragraph.accentColor} !important;">
                            ${data.paragraph.bussinessName}
                          </span>.
                          ${data.paragraph.argument}
                        </p>
                        <a 
                          class="card_button"
                          href="${data.button.link}" 
                          style="
                            display: inline-block; 
                            font-family: Arial, sans-serif; 
                            font-weight: bold; 
                            font-size: 18px; 
                            color: white; 
                            text-decoration: none; 
                            padding: 10px; 
                            border-radius: 25px; 
                            margin-top: 20px; 
                            width: 40%; 
                            text-align: center;
                            background-color: ${data.button.color};
                           ">
                            ${data.button.text}
                        </a>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>
  
            <!-- Divider -->
             <tr><td height="40px"></td></tr>
          
            <!-- Footer -->
            <tr>
              <td align="center" style="padding: 0;">
               
                <div class="footer_logo" style="
                  position: relative; 
                  width: 100%; 
                  height: 300px; 
                  overflow: hidden;
                  background-image: url(${data.blackWave});
                  background-repeat: no-repeat;
                  background-position: center;
                  background-size: cover;
                  "
                >
                  <img 
                    class="footer_img"
                    src="${data.portfolioLogo}" 
                    alt="gjimenez_logo" 
                    style="
                      width: 140px; 
                      height: 140px; 
                      object-fit: cover; 
                      object-position: center; 
                      background-color: white;
                      display: inline-block;
                      margin: 10% 0 0 0;
                    "
                  />
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `
  }

}