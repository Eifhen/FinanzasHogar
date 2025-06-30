import ApplicationContext from "../Configurations/ApplicationContext";
import { BaseException, InvalidParameterException, NullParameterException } from "../ErrorHandling/Exceptions";
import { AES_256_IV_LENGTH, AES_256_SECRET_LENGTH } from "../Utils/const";
import { HttpStatusName } from "../Utils/HttpCodes";
import IsNullOrEmpty from "../Utils/utils";
import IEncrypterManager, { EncryptionData, EncryptionType } from "./Interfaces/IEncrypterManager";
import ILoggerManager, { LoggEntityCategorys, LoggerTypes } from "./Interfaces/ILoggerManager";
import LoggerManager from "./LoggerManager";
import bcrypt from 'bcrypt';
import crypto from 'crypto';

interface EncrypterManagerDependencies {
	applicationContext: ApplicationContext;
}
export default class EncrypterManager implements IEncrypterManager {

	/** Instancia del logger */
	private _logger: ILoggerManager;

	private readonly saltRounds: number = 10;

	/** Contexto de aplicación */
	private readonly _applicationContext: ApplicationContext;

	constructor(deps: EncrypterManagerDependencies) {
		// Instanciamos el logger
		this._logger = new LoggerManager({
			entityCategory: LoggEntityCategorys.MANAGER,
			applicationContext: deps.applicationContext,
			entityName: "EncrypterManager",
		});

		this._applicationContext = deps.applicationContext;
	}

	/** Aplica cifrado a jun valor utilizando un encriptado con hash */
	private async ApplyHashEncryption(value: string): Promise<string> {
		try {
			this._logger.Activity("ApplyHashEncryption");
			const salt = await bcrypt.genSalt(this.saltRounds);
			const result = await bcrypt.hash(value, salt);
			return result;
		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.ERROR, "ApplyHashEncryption", err);

			throw new BaseException(
				"ApplyHashEncryption",
				HttpStatusName.InternalServerError,
				err.message,
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Aplica el cifrado AES-256-CBC al valor ingresado
	 * @param {string} secret - Secreto de 32 bytes para encriptar
	 * @param {string} value - Valor que se desea encriptar */
	private async ApplyAES256Encryption(value: string, secret: string): Promise<string> {
		try {
			this._logger.Activity("ApplyAES256Encryption");

			/** Validamos que value no esté nulo o vacío */
			if (IsNullOrEmpty(value)) {
				throw new NullParameterException("ApplyAES256Encryption", "value", this._applicationContext, __filename);
			}

			/** Validamos que se mande un secret */
			if (IsNullOrEmpty(secret)) {
				throw new NullParameterException("ApplyAES256Encryption", "secret", this._applicationContext, __filename);
			}

			const secretBuffer = Buffer.from(secret, "hex");

			/** Validamos que el secret sea de una longitud valida */
			if (secretBuffer.length !== AES_256_SECRET_LENGTH) {
				throw new InvalidParameterException("ApplyAES256Encryption", "secret", this._applicationContext, __filename);
			}

			// Generar IV de 16 bytes
			const iv = crypto.randomBytes(AES_256_IV_LENGTH);
			const cipher = crypto.createCipheriv("aes-256-cbc", secretBuffer, iv);

			let encrypted = cipher.update(value, "utf8", "base64");
			encrypted += cipher.final("base64");

			// Retornamos IV + cifrado codificado en base64 (como JSON seguro)
			const payload = JSON.stringify({
				iv: iv.toString("base64"),
				value: encrypted
			} as EncryptionData);

			return Buffer.from(payload).toString("base64");
		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.ERROR, "ApplyAES256Encryption", err);

			throw new BaseException(
				"ApplyAES256Encryption",
				HttpStatusName.InternalServerError,
				err.message,
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Desencripta una clave cifrada con el formato AES-256-CBC
 * @param {string} secret - Secreto de 32 bytes para desencriptar
 * @param {string} value - Valor que se desea desencriptar */
	private async ApplyAES256Decryption(value: string, secret: string): Promise<string> {
		try {
			this._logger.Activity("ApplyAES256Decryption");

			/** Validamos que value no esté nulo o vacío */
			if (IsNullOrEmpty(value)) {
				throw new NullParameterException("ApplyAES256Decryption", "value", this._applicationContext, __filename);
			}

			/** Validamos que se mande un secret */
			if (IsNullOrEmpty(secret)) {
				throw new NullParameterException("ApplyAES256Decryption", "secret", this._applicationContext, __filename);
			}

			const secretBuffer = Buffer.from(secret, "hex");

			/** Validamos que el secret sea de una longitud valida */
			if (secretBuffer.length !== AES_256_SECRET_LENGTH) {
				throw new InvalidParameterException("ApplyAES256Decryption", "secret", this._applicationContext, __filename);
			}

			// Decodificamos el contenido
			const decoded = Buffer.from(value, 'base64').toString('utf8');

			const parsed: EncryptionData = JSON.parse(decoded);

			const iv = Buffer.from(parsed.iv, "base64");
			const encryptedText = parsed.value;

			const decipher = crypto.createDecipheriv("aes-256-cbc", secretBuffer, iv);

			let decrypted = decipher.update(encryptedText, "base64", "utf8");
			decrypted += decipher.final("utf8");

			return decrypted;

		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.ERROR, "ApplyAES256Decryption", err);

			throw new BaseException(
				"ApplyAES256Decryption",
				HttpStatusName.InternalServerError,
				err.message,
				this._applicationContext,
				__filename,
				err
			);
		}
	}


	/** Método que permite encryptar un valor string */
	public async Encrypt(value: string, secret?: string, type: EncryptionType = "hash"): Promise<string> {
		try {
			this._logger.Activity("Encrypt");

			switch (type) {
				case "hash":
					return await this.ApplyHashEncryption(value);

				case "aes-256-cbc":
					return await this.ApplyAES256Encryption(value, secret ?? "");

				default:
					throw new InvalidParameterException(
						"Encrypt",
						"type",
						this._applicationContext,
						__filename
					);
			}

		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.ERROR, "Encrypt", err);

			throw new BaseException(
				"Encrypt",
				HttpStatusName.InternalServerError,
				err.message,
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Función que permite desencriptar */
	public async Decrypt(value: string, secret?: string, type: string = "aes-256-cbc"): Promise<string> {
		try {
			this._logger.Activity("Decrypt");

			switch (type) {
				case "aes-256-cbc":
					return await this.ApplyAES256Decryption(value, secret ?? "");

				default:
					throw new InvalidParameterException(
						"Decrypt",
						"type",
						this._applicationContext,
						__filename
					);
			}

		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.ERROR, "Decrypt", err);

			throw new BaseException(
				"Decrypt",
				HttpStatusName.InternalServerError,
				err.message,
				this._applicationContext,
				__filename,
				err
			);
		}
	}

	/** Función que permite comparar dos valores */
	public async Compare(value: string, hashedValue: string): Promise<boolean> {
		try {
			this._logger.Activity("Compare");
			return await bcrypt.compare(value, hashedValue);
		}
		catch (err: any) {
			this._logger.Error(LoggerTypes.ERROR, "Compare", err);

			throw new BaseException(
				"Compare",
				HttpStatusName.InternalServerError,
				err.message,
				this._applicationContext,
				__filename,
				err
			);
		}
	}
}