# Nutrio — App Store Submission Checklist

Use this checklist before submitting Nutrio to the App Store.

---

## 1. App Store Connect Setup

- [ ] **Apple Developer Account** — Active paid membership ($99/year)
- [ ] **App created in App Store Connect** — App ID: 6759483173
- [ ] **Bundle ID matches** — `com.khasaa777.nutrio.app` (from app.json)

---

## 2. App Information (App Store Connect)

- [ ] **App name** — Nutrio
- [ ] **Subtitle** — Short tagline (e.g. "Calorie & nutrition tracker for Mongolia")
- [ ] **Primary language** — Mongolian (or English if primary)
- [ ] **Category** — Health & Fitness
- [ ] **Secondary category** — Food & Drink (optional)

---

## 3. Metadata & Screenshots

- [ ] **Description** — Clear, compelling app description (up to 4000 chars)
- [ ] **Keywords** — Relevant search terms (up to 100 chars, comma-separated)
- [ ] **Promotional text** — Optional, can be updated without new version
- [ ] **Screenshots** — Required for all device sizes:
  - [ ] 6.7" (iPhone 15 Pro Max)
  - [ ] 6.5" (iPhone 14 Plus)
  - [ ] 5.5" (iPhone 8 Plus)
  - [ ] iPad Pro 12.9" (if supports iPad)
- [ ] **App Preview video** — Optional but recommended

---

## 4. Privacy & Compliance

- [ ] **Privacy Policy URL** — Host your privacy policy and add the URL in App Store Connect
- [ ] **Data collection declaration** — In App Store Connect, answer questions about:
  - Data collected (profile, food logs, weight — all stored locally)
  - Data linked to user (none — no accounts)
  - Data used for tracking (none)
- [ ] **Export compliance** — `ITSAppUsesNonExemptEncryption: false` is already set ✓

---

## 5. Build & Submission

- [ ] **Build with EAS:**
  ```bash
  eas build -p ios --profile production
  ```
- [ ] **Submit to App Store:**
  ```bash
  eas submit -p ios --profile production --latest
  ```
- [ ] **Or** upload build manually via Transporter app

---

## 6. App Review Information

- [ ] **Contact info** — Email and phone for Apple to reach you
- [ ] **Demo account** — Not needed (app has no login)
- [ ] **Notes for reviewer** — Optional: explain any features, test instructions, or API keys if needed for recipe search

---

## 7. Pricing & Availability

- [ ] **Price** — Free or set price
- [ ] **Countries/regions** — Select where the app will be available (e.g. Mongolia, global)

---

## 8. Pre-Submission Checks

- [ ] **Remove or secure API keys** — Consider moving Spoonacular/USDA keys to a backend if sensitive (optional; keys in app are common for client apps)
- [ ] **Test on real device** — Run full flow: onboarding, logging food, recipes, insights
- [ ] **No crashes** — App should not crash during normal use
- [ ] **Recipe feature** — If SPOONACULAR_API_KEY is missing, recipes show empty; ensure it works or document for reviewer

---

## 9. After Submission

- [ ] **Monitor App Store Connect** — Check status (Waiting for Review → In Review → Ready for Sale)
- [ ] **Respond to rejections** — If rejected, read resolution center and fix issues
- [ ] **Version updates** — For future updates, bump `version` in app.json and rebuild

---

## Quick Reference

| Item | Value |
|------|-------|
| Bundle ID | com.khasaa777.nutrio.app |
| ASC App ID | 6759483173 |
| EAS Project | bee22958-44cf-4e26-b360-a76f0fbc91c6 |
| Build command | `eas build -p ios --profile production` |
| Submit command | `eas submit -p ios --profile production --latest` |
