/**
 * Advanced Product Labels (BeRocket plugin) for one placement. The HTML is
 * rendered by the plugin itself on the backend (text, template, position and
 * the conditions that decide which products get it are all managed in
 * wp-admin → BeRocket → Advanced Labels) and styled by the stylesheet injected
 * once in the root layout (GlobalData.labelsCss).
 *
 * "image" labels position themselves absolutely against the nearest `relative`
 * ancestor — place this inside the product image's wrapper. "label" labels flow
 * in place, under the image. `rtl` + `contents` mirror the legacy RTL body
 * class the plugin's left/right rules expect, without adding a layout box.
 */
export function ProductLabels({ html }: { html?: string }) {
  if (!html) return null;
  return <div className="rtl contents" dangerouslySetInnerHTML={{ __html: html }} />;
}
