/**
 * Prepares the BeRocket "Advanced Labels" stylesheet saved in wp-admin
 * (GlobalData.labelsCss) for the storefront.
 *
 * Margins are kept exactly as set in wp-admin (they are how the label offsets
 * and stacking are designed, e.g. `margin:-10px`, `margin-top:65px`). Only the
 * top/left/right/bottom offsets are clamped to 0: negative ones would push a
 * label out of the product box, and the plugin overrides them with 0 anyway.
 * Containment of the labels is enforced in globals.css.
 */
export function sanitizeLabelsCss(css: string | undefined | null): string {
  if (!css) return "";
  return css
    .replace(/<\/style/gi, "")
    .replace(/(?<![\w-])(top|left|right|bottom)\s*:\s*-\s*[\d.]+(px|em|rem|%)/gi, "$1:0");
}
