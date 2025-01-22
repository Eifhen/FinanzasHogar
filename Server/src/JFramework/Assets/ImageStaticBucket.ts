import path from "path";



/** Contenedor de imagenes locales  */
export const ImageStaticBucket = {
  HomeBudget: path.join(__dirname, 'images', 'home_budget.png'),
  Portafolio: path.join(__dirname, 'images', 'portafolio.png')
} as const;
