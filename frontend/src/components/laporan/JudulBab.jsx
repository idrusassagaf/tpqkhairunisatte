export default function JudulBab({ nomor, judul }) {
  return (
    <section className="mt-10 md:mt-14 mb-6 md:mb-8">
      {/* Nomor BAB */}
      <h2
        className="
          text-center
          font-bold
          uppercase
          tracking-wide
          text-xl
          md:text-2xl
        "
      >
        {nomor}
      </h2>

      {/* Judul */}
      <h3
        className="
          mt-2
          text-center
          font-semibold
          uppercase
          tracking-wide
          text-lg
          md:text-xl
        "
      >
        {judul}
      </h3>

      {/* Garis bawah */}
      <div className="flex justify-center mt-3">
        <div className="w-20 md:w-28 border-b-2 border-gray-700"></div>
      </div>
    </section>
  );
}
