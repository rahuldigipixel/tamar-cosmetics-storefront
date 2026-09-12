export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <h1 className="text-2xl font-bold">ההזמנות שלי</h1>
      <p className="mt-3 text-black/60">
        דורש התחברות (JWT Auth) מול הבקאנד — עדיין לא מוגדר. לאחר הגדרת ה-JWT, עמוד זה יציג את היסטוריית
        ההזמנות דרך ה-WooCommerce REST API.
      </p>
    </div>
  );
}
