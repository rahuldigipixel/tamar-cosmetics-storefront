# WoodMart audit — what the theme provides, what the front uses, what is left to cover

Checked 2026-10-12 with WoodMart Child active again. Legacy = `192.168.0.107/tamarcosmetics`; the upress dev site
(`tamarcosmetics-co-il-dev.s808.upress.link`) runs the same WoodMart setup (same body classes and modules).
Pages checked in a browser at 1440px and 390px: home, `/product-category/sale/`, `/product/test/`.
NOT checked: cart, checkout, my-account, blog, brand pages, search results.

## 1. Theme features that render on the legacy front → React status

| Feature (legacy) | React |
|---|---|
| Header top banner (rotating messages) | Done — own `class-header-bar.php` (`tamar_header_bar`) |
| Mobile sticky bottom toolbar (חנות / מועדפים / עגלה / החשבון שלי) | Done — `MobileBottomNav` |
| Scroll-to-top button | Done ("חזרה לראש העמוד") |
| Quick shop add-to-cart, wishlist, labels, hover 2nd image on cards | Done |
| Brand logo on product, header search | Done |
| Free-shipping progress bar (289 ₪), buy-now | Done |
| Cookie bar, WhatsApp, accessibility widget | Done |
| Product tabs incl. custom FAQ tab, video button | Done (this task) |

## 2. Enabled in theme settings but NOT rendering on the legacy front (nothing to rebuild)

Promo popup, compare, sticky social, frequently-bought-together, visitors counter, sold counter, countdown, size guide,
360 view, Instagram feed (`insta_token` empty). Related/upsell blocks exist as React toggles (`tamar_product_show_*`).

## 3. Theme-owned data still in the database (decide before removing theme + woodmart-core)

| Data | Where | Used by React/custom code? |
|---|---|---|
| Wishlist tables `wp_woodmart_wishlists`, `wp_woodmart_wishlist_products` (937 / 773 rows when first counted, 0 / 0 later — not investigated) | tables | **No** — corrected: nothing in React or tamar-headless-api reads them. The wishlist is stored in user meta `wishlist_{user_id}` (logged-in) or a browser cookie (guests); see `class-wishlist.php`, `useWishlistStore.ts`. Safe to ignore when the theme is removed. |
| HTML blocks (`cms_block`) ×5: חיזוק מכירות (102 KB), Top Header left, FOOTER, shipping tab, rotating header messages | wp_posts | Footer and header bar are replaced by `tamar_footer` / `tamar_header_bar`. Shipping-tab block is empty on legacy too. **"חיזוק מכירות" (ID 15): not verified where it is used.** |
| Layouts (`woodmart_layout`) ×3: single product, 2× archive | wp_posts (Elementor) | No — React is hand-built; nothing to migrate |
| Slide (`woodmart_slide`) "ערכה מקצועית" | wp_posts | No — replaced by `tamar_home_hero_desktop/mobile` |
| Portfolio ×1 | wp_posts | Not used |
| Theme options `xts-woodmart-options` | wp_options | Not read by custom code |
| Wishlist promotional email (`XTS\WC_Wishlist\Sends_Promotional`) | theme feature, hooked in `wps-woo-extended/module/wc-general-module.php` (`fix_woodmart_promotional_email_hook`, guarded by `class_exists`) | Stops working once the theme is gone — **needs a decision** (rebuild or drop) |

## 4. Product / category / brand extra fields

Done earlier: `wps-woo-extended/module/tamar-extra-fields-module.php` (own fields + one-time migration), exposed to React
as `tamarCustomTabs` and `tamarProductVideoUrl`.

## 5. Whole-site sweep (headless browser, 2026-10-12)

All 21 static React routes load with status 200 and their own h1 (cart, checkout, my-account, wishlist, blog, shop,
brand-list, search, faq, contact, about, wholesale, secret-club, reviews, return-policy, terms, order-cancellation,
suppliers, app, accessibility-statement). Many legacy URLs 404 because the old site used other Hebrew slugs, so those
pages were not compared side by side. Warm React timings: search 0.19s (first uncached hit 1.5s), shop 0.16s, cart
0.07s, blog 0.14s. Search page HTML is 731 KB (limit in RULES.md: well under ~1 MB).

NOT done: the live dev site's wp-admin Theme Settings page (`admin.php?page=xts_theme_settings`) — the Claude in Chrome
tools were not available in this session. The same settings were read from the local database instead
(`xts-woodmart-options`).
