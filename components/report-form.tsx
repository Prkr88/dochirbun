"use client";

import { Camera, Send, Star } from "lucide-react";
import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";

import { useReportForm } from "@/hooks/use-report-form";
import type { NewReportInput, ReportRating } from "@/types/report";

const fieldGroups = {
  facility: [
    ["organized-toilet", "אסלה מסודרת"],
    ["chemical-toilet", "שירותים כימיים"],
    ["field-squat", "כריעה בשטח"],
    ["improvised", "מתקן מאולתר"]
  ],
  sittingTime: [
    ["up-to-2", "עד 2 דקות"],
    ["up-to-5", "עד 5 דקות"],
    ["up-to-15", "עד 15 דקות"],
    ["over-15", "רבע שעה ומעלה"]
  ],
  peeTiming: [
    ["before", "לפני"],
    ["during", "תוך כדי"],
    ["after", "אחרי"],
    ["none", "לא היה כלל"]
  ],
  entertainment: [
    ["none", "לא היה"],
    ["phone", "סלולרי"],
    ["newspaper", "עיתון"],
    ["book", "ספר"],
    ["other", "אחר"]
  ],
  color: [
    ["green", "ירוק"],
    ["yellowish", "צהבהב"],
    ["light-brown", "חום בהיר"],
    ["dark-brown", "חום כהה"],
    ["black", "שחור"],
    ["other", "אחר"]
  ],
  foodResidue: [
    ["none", "ללא"],
    ["corn", "תירס"],
    ["tomato", "עגבניות"],
    ["leaves", "עלים"],
    ["other", "אחר"]
  ],
  stoolCharacter: [
    ["single-lump", "גוש אחד"],
    ["multiple-lumps", "כמה גושים"],
    ["liquid", "נוזלי"],
    ["foamy-flow", "שצף קצף"],
    ["mixed", "מעורב"]
  ],
  dropStyle: [
    ["direct-hit", "בול פגיעה"],
    ["long-snake", "נחש ארוך עד קצה המים"],
    ["porcelain-slide-marked", "החלקת חרסינה + סימנים"],
    ["porcelain-slide-clean", "החלקת חרסינה ללא סימנים"],
    ["full-bowl-spray", "ריסוס כלל אסלתי"]
  ],
  dropSound: [
    ["plooysht", "פלויישט"],
    ["plaaank", "פלאאאאנק"],
    ["troyschranztz", "טרוייסחראנץ"],
    ["tink-tink-tink", "טינק טינק טינק"]
  ],
  exitCharacter: [
    ["failed-strain", "מאמץ עילאי ללא תוצאות"],
    ["sweaty-effort", "מאמץ רב מלווה בזיעה"],
    ["free-flow", "בחופשיות"],
    ["unnoticed", "בלי לשים לב אפילו"]
  ],
  smell: [
    ["none", "נטול ריח"],
    ["typical", "אופייני"],
    ["unbearable", "צחנה בלתי נסבלת"],
    ["other", "אחר"]
  ],
  paperSquares: [
    ["magic", "קקי קסם"],
    ["up-to-8", "עד 8"],
    ["up-to-15", "עד 15"],
    ["up-to-30", "עד 30"],
    ["full-roll", "גליל שלם"],
    ["no-paper", "לא היה נייר"]
  ],
  aftermath: [
    ["soap-and-water", "שטיפה במים וסבון"],
    ["alcohol-gel", "ג'ל אלכוהול"],
    ["water-only", "שטיפה במים בלבד"],
    ["pants-wipe", "ניגוב חפוז במכנסיים"],
    ["prefer-not", "מעדיף לא להגיב"]
  ]
} as const;

const ratingLabels: Record<ReportRating, string> = {
  1: "קטסטרופה",
  2: "גרוע",
  3: "בינוני",
  4: "חצי זיון",
  5: "משגל מלא"
};

interface ReportFormProps {
  isAuthenticated: boolean;
  isSubmitting: boolean;
  onSubmit: (report: NewReportInput, imageFile?: File) => void | Promise<void>;
}

export function ReportForm({ isAuthenticated, isSubmitting, onSubmit }: ReportFormProps) {
  const { form, isValid, reset, setRating, updateField } = useReportForm();
  const [imageFile, setImageFile] = useState<File>();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValid || !isAuthenticated) {
      return;
    }

    await onSubmit(form, imageFile);
    setImageFile(undefined);
    reset();
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    setImageFile(event.target.files?.[0]);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 rounded-lg border-2 border-ink bg-paper p-5 shadow-[8px_8px_0_#161616]">
      <p className="rounded-md bg-sun/25 p-3 text-sm font-bold leading-6 text-ink">
        טופס זה נכתב בהומור. אין לטופס שום שימוש רציני והוא לא נועד לשפר שירותים.
        מטעמי נוחיות, השאלות כתובות בלשון זכר אך פונות לכל המינים. נא להרפות.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <TextInput label="שם" value={form.reporterName} onChange={(value) => updateField("reporterName", value)} required />
        <TextInput label="מ.א." value={form.serviceNumber ?? ""} onChange={(value) => updateField("serviceNumber", value)} />
        <TextInput label="תפקיד" value={form.role} onChange={(value) => updateField("role", value)} required />
      </div>

      <RadioGroup label="המתקן" value={form.facility} options={fieldGroups.facility} onChange={(value) => updateField("facility", value)} />
      {form.facility === "improvised" ? (
        <TextInput
          label="תיאור המתקן המאולתר"
          value={form.improvisedFacilityDescription ?? ""}
          onChange={(value) => updateField("improvisedFacilityDescription", value)}
          required
        />
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <RadioGroup label="זמן ישיבה" value={form.sittingTime} options={fieldGroups.sittingTime} onChange={(value) => updateField("sittingTime", value)} />
        <RadioGroup label="פיפי" value={form.peeTiming} options={fieldGroups.peeTiming} onChange={(value) => updateField("peeTiming", value)} />
        <div className="grid gap-2">
          <RadioGroup label="בידור" value={form.entertainment} options={fieldGroups.entertainment} onChange={(value) => updateField("entertainment", value)} />
          {form.entertainment === "other" ? (
            <OtherInput label="בידור אחר" value={form.entertainmentOther ?? ""} onChange={(value) => updateField("entertainmentOther", value)} />
          ) : null}
        </div>
        <div className="grid gap-2">
          <RadioGroup label="צבע" value={form.color} options={fieldGroups.color} onChange={(value) => updateField("color", value)} />
          {form.color === "other" ? (
            <OtherInput label="צבע אחר" value={form.colorOther ?? ""} onChange={(value) => updateField("colorOther", value)} />
          ) : null}
        </div>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-bold text-steel">ניתן לצרף תמונה</span>
        <span className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md border border-ink/25 bg-white px-4 font-bold text-steel">
          <Camera className="size-5" />
          {imageFile ? imageFile.name : "בחירת תמונה"}
        </span>
        <input type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
      </label>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="grid gap-2">
          <RadioGroup label="שאריות מזון" value={form.foodResidue} options={fieldGroups.foodResidue} onChange={(value) => updateField("foodResidue", value)} />
          {form.foodResidue === "other" ? (
            <OtherInput label="שאריות מזון אחרות" value={form.foodResidueOther ?? ""} onChange={(value) => updateField("foodResidueOther", value)} />
          ) : null}
        </div>
        <RadioGroup label="אופי החרא" value={form.stoolCharacter} options={fieldGroups.stoolCharacter} onChange={(value) => updateField("stoolCharacter", value)} />
        <RadioGroup label="סגנון נפילה" value={form.dropStyle} options={fieldGroups.dropStyle} onChange={(value) => updateField("dropStyle", value)} />
        <RadioGroup label="רעש הנפילה" value={form.dropSound} options={fieldGroups.dropSound} onChange={(value) => updateField("dropSound", value)} />
        <RadioGroup label="אופי היציאה" value={form.exitCharacter} options={fieldGroups.exitCharacter} onChange={(value) => updateField("exitCharacter", value)} />
        <div className="grid gap-2">
          <RadioGroup label="ריח" value={form.smell} options={fieldGroups.smell} onChange={(value) => updateField("smell", value)} />
          {form.smell === "other" ? (
            <OtherInput label="ריח אחר" value={form.smellOther ?? ""} onChange={(value) => updateField("smellOther", value)} />
          ) : null}
        </div>
        <RadioGroup label="ריבועי נייר" value={form.paperSquares} options={fieldGroups.paperSquares} onChange={(value) => updateField("paperSquares", value)} />
        <RadioGroup label="לאחר מעשה" value={form.aftermath} options={fieldGroups.aftermath} onChange={(value) => updateField("aftermath", value)} />
      </div>

      <div className="grid gap-3">
        <span className="text-sm font-bold text-steel">דירוג כללי לחוויה</span>
        <div className="grid gap-2 sm:grid-cols-5">
          {([1, 2, 3, 4, 5] as ReportRating[]).map((rating) => (
            <button
              type="button"
              key={rating}
              onClick={() => setRating(rating)}
              className={`min-h-16 rounded-md border px-3 py-2 text-sm font-black transition ${
                rating === form.rating ? "border-ink bg-sun text-ink" : "border-ink/20 bg-white text-ink/70"
              }`}
            >
              <span className="mb-1 flex justify-center gap-1">
                {Array.from({ length: rating }).map((_, index) => (
                  <Star key={index} className="size-4" fill="currentColor" />
                ))}
              </span>
              {ratingLabels[rating]}
            </button>
          ))}
        </div>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-bold text-steel">הערות, הגיגים או תובנות</span>
        <textarea
          value={form.notes}
          onChange={(event) => updateField("notes", event.target.value)}
          className="min-h-32 resize-y rounded-md border border-ink/25 bg-white p-4 outline-none focus:border-mint"
          required
        />
      </label>

      <button
        type="submit"
        disabled={!isValid || !isAuthenticated || isSubmitting}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-mint px-4 font-bold text-white disabled:cursor-not-allowed disabled:bg-ink/25"
      >
        <Send className="size-5" />
        {isSubmitting ? "שומר..." : "שליחת דו\"ח חירבון"}
      </button>
    </form>
  );
}

function TextInput({
  label,
  onChange,
  required,
  value
}: {
  label: string;
  value: string;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-bold text-steel">
        {label}
        {required ? " *" : null}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="h-12 rounded-md border border-ink/25 bg-white px-4 outline-none focus:border-mint"
      />
    </label>
  );
}

function OtherInput({
  label,
  onChange,
  value
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-md border border-mint/40 bg-white p-3">
      <TextInput label={label} value={value} onChange={onChange} required />
    </div>
  );
}

function RadioGroup<TValue extends string>({
  label,
  onChange,
  options,
  value
}: {
  label: string;
  value: TValue;
  options: readonly (readonly [TValue, string])[];
  onChange: (value: TValue) => void;
}) {
  return (
    <fieldset className="grid gap-2 rounded-md border border-ink/15 bg-white p-3">
      <legend className="px-1 text-sm font-bold text-steel">{label} *</legend>
      <div className="grid gap-2">
        {options.map(([optionValue, optionLabel]) => (
          <label key={optionValue} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-paper">
            <input
              type="radio"
              checked={value === optionValue}
              onChange={() => onChange(optionValue)}
              className="size-4 accent-mint"
            />
            <span className="text-sm leading-6">{optionLabel}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
