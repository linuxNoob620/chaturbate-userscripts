export const DEFAULT_PROFILE_ID = 'samsung-galaxy-s20-ultra';

export const DEVICE_PROFILES = Object.freeze({
  [DEFAULT_PROFILE_ID]: Object.freeze({
    id: DEFAULT_PROFILE_ID,
    label: 'Samsung Galaxy S20 Ultra',
    width: 412,
    height: 915,
    deviceScaleFactor: 3.5,
    mobile: true,
    touch: true,
    maxTouchPoints: 5,
    platform: 'Android',
    platformVersion: '13.0.0',
    model: 'SM-G988B',
    screenOrientation: Object.freeze({ type: 'portraitPrimary', angle: 0 }),
  }),
});

export function getDeviceProfile(profileId = DEFAULT_PROFILE_ID) {
  const profile = DEVICE_PROFILES[profileId];
  if (!profile) throw new Error(`Unknown mobile device profile: ${profileId}`);
  return {
    ...profile,
    screenOrientation: { ...profile.screenOrientation },
  };
}
