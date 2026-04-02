"use client";
import { createContext, useContext, useState, useEffect } from "react";
import api from "@/app/utils/api";

const SettingsContext = createContext();

const getCookie = (name) => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    companyName: "",
    currency: "INR",
    darkmode: false,
  });
  const [loading, setLoading] = useState(true);

  const currencySymbols = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };

  // SettingsContext.js mein fetchSettings wala part
  const fetchSettings = async () => {
    const token = getCookie("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/users/settings");
      if (res.data) {
        setSettings({
          companyName: res.data.company_name || "",
          currency: res.data.currency || "INR",
          darkmode: !!res.data.darkmode,
        });
      }
    } catch (err) {
      console.warn("Settings fetch failed, keeping defaults.");
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const res = await api.put("/users/settings", newSettings);
      if (res.status === 200) {
        setSettings((prev) => ({ ...prev, ...newSettings }));
        return { success: true };
      }
    } catch (err) {
      return { success: false, error: err };
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        currencySymbol: currencySymbols[settings.currency] || "₹",
        loading,
        updateSettings,
        fetchSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
