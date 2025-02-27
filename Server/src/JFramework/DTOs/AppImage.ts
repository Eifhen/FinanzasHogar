import { z } from "zod";
import EntitySchema from "./Data/EntitySchema";
import SchemaProperty from "../Decorators/SchemaProperty";
import { EN } from "../Translations/en_US";

export default class AppImage extends EntitySchema {

  /** Id de la imagen */
  @SchemaProperty(z.string().optional())
  public id?: string = "";

  /** Url de la imagen */
  @SchemaProperty(z.string().optional())
  public url?: string = "";

  /** Nombre del archivo */
  @SchemaProperty(z.string())
  public nombre: string = "";

  /** Nombre de la extensión del archivo */
  @SchemaProperty(z.string())
  public extension: string = "";

  /** Archivo en base64 */
  @SchemaProperty(z.string().optional())
  public base64: string = "";

  /** Tamaño del archivo en bytes */
  @SchemaProperty(z.number().refine(size => size <= 10 * 1024 * 1024, { // 10MB en bytes
    message: EN["image-size-exception"]
  }))
  public size: number = 0;

  /** Fecha de carga del archivo */
  @SchemaProperty(z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) {
      return new Date(arg);
    }
    return arg;
  }, z.date()))
  public fecha: Date = new Date();

}

