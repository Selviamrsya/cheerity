// Data Provinsi, Kota/Kabupaten, dan Kode Pos di Indonesia

export interface LocationData {
  province: string;
  city: string;
  zipCode: string;
}

export const INDONESIA_PROVINCES = [
  "DKI Jakarta",
  "Jawa Barat",
  "Jawa Tengah",
  "DI Yogyakarta",
  "Jawa Timur",
  "Banten",
  "Bali",
  "Sumatera Utara",
  "Sumatera Barat",
  "Sumatera Selatan",
  "Riau",
  "Kepulauan Riau",
  "Lampung",
  "Kalimantan Barat",
  "Kalimantan Timur",
  "Kalimantan Selatan",
  "Sulawesi Selatan",
  "Sulawesi Utara",
  "Nusa Tenggara Barat",
  "Nusa Tenggara Timur",
  "Papua",
];

export const INDONESIA_CITIES_BY_PROVINCE: Record<string, { city: string; zipCode: string }[]> = {
  "DKI Jakarta": [
    { city: "Jakarta Selatan", zipCode: "12110" },
    { city: "Jakarta Pusat", zipCode: "10110" },
    { city: "Jakarta Barat", zipCode: "11110" },
    { city: "Jakarta Timur", zipCode: "13110" },
    { city: "Jakarta Utara", zipCode: "14110" },
  ],
  "Jawa Barat": [
    { city: "Bandung", zipCode: "40111" },
    { city: "Bekasi", zipCode: "17111" },
    { city: "Depok", zipCode: "16411" },
    { city: "Bogor", zipCode: "16111" },
    { city: "Cimahi", zipCode: "40511" },
    { city: "Cirebon", zipCode: "45111" },
    { city: "Sukabumi", zipCode: "43111" },
    { city: "Tasikmalaya", zipCode: "46111" },
  ],
  "Jawa Tengah": [
    { city: "Semarang", zipCode: "50111" },
    { city: "Surakarta (Solo)", zipCode: "57111" },
    { city: "Magelang", zipCode: "56111" },
    { city: "Pekalongan", zipCode: "51111" },
    { city: "Salatiga", zipCode: "50711" },
    { city: "Tegal", zipCode: "52111" },
    { city: "Purwokerto", zipCode: "53111" },
  ],
  "DI Yogyakarta": [
    { city: "Yogyakarta", zipCode: "55111" },
    { city: "Sleman", zipCode: "55511" },
    { city: "Bantul", zipCode: "55711" },
    { city: "Kulon Progo", zipCode: "55611" },
    { city: "Gunungkidul", zipCode: "55811" },
  ],
  "Jawa Timur": [
    { city: "Surabaya", zipCode: "60111" },
    { city: "Malang", zipCode: "65111" },
    { city: "Kediri", zipCode: "64111" },
    { city: "Madiun", zipCode: "63111" },
    { city: "Mojokerto", zipCode: "61311" },
    { city: "Pasuruan", zipCode: "67111" },
    { city: "Probolinggo", zipCode: "67211" },
    { city: "Batu", zipCode: "65311" },
    { city: "Sidoarjo", zipCode: "61211" },
  ],
  Banten: [
    { city: "Tangerang", zipCode: "15111" },
    { city: "Tangerang Selatan", zipCode: "15311" },
    { city: "Serang", zipCode: "42111" },
    { city: "Cilegon", zipCode: "42411" },
  ],
  Bali: [
    { city: "Denpasar", zipCode: "80111" },
    { city: "Badung", zipCode: "80361" },
    { city: "Gianyar", zipCode: "80511" },
    { city: "Tabanan", zipCode: "82111" },
    { city: "Buleleng", zipCode: "81111" },
  ],
  "Sumatera Utara": [
    { city: "Medan", zipCode: "20111" },
    { city: "Pematangsiantar", zipCode: "21111" },
    { city: "Binjai", zipCode: "20711" },
  ],
  "Sumatera Barat": [
    { city: "Padang", zipCode: "25111" },
    { city: "Bukittinggi", zipCode: "26111" },
  ],
  "Sumatera Selatan": [
    { city: "Palembang", zipCode: "30111" },
    { city: "Lubuklinggau", zipCode: "31611" },
  ],
  Riau: [
    { city: "Pekanbaru", zipCode: "28111" },
    { city: "Dumai", zipCode: "28811" },
  ],
  "Kepulauan Riau": [
    { city: "Batam", zipCode: "29411" },
    { city: "Tanjungpinang", zipCode: "29111" },
  ],
  Lampung: [
    { city: "Bandar Lampung", zipCode: "35111" },
    { city: "Metro", zipCode: "34111" },
  ],
  "Kalimantan Barat": [
    { city: "Pontianak", zipCode: "78111" },
    { city: "Singkawang", zipCode: "79111" },
  ],
  "Kalimantan Timur": [
    { city: "Samarinda", zipCode: "75111" },
    { city: "Balikpapan", zipCode: "76111" },
    { city: "Bontang", zipCode: "75311" },
  ],
  "Kalimantan Selatan": [
    { city: "Banjarmasin", zipCode: "70111" },
    { city: "Banjarbaru", zipCode: "70711" },
  ],
  "Sulawesi Selatan": [
    { city: "Makassar", zipCode: "90111" },
    { city: "Parepare", zipCode: "91111" },
    { city: "Palopo", zipCode: "91911" },
  ],
  "Sulawesi Utara": [
    { city: "Manado", zipCode: "95111" },
    { city: "Bitung", zipCode: "95511" },
    { city: "Tomohon", zipCode: "95311" },
  ],
  "Nusa Tenggara Barat": [
    { city: "Mataram", zipCode: "83111" },
    { city: "Bima", zipCode: "84111" },
  ],
  "Nusa Tenggara Timur": [
    { city: "Kupang", zipCode: "85111" },
  ],
  Papua: [
    { city: "Jayapura", zipCode: "99111" },
  ],
};
