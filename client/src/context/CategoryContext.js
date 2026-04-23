"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "@/app/utils/api";

const CategoryContext = createContext();

const normalizeCategoryName = (value = "") => value.trim().toLowerCase();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/categories");
      const nextCategories = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
          ? response.data
          : [];

      setCategories(nextCategories);
    } catch (error) {
      console.error("Failed to load categories:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  const findCategoryByName = (name) => {
    const normalizedName = normalizeCategoryName(name);

    return categories.find(
      (category) => normalizeCategoryName(category.name) === normalizedName,
    );
  };

  const getCategorySuggestions = (query = "") => {
    const normalizedQuery = normalizeCategoryName(query);

    if (!normalizedQuery) {
      return categories;
    }

    return categories.filter((category) =>
      normalizeCategoryName(category.name).includes(normalizedQuery),
    );
  };

  const getCategoryAttributes = (categoryIdOrName) => {
    if (!categoryIdOrName) return [];

    const matchedCategory = categories.find((category) => {
      return (
        String(category.id) === String(categoryIdOrName) ||
        normalizeCategoryName(category.name) ===
          normalizeCategoryName(categoryIdOrName)
      );
    });

    return Array.isArray(matchedCategory?.attributes)
      ? matchedCategory.attributes
      : [];
  };

  return (
    <CategoryContext.Provider
      value={{
        categories,
        loading,
        refreshCategories,
        findCategoryByName,
        getCategorySuggestions,
        getCategoryAttributes,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);

  if (!context) {
    throw new Error("useCategories must be used within a CategoryProvider");
  }

  return context;
};
