const ROWS = [
  { generic: "اسم غير واضح ومصدر غير معروف", vevira: "علامة مغربية واضحة وتجربة طلب منظمة" },
  { generic: "مكوّنات مجهولة وادعاءات مبالغ فيها", vevira: "مكوّنات طبيعية مفصّحة لكل منتج" },
  { generic: "لا يوجد تأكيد واضح قبل التوصيل", vevira: "تأكيد طلب بالهاتف قبل الإرسال" },
  { generic: "وصف عام", vevira: "كل منتج يحل مشكلة واحدة بوضوح" },
  { generic: "دعم غير واضح", vevira: "تواصل ودعم بالعربية داخل المغرب" },
];

export function ComparisonCards() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] border-collapse">
        <thead>
          <tr className="border-b-2 border-brand-teal/20">
            <th className="text-right p-4 text-brand-gray font-medium">منتجات عشوائية</th>
            <th className="text-right p-4 text-brand-teal font-bold bg-brand-mint/50 rounded-t-2xl">
              منتجات فيرا بيوتي
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="p-4 text-sm text-brand-gray">{row.generic}</td>
              <td className="p-4 text-sm font-medium text-brand-charcoal bg-brand-mint/20">
                {row.vevira}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
