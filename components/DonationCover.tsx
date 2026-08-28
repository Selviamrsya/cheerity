import React from "react";
import Image from "next/image";

interface Props {
  className?: string;
  coverImage?: string;
}

const DonationCover = ({
  className = "",
  coverImage = "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800&auto=format&fit=crop",
}: Props) => {
  return (
    <div className={`relative h-64 w-full overflow-hidden rounded-2xl ${className}`}>
      <Image
        src={coverImage}
        alt="Donation cover"
        fill
        className="object-cover"
      />
    </div>
  );
};

export default DonationCover;