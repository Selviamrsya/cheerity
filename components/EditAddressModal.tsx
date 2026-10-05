"use client";

import React, { useState, useEffect } from "react";
import { X, MapPin, Loader2, Check } from "lucide-react";
import LocationFields from "@/components/LocationFields";
import { getUserAddress, updateUserAddress } from "@/lib/actions/user";

interface EditAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditAddressModal({ isOpen, onClose }: EditAddressModalProps) {
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFetching(true);
      setError(null);
      setSuccess(false);
      getUserAddress()
        .then((data) => {
          if (data) {
            setAddress(data.address || "");
            setState(data.state || "");
            setCity(data.city || "");
          }
        })
        .finally(() => setFetching(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || !city.trim() || !state.trim()) {
      setError("Please fill out full address, province, and city.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await updateUserAddress({
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
    });

    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setError(res.error || "Failed to update address.");
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 sm:p-8 shadow-2xl border border-gray-100 relative animate-in animate-fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-800 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "var(--font-poppins)" }}>
              Ubah Alamat
            </h2>
            <p className="text-xs text-gray-500">
              Perbarui lokasi Anda untuk menghitung jarak donasi terdekat.
            </p>
          </div>
        </div>

        {fetching ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin text-green-800" />
            <span className="text-xs">Memuat data alamat...</span>
          </div>
        ) : success ? (
          <div className="py-8 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-800 flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-base font-bold text-gray-900">Alamat Berhasil Diperbarui!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {error}
              </div>
            )}

            <LocationFields
              stateValue={state}
              cityValue={city}
              onStateChange={(val) => setState(val)}
              onCityChange={(val) => setCity(val)}
            />

            <div className="mb-5 flex flex-col gap-1.5">
              <label className="font-inter text-[13.5px] font-semibold text-gray-700">Alamat Lengkap</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan"
                className="w-full rounded-sm border-[1.5px] border-outline bg-surface px-4 py-[11px] font-inter text-sm text-on-surface outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400 min-h-[90px] py-2.5 resize-none text-sm"
                required
              />
            </div>

            <div className="pt-3 flex gap-3 justify-end border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="submit"
                className="relative flex w-full items-center justify-center overflow-hidden rounded-sm bg-primary px-6 py-2 font-inter text-[15px] font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50"
                style={{ width: "auto", padding: "10px 24px" }}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                  </span>
                ) : (
                  "Simpan Perubahan"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
