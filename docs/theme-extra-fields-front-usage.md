# WoodMart extra fields — how the legacy front uses them, and React status

Checked 2026-10-12 against the legacy WordPress pages (dev backend `192.168.0.107/tamarcosmetics`):
product `/product/test/` (admin post 25483), category `/product-category/sale/` (term 567),
and the React code in `src/`. Data now lives in the new fields from
`wps-woo-extended/module/tamar-extra-fields-module.php` (theme keys are still in the DB, untouched).

## Product (post 25483 "Test")

| Element | New key (theme key) | Legacy front output | React today | To do |
|---|---|---|---|---|
| Custom tab 1 (FAQ) | `_tamar_custom_tab_1_title/_content` (`_woodmart_product_custom_tab_title/_content`) | Extra tab `wd_custom_tab`, last in the tab list, title "FAQ", content as HTML. Shown only when title/content set. | **Missing.** `ProductTabs` renders only `tamarTabs` (YITH Tab Manager: description, אחריות, אודות המותג, משלוחים והחזרות, reviews). | Add to GraphQL and render as the last tab. |
| Custom tab 2 | `_tamar_custom_tab_2_*` | Same mechanism (second tab). Legacy page for "test" did not render tab 2 ("Who It Is" not found) — its content/title may be empty for post 25483; check where it is set. | Missing | Same, only if non-empty. |
| Product video URL | `_tamar_product_video_url` (`_woodmart_product_video`) | Button "צפייה בוידאו" (`.product-video-button`) in the gallery, linking to the YouTube URL (post 25483 has `youtube.com/watch?v=LXb3EKWsInQ`). | **Missing.** React has per-image `tamarGalleryVideos` (play button over an image) but not this single-URL button. | Add field to GraphQL; render the button next to "לחצו להגדלה". |
| "New" label / date | `_tamar_new_label`, `_tamar_new_label_date` | No label rendered anywhere (empty on all products; legacy uses `product-labels` plugin for "-90%" and brand labels). | Not applicable | Only if the shop starts using it. |
| Hide related products | `_tamar_related_off` | Empty on all products. | Not applicable | Only if used. |
| Gallery videos | `_tamar_gallery_videos` (was `woodmart_wc_video_gallery`) | Per-image video in gallery. | Done (`tamarGalleryVideos`). | — |
| Tamar's tip | `tip_description` | `.tamar-product-tip` "הטיפ של תמר" block. | Done (`TamarTip`). | — |

Not used by the front (theme layout settings, all defaults): `_woodmart_main_layout`, `sidebar_width`, `custom_sidebar`,
`whb_header`, `product_design`, `single_product_style`, `thums_position`, `extra_content`, `extra_position`.

## Category (term 567 "Sale") and brand

| Element | Key | Legacy front output | React today | To do |
|---|---|---|---|---|
| Extra description | `category_extra_description_text` (same key, plugin-owned) | `.wd-term-desc` inside the Elementor widget `wd_shop_archive_extra_description` ("Extra description 2"), in an accordion. | Done (`readMoreText`, category + brand pages). | — |
| FAQ description | `product_cat_extra_desc` | Printed through a shortcode inside an accordion item ("Extra FAQ Description 1"). | Done (`FaqAccordion`, "שאלות נפוצות"). | — |
| Banners | `product_taxonomy_banner` / `_mobile_banner` | Banner at the top. | Done (`tamarCategoryInfo`). | — |
| Carousel | `enable_category_carousel`, `category_carousel_items` | Carousel (off for Sale). | Done (`CategoryCarousel`). | — |
| Title image | `tamar_title_image` (`title_image`) | **Not confirmed.** Empty for Sale. Real value only on term 540; the legacy 404'd when I rebuilt that slug, so rendering was not checked. | Missing | Open term 540's legacy page and check for the image in the title area before implementing. |
| Navigation icon / header-menu image | `tamar_category_icon`, `tamar_category_icon_alt` | **Not confirmed**, same reason. | Missing | Same check; the header menu is served by `/global-data`, so any use goes there. |

Observation: the legacy category and product pages are built from Elementor templates (WoodMart "layouts"), so what shows
is decided by those templates, not only by the field values.

## Plan for the React side (not implemented yet)

1. Add one WPGraphQL field to `tamar-headless-api` — keep within the 2-call budget, no new REST call:
   - Product: custom tabs 1–2 (title + HTML) and `productVideoUrl`, resolved with `tamar_extra_field()`.
   - Term: `titleImage` / `categoryIcon` URLs, once the legacy check above says they are shown.
2. `ProductTabs`: append the custom tabs after the YITH tabs (legacy order: …, משלוחים והחזרות, FAQ), skipping empty ones.
3. Product gallery: add the "צפייה בוידאו" button using `productVideoUrl`, matching the legacy button size and position (measure with Playwright).
4. Before removing the theme, also check: `xts-woodmart-options`, the 3 `woodmart_layout` posts, and the wishlist table.
