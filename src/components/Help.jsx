import { useState } from 'react';

export default function Help({ onBack }) {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "To'lov turlari qanday?",
      answer: "Biz naqd pul, karta orqali to'lov va online to'lov qabul qilamiz."
    },
    {
      id: 2,
      question: "Yetkazib berish qancha vaqt oladi?",
      answer: "Odatda buyurtma 1-2 soat ichida yetkazib beriladi."
    },
    {
      id: 3,
      question: "Lokatsiyani qanday yuboraman?",
      answer: "Profil bo'limida lokatsiya tugmasini bosib, o'z lokatsiyangizni yuborishingiz mumkin."
    }
  ];

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      <header className="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h2 className="flex-1 text-lg font-bold text-slate-900">Yordam</h2>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* Ko'p so'ralgan savollar */}
        <h3 className="mb-4 text-base font-bold text-slate-900">Ko'p so'ralgan savollar</h3>
        <div className="mb-8 space-y-2">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="overflow-hidden rounded-lg bg-white shadow-sm"
            >
              <button
                onClick={() => toggleFaq(faq.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="flex-1 text-sm font-medium text-slate-900">
                  {faq.question}
                </span>
                <svg
                  className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${
                    expandedFaq === faq.id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedFaq === faq.id && (
                <div className="border-t border-slate-100 px-4 py-3">
                  <p className="text-sm text-slate-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Biz bilan aloqa */}
        <h3 className="mb-4 text-base font-bold text-slate-900">Biz bilan aloqa</h3>
        <div className="mb-8 space-y-2">
          <button
            onClick={() => window.open('https://t.me/market_support', '_blank')}
            className="flex w-full items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-sm hover:bg-slate-50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100">
              <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-slate-900">Telegram Support</p>
              <p className="text-xs text-slate-500">@market_support</p>
            </div>
            <svg className="h-5 w-5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={() => window.open('tel:+998712000000', '_self')}
            className="flex w-full items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-sm hover:bg-slate-50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-100">
              <svg className="h-5 w-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-slate-900">Call Center</p>
              <p className="text-xs text-slate-500">+998 71 200 00 00</p>
            </div>
            <svg className="h-5 w-5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Xabar qutisi */}
        <div className="rounded-lg bg-blue-50 px-4 py-4">
          <p className="mb-1 text-sm font-bold text-blue-900">
            Noto'g'ri narsani topding?
          </p>
          <p className="text-xs text-slate-600">
            Bizga xabar qoldiring, biz tez orada javob beramiz!
          </p>
        </div>
      </div>
    </div>
  );
}
