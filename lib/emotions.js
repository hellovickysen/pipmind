/** Default emotion tags — used when the user hasn't customized. */
export const DEFAULT_EMOTIONS = ['Disciplined', 'Calm', 'Confident', 'FOMO', 'Fear', 'Greed', 'Revenge', 'Boredom'];

/** Resolve emotions list: prefer custom if set, else defaults. */
export function resolveEmotions(prefs) {
  if (prefs && Array.isArray(prefs.custom_emotions) && prefs.custom_emotions.length > 0) {
    return prefs.custom_emotions;
  }
  return DEFAULT_EMOTIONS;
}
