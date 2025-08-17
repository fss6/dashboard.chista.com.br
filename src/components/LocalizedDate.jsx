"use client";
import { useEffect, useState } from "react";

export default function LocalizedDate({ date, options, locale = "pt-BR" }) {
  const [formatted, setFormatted] = useState("");
  useEffect(() => {
    if (date) {
      setFormatted(new Date(date).toLocaleString(locale, options));
    }
  }, [date, locale, options]);
  return <span>{formatted}</span>;
} 