"use client";

import { useMemo, useState } from "react";

import type { NewReportInput, ReportRating } from "@/types/report";

export const initialPoopReportForm: NewReportInput = {
  isAnonymous: false,
  reporterName: "",
  serviceNumber: "",
  role: "",
  facility: "organized-toilet",
  improvisedFacilityDescription: "",
  sittingTime: "up-to-5",
  peeTiming: "none",
  entertainment: "none",
  entertainmentOther: "",
  color: "dark-brown",
  colorOther: "",
  foodResidue: "none",
  foodResidueOther: "",
  stoolCharacter: "single-lump",
  dropStyle: "direct-hit",
  dropSound: "plooysht",
  exitCharacter: "free-flow",
  smell: "typical",
  smellOther: "",
  paperSquares: "up-to-8",
  rating: 3,
  aftermath: "soap-and-water",
  notes: ""
};

export function validatePoopReport(form: NewReportInput) {
  return (
    (form.isAnonymous || form.reporterName.trim().length >= 2) &&
    (form.isAnonymous || form.role.trim().length >= 2) &&
    form.notes.trim().length >= 2 &&
    (form.facility !== "improvised" || Boolean(form.improvisedFacilityDescription?.trim())) &&
    (form.entertainment !== "other" || Boolean(form.entertainmentOther?.trim())) &&
    (form.color !== "other" || Boolean(form.colorOther?.trim())) &&
    (form.foodResidue !== "other" || Boolean(form.foodResidueOther?.trim())) &&
    (form.smell !== "other" || Boolean(form.smellOther?.trim()))
  );
}

export function useReportForm() {
  const [form, setForm] = useState<NewReportInput>(initialPoopReportForm);
  const isValid = useMemo(() => validatePoopReport(form), [form]);

  return {
    form,
    isValid,
    reset: () => setForm(initialPoopReportForm),
    updateField: <TKey extends keyof NewReportInput>(key: TKey, value: NewReportInput[TKey]) =>
      setForm((current) => ({ ...current, [key]: value })),
    setRating: (rating: ReportRating) => setForm((current) => ({ ...current, rating })),
    toggleAnonymous: (anonymous: boolean) =>
      setForm((current) => ({
        ...current,
        isAnonymous: anonymous,
        reporterName: anonymous ? "אנונימי" : "",
        serviceNumber: anonymous ? "" : current.serviceNumber
      }))
  };
}
