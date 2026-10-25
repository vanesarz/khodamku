export default function RulesSection() {
  const rules = [
    {
      number: '2',
      label: 'khodam / orang',
      description:
        'Setiap Pengamal didampingi maksimal 2 khodam sekaligus demi menjaga kestabilan energi raga.',
      note: '*Bagi yang ingin mendampingi 3 khodam, konsultasi langsung Juru Kunci.',
    },
    {
      number: '1',
      label: 'raga per unit',
      description:
        'Satu khodam yang bersemayam tidak bisa dipanggil oleh pengamal lain sampai dilepaskan.',
      note: 'Khodam yang bersemayam statusnya terkunci.',
    },
    {
      number: '5',
      label: 'hari batas normal',
      description:
        'Masa pemanggilan maksimal 5 hari. Keterlambatan dikenakan mahar denda Rp5.000 per hari lewat jatuh tempo.',
      note: 'Keterlambatan otomatis terhitung.',
    },
  ];

  return (
    <section id="aturan" className="py-20 lg:py-28 bg-[#090807]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-14">
          <p className="text-[11px] font-semibold tracking-wider text-amber-400 uppercase">
            Aturan & Tata Cara
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Sedikit aturan, supaya semua kebagian.
          </h2>
        </div>

        {/* 3 Large Rule Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {rules.map((rule, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-xl border border-stone-800/80 bg-[#12100e] p-7 transition-all hover:border-stone-700"
            >
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold text-[#d8b168]">
                    {rule.number}
                  </span>
                </div>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-stone-300">
                  {rule.label}
                </p>

                <p className="mt-5 text-sm text-stone-400 leading-relaxed">
                  {rule.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-stone-800/80">
                <p className="text-[11px] text-stone-500 italic">
                  {rule.note}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
