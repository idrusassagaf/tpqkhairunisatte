import heroImage from "../assets/hero-putih04.jpg";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function KontakPublic() {
  return (
    <div className="bg-[#f8faf8] min-h-screen">
      {/* HEADER */}

      <section
        className="relative overflow-hidden pt-16 md:pt-20 pb-12"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-white/10"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 -mt-4 md:-mt-6">
          {/* JUDUL */}

          <div className="text-center mb-12">
            <h1
              className="
text-3xl
sm:text-4xl
md:text-4xl
font-bold
text-green-800
leading-tight
mt-2
"
            >
              Kontak TPQ Khairunnisa
            </h1>

            <p
              className="
mt-2
text-gray-700
text-xs
sm:text-sm
md:text-sm
max-w-xl
mx-auto
font-base
"
            >
              Layanan informasi dan komunikasi TPQ Khairunnisa
            </p>
          </div>

          {/* CARD */}

          <div
            className="
grid
grid-cols-1
lg:grid-cols-2
gap-5
md:gap-8
items-start
lg:items-start
"
          >
            {/* KIRI */}

            <div
              className="
bg-white/35
backdrop-blur-xs
border
border-white/30
rounded-3xl
shadow-lg
p-5 md:p-8
self-start
"
            >
              <h2 className="text-2xl md:text-2xl font-bold text-green-700 mb-4">
                Informasi Kontak
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* ALAMAT */}

                <div className="flex gap-3">
                  <MapPin
                    size={22}
                    className="text-green-600 flex-shrink-0 mt-1"
                  />

                  <div>
                    <h3 className="font-bold text-base">Alamat</h3>

                    <p className="text-gray-600 text-sm">
                      Jln.MT.Habib Abubakar Al-Attas. Kelurahan Gamalama
                    </p>
                  </div>
                </div>

                {/* WHATSAPP */}

                <div className="flex gap-3">
                  <Phone
                    size={22}
                    className="text-green-600 flex-shrink-0 mt-1"
                  />

                  <div>
                    <h3 className="font-bold text-base">WhatsApp</h3>

                    <p className="text-gray-600 text-sm">08xxxxxxxxxx</p>
                  </div>
                </div>

                {/* EMAIL */}

                <div className="flex gap-3">
                  <Mail
                    size={22}
                    className="text-green-600 flex-shrink-0 mt-1"
                  />

                  <div>
                    <h3 className="font-bold text-base">Email</h3>

                    <p className="text-gray-600 text-sm break-all">
                      tpqkhairunnisa@gmail.com
                    </p>
                  </div>
                </div>

                {/* JAM */}

                <div className="flex gap-3">
                  <Clock
                    size={22}
                    className="text-green-600 flex-shrink-0 mt-1"
                  />

                  <div>
                    <h3 className="font-bold text-base">Jam Operasional</h3>

                    <p className="text-gray-600 text-sm">Senin - Sabtu</p>

                    <p className="text-gray-600 text-sm">18.00 - 20.30 WIT</p>
                  </div>
                </div>
              </div>
            </div>

            {/* KANAN */}

            <div
              className="
bg-white/35
backdrop-blur-xs
border
border-white/30
rounded-3xl
shadow-lg
p-5 md:p-8

self-start
"
            >
              <h2 className="text-2xl md:text-2xl font-bold text-green-700 mb-6">
                Hubungi Admin TPQ
              </h2>

              <p className="text-gray-600 text-sm md:text-base leading-6 mb-5 text-justify">
                Silakan hubungi Admin TPQ untuk berbicara langsung atau melalui
                pesan apabila anda membutuhkan data dan informasi ataupun
                layanan lainnya tentang TPQ Khairunissa.
              </p>

              <a
                href="https://wa.me/6282256219291"
                target="_blank"
                rel="noreferrer"
                className="
inline-flex
justify-center
items-center
bg-green-600
hover:bg-green-700
text-white
px-8
py-3
rounded-2xl
font-semibold
transition
w-full
md:w-auto
"
              >
                Hubungi via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
