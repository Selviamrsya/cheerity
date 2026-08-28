import React from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/auth";

const ProfilePage = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1
        className="text-2xl font-bold mb-4"
        style={{ fontFamily: "var(--font-poppins)" }}
      >
        My Profile
      </h1>
      <p
        className="text-sm mb-8"
        style={{ color: "var(--color-on-surface-variant)" }}
      >
        Profile management coming soon.
      </p>
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <Button>Logout</Button>
      </form>
    </div>
  );
};

export default ProfilePage;