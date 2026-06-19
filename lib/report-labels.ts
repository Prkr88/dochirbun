export const reportLabels = {
  facility: {
    "organized-toilet": "אסלה מסודרת",
    "chemical-toilet": "שירותים כימיים",
    "field-squat": "כריעה בשטח",
    improvised: "מתקן מאולתר"
  },
  sittingTime: {
    "up-to-2": "עד 2 דקות",
    "up-to-5": "עד 5 דקות",
    "up-to-15": "עד 15 דקות",
    "over-15": "רבע שעה ומעלה"
  },
  color: {
    green: "ירוק",
    yellowish: "צהבהב",
    "light-brown": "חום בהיר",
    "dark-brown": "חום כהה",
    black: "שחור",
    other: "אחר"
  },
  stoolCharacter: {
    "single-lump": "גוש אחד",
    "multiple-lumps": "כמה גושים",
    liquid: "נוזלי",
    "foamy-flow": "שצף קצף",
    mixed: "מעורב"
  },
  dropStyle: {
    "direct-hit": "בול פגיעה",
    "long-snake": "נחש ארוך עד קצה המים",
    "porcelain-slide-marked": "החלקת חרסינה + סימנים",
    "porcelain-slide-clean": "החלקת חרסינה ללא סימנים",
    "full-bowl-spray": "ריסוס כלל אסלתי"
  },
  dropSound: {
    plooysht: "פלויישט",
    plaaank: "פלאאאאנק",
    troyschranztz: "טרוייסחראנץ",
    "tink-tink-tink": "טינק טינק טינק"
  },
  smell: {
    none: "נטול ריח",
    typical: "אופייני",
    unbearable: "צחנה בלתי נסבלת",
    other: "אחר"
  },
  aftermath: {
    "soap-and-water": "שטיפה במים וסבון",
    "alcohol-gel": "ג'ל אלכוהול",
    "water-only": "שטיפה במים בלבד",
    "pants-wipe": "ניגוב חפוז במכנסיים",
    "prefer-not": "מעדיף לא להגיב"
  },
  rating: {
    1: "קטסטרופה",
    2: "גרוע",
    3: "בינוני",
    4: "חצי זיון",
    5: "משגל מלא"
  }
} as const;
