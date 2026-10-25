export default function StatsCounter() {
  const stats = [
    { value: '8', label: 'unit khodam' },
    { value: '6', label: 'kategori' },
    { value: '5 hari', label: 'maksimal pemanggilan' },
    { value: 'Rp5.000', label: 'mahar denda / hari' },
  ];

  return (
    <section className="border-y border-stone-800/80 bg-[#0c0a09]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 divide-y divide-stone-800 sm:grid-cols-4 sm:divide-y-0 sm:divide-x">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-center px-4 py-8 text-left sm:px-8 sm:py-10"
            >
              <div className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1 text-xs font-medium text-stone-400 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
