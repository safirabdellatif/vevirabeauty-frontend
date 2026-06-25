export interface Review {
  id: string;
  text: string;
  author: string;
  rating: number;
  productId?: string;
  isPlaceholder: boolean;
}

export const REVIEWS: Review[] = [
  {
    id: "r1",
    text: "مراجعة تجريبية: زيت المفاصل ساعدني بزاف على آلام الركبة، خاصة من بعد ما نخدم واقف.",
    author: "عميل فيرا بيوتي — الدار البيضاء",
    rating: 5,
    productId: "joint_pain_oil",
    isPlaceholder: true,
  },
  {
    id: "r2",
    text: "مراجعة تجريبية: الرشاش وصلني بسرعة، وبعد 3 أسابيع التساقط بدأ يقلّ.",
    author: "عميل فيرا بيوتي — الرباط",
    rating: 5,
    productId: "hair_loss_spray",
    isPlaceholder: true,
  },
  {
    id: "r3",
    text: "مراجعة تجريبية: كريم الكلف بدأ يبان عليه من الأسبوع الثاني، البقع فاتحين شوية.",
    author: "عميلة فيرا بيوتي — مراكش",
    rating: 5,
    productId: "melasma_cream",
    isPlaceholder: true,
  },
  {
    id: "r4",
    text: "مراجعة تجريبية: أخذت عرض قطعتين ووصلني تأكيد قبل التوصيل. تجربة مرتبة.",
    author: "عميل فيرا بيوتي",
    rating: 5,
    isPlaceholder: true,
  },
  {
    id: "r5",
    text: "مراجعة تجريبية: الدفع عند الاستلام خلّاني نجرب بلا ما نخاف.",
    author: "عميلة فيرا بيوتي",
    rating: 5,
    isPlaceholder: true,
  },
];
