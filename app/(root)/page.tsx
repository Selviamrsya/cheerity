import DonationOverview from "@/components/DonationOverview";
import DonationList from "@/components/DonationList";

const donations = [
  {
    id: "1",
    title: "Donasi Buku Anak-Anak",
    institutionName: "Yayasan Pelita Bangsa",
    institutionLogo: "/assets/donation-books.png",
    coverImage: "/assets/donation-books.png",
    location: "Jakarta Selatan",
    distance: "2.3 km",
    currentAmount: 24,
    targetAmount: 50,
  },
  {
    id: "2",
    title: "Donasi Pakaian Layak Pakai",
    institutionName: "Rumah Harapan Bersama",
    institutionLogo: "/assets/donation-clothes.png",
    coverImage: "/assets/donation-clothes.png",
    location: "Bandung Barat",
    distance: "5.1 km",
    currentAmount: 12,
    targetAmount: 30,
  },
  {
    id: "3",
    title: "Donasi Perlengkapan Sekolah",
    institutionName: "Yayasan Cerdas Mandiri",
    institutionLogo: "/assets/donation-school.png",
    coverImage: "/assets/donation-school.png",
    location: "Surabaya",
    distance: "8.7 km",
    currentAmount: 45,
    targetAmount: 50,
  },
];

const Home = () => {
  return (
    <>
      <DonationOverview />

      <DonationList
        title="Discover Donations Inspired by What You Care About"
        subtitle="Browse active campaigns from verified institutions near you."
        donations={donations}
      />
    </>
  );
};

export default Home;