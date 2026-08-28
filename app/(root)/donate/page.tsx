import DonationCard from "@/components/DonationCard";

const allDonations = [
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
  {
    id: "4",
    title: "Donasi Mainan Anak",
    institutionName: "Yayasan Pelita Bangsa",
    institutionLogo: "/assets/donation-books.png",
    coverImage: "/assets/donation-clothes.png",
    location: "Jakarta Utara",
    distance: "3.5 km",
    currentAmount: 8,
    targetAmount: 25,
  },
  {
    id: "5",
    title: "Donasi Alat Tulis",
    institutionName: "Rumah Harapan Bersama",
    institutionLogo: "/assets/donation-school.png",
    coverImage: "/assets/donation-school.png",
    location: "Depok",
    distance: "6.2 km",
    currentAmount: 18,
    targetAmount: 40,
  },
  {
    id: "6",
    title: "Donasi Sepatu Sekolah",
    institutionName: "Yayasan Cerdas Mandiri",
    institutionLogo: "/assets/donation-clothes.png",
    coverImage: "/assets/donation-books.png",
    location: "Tangerang",
    distance: "4.8 km",
    currentAmount: 30,
    targetAmount: 50,
  },
];

const DonatePage = () => {
  return (
    <>
      <div className="find-donation-header">
        <h1 className="find-donation-title">Find a Donation</h1>
        <p className="find-donation-subtitle">
          Browse all active donation campaigns from verified institutions.
          Find a cause you care about and make a difference today.
        </p>
      </div>

      <div className="donation-grid">
        {allDonations.map((donation, index) => (
          <div
            key={donation.id}
            className={`fade-in stagger-${(index % 3) + 1}`}
          >
            <DonationCard {...donation} />
          </div>
        ))}
      </div>
    </>
  );
};

export default DonatePage;
