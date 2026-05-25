export function fmtDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
 
export function starString(rating) {
  if (rating == null) return "—";
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}
 
export function langLabel(lang) {
  return { en: "🇬🇧 EN", es: "🇪🇸 ES", pt: "🇧🇷 PT" }[lang] ?? lang;
}