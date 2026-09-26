import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "אודות",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-[15px] py-16 text-right ">
      <h1 className="mb-6 text-3xl font-bold">אודות תמר קוסמטיקס</h1>
      <div className="space-y-4 text-black/70 leading-relaxed">
        <p>
          תמר קוסמטיקס היא חנות מובילה למוצרי ציפורניים, פדיקור וגבות, המשרתת אלפי לקוחות ובעלי מקצוע ברחבי הארץ.
        </p>
        <p>
          אנו מייבאים ומשווקים מותגים מובילים בתחום, תוך הקפדה על איכות מקצועית, מחירים הוגנים ושירות אישי — הן
          לצרכניות פרטיות והן לבעלי מקצוע ועסקים.
        </p>
        <p>המשלוחים שלנו יוצאים מהר, והצוות שלנו זמין לכל שאלה בוואטסאפ ובטלפון.</p>
      </div>
    </div>
  );
}
