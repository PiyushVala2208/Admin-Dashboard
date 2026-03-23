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

  const currencySymbols = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };

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
          darkmode: res.data.darkmode || false,
        });
      }
    } catch (err) {
      console.error("Context Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const res = await api.put("/users/settings", newSettings);
      if (res.status === 200) {
        setSettings((prev) => ({
          ...prev,
          ...newSettings,
        }));
        return { success: true };
      }
    } catch (err) {
      console.error("Update Settings Error:", err);
      return { success: false, error: err };
    }
  };

  useEffect(() => {
    const token = getCookie("token");

    if (token) {
      fetchSettings();
    } else {
      setLoading(false);
      console.log("No token found, skipping settings fetch on this page.");
    }
  }, []);

  const currencySymbol = currencySymbols[settings.currency] || "₹";

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setSettings,
        currencySymbol,
        fetchSettings,
        loading,
        updateSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
