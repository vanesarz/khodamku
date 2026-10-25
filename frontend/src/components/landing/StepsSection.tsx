export default function StepsSection() {
  const steps = [
    {
      number: '01',
      title: 'Cari',
      description:
        'Pilih khodam pendamping sesuai hajat atau kategori. Setiap unit punya profil spesifik.',
    },
    {
      number: '02',
      title: 'Panggil',
      description:
        'Tentukan orang (pengamal) kamu lewat Juru Kunci. Tanggal dan jatuh tempo aktif tercatat.',
    },
    {
      number: '03',
      title: 'Kebersamaan',
      description:
        'Khodam bersemayam selama batas waktu. Hubungan spiritual bisa dipantau dari dashboard.',
    },
    {
      number: '04',
      title: 'Lepaskan',
      description:
        'Lepaskan tepat waktu tanpa mahar. Keterlambatan terhitung otomatis per hari.',
    },
  ];

  return (
    <section id="cara-kerja" className="py-20 lg:py-28 bg-[#090807]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-14">
          <p className="text-[11px] font-semibold tracking-wider text-amber-400 uppercase">
            Cara Kerja
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Empat langkah, dari panggil sampai lepas.
          </h2>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => (
            <div key={idx} className="group relative flex flex-col">
              {/* Step indicator dot & number */}
              <div className="flex items-center gap-2 mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <span className="text-xs font-mono font-medium text-stone-500 group-hover:text-amber-400 transition-colors">
                  {step.number}
                </span>
              </div>

              {/* Step Title */}
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-200 transition-colors">
                {step.title}
              </h3>

              {/* Step Description */}
              <p className="text-sm text-stone-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
