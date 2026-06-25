const ROWS = [
  {
    generic: "سمية ما واضحة والمصدر ما معروفش",
    vevira: "علامة مغربية واضحة وتجربة طلب مرتبة",
  },
  {
    generic: "مكوّنات ما مفهوماش وادعاءات كبار بزاف",
    vevira: "مكوّنات طبيعية مبينة لكل منتج",
  },
  {
    generic: "ما كاينش تأكيد قبل ما يوصلك الطلب",
    vevira: "كيتصلو بيك قبل ما يصيفطو",
  },
  {
    generic: "وصف عام ما كيفيدش",
    vevira: "كل منتج كيحل مشكل واحد بوضوح",
  },
  {
    generic: "الدعم والتواصل ما واضحينش",
    vevira: "تواصل ودعم بالعربية فالمغرب كامل",
  },
];

export function ComparisonCards() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] border-collapse">
        <thead>
          <tr className="border-b-2 border-brand-teal/20">
            <th className="text-right p-4 text-brand-gray font-medium">منتجات من أي بلاصة</th>
            <th className="text-right p-4 text-brand-teal font-bold bg-brand-mint/50 rounded-t-2xl">
              فيرا بيوتي
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
