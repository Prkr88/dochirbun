export type ReportRating = 1 | 2 | 3 | 4 | 5;

export type FacilityType =
  | "organized-toilet"
  | "chemical-toilet"
  | "field-squat"
  | "improvised";

export type SittingTime = "up-to-2" | "up-to-5" | "up-to-15" | "over-15";
export type PeeTiming = "before" | "during" | "after" | "none";
export type Entertainment = "none" | "phone" | "newspaper" | "book" | "other";
export type StoolColor = "green" | "yellowish" | "light-brown" | "dark-brown" | "black" | "other";
export type FoodResidue = "none" | "corn" | "tomato" | "leaves" | "other";
export type StoolCharacter = "single-lump" | "multiple-lumps" | "liquid" | "foamy-flow" | "mixed";
export type DropStyle =
  | "direct-hit"
  | "long-snake"
  | "porcelain-slide-marked"
  | "porcelain-slide-clean"
  | "full-bowl-spray";
export type DropSound = "plooysht" | "plaaank" | "troyschranztz" | "tink-tink-tink";
export type ExitCharacter = "failed-strain" | "sweaty-effort" | "free-flow" | "unnoticed";
export type Smell = "none" | "typical" | "unbearable" | "other";
export type PaperSquares = "magic" | "up-to-8" | "up-to-15" | "up-to-30" | "full-roll" | "no-paper";
export type Aftermath =
  | "soap-and-water"
  | "alcohol-gel"
  | "water-only"
  | "pants-wipe"
  | "prefer-not";

export interface PoopReportInput {
  isAnonymous?: boolean;
  reporterName: string;
  serviceNumber?: string;
  role: string;
  facility: FacilityType;
  improvisedFacilityDescription?: string;
  sittingTime: SittingTime;
  peeTiming: PeeTiming;
  entertainment: Entertainment;
  entertainmentOther?: string;
  color: StoolColor;
  colorOther?: string;
  foodResidue: FoodResidue;
  foodResidueOther?: string;
  stoolCharacter: StoolCharacter;
  dropStyle: DropStyle;
  dropSound: DropSound;
  exitCharacter: ExitCharacter;
  smell: Smell;
  smellOther?: string;
  paperSquares: PaperSquares;
  rating: ReportRating;
  aftermath: Aftermath;
  notes: string;
  imageUrl?: string;
}

export interface PoopReport extends PoopReportInput {
  id: string;
  userId: string;
  userEmail: string;
  userPhotoUrl?: string;
  createdAt: string;
}

export type NewReportInput = PoopReportInput;
export type Report = PoopReport;

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  reportCount: number;
  averageRating: number;
}

export interface ReportUserRating {
  reportId: string;
  userId: string;
  rating: ReportRating;
  updatedAt?: string;
}

export interface ReportRatingSummary {
  average: number;
  count: number;
  currentUserRating?: ReportRating;
}
