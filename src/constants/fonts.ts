/**
 * Available fonts for widget styling
 * These fonts can be loaded from Google Fonts API
 */
export const AVAILABLE_FONTS = [
  'Roboto',
  'Avenir',
  'Nunito',
  'Spectral',
  'Yrsa',
  'Josefin+Sans',
  'Open+Sans+Condensed',
  'Oswald',
  'Montserrat',
  'Sanchez',
  'Playfair+Display',
  'Maven+Pro',
  'Hind',
  'Karla',
  'Rubik',
] as const

export type AvailableFont = (typeof AVAILABLE_FONTS)[number]
