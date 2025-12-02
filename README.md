# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

App idea:

# Vær-app – endelige notater (100 % klar)

## Appens funksjonalitet

- Stor værkort øverst med brukerens **nåværende posisjon** (automatisk via GPS)
- "Mine steder"-seksjon med **inntil 10 lagrede steder** verden over (5 default posisjoner ligger der allerede)
- Hvert sted viser været i dag + 3 kommende dager
- "Siste fra meteorologene"-boks (offisiell tekst fra MET)
- Rød/gul/oransje varselbanner når det er aktive farevarsler
- Pull-to-refresh på mobil ("Slipp for å oppdatere")

## Endelig filstruktur (med kommentarer)

```bash
src/
├── components/
│   ├── LocationCard.jsx       # Stor værkort for brukerens nåværende posisjon
│   ├── LocationList.jsx       # "Mine steder": tittel, add-knapp, grid + fjern-knapp på hvert sted
│   ├── AddLocationModal.jsx   # Modal for å søke og legge til nytt sted (maks 10)
│   ├── LatestNews.jsx         # Viser nyeste "Siste fra meteorologene"-tekst
│   ├── ActiveWarnings.jsx     # Rød/gul/oransje banner øverst ved aktive farevarsler (MetAlerts)
│   ├── WeatherIcon.jsx        # Konverterer METs symbol_code → riktig SVG-ikon
│   ├── Header.jsx             # Topplinje med tittel + refresh-knapp (synlig på desktop)
│   └── LoadingSpinner.jsx     # Enkel spinner mens data lastes
├── hooks/
│   └── useWeather.js          # Custom hook – henter + cacher Locationforecast 2.0 for lat/lon
├── utils/
│   ├── storage.js             # Hjelpefunksjoner for localStorage (caching + lagrede steder)
│   ├── formatDate.js          # Norsk formatering av dato/klokkeslett
│   └── getWeatherIcon.js      # Oversetter symbol_code → filnavn på SVG-ikon
├── App.jsx                    # Hovedkomponent – alt state og logikk
└── main.jsx                   # Vite entry-point
```

API-er som brukes:
Locationforecast 2.0 compact → hovedvarsel
https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=XX&lon=YY
MetAlerts 2.0 → offisielle farevarsler (for ActiveWarnings-komponenten)
https://api.met.no/weatherapi/metalerts/2.0/current.json
Textforecast 2.0 – landoverview → "Siste fra meteorologene"
https://api.met.no/weatherapi/textforecast/2.0/landoverview
Nominatim (OpenStreetMap) → stedsøk (gratis, ingen nøkkel)
https://nominatim.openstreetmap.org/search?q=Oslo&format=json
Værikoner → lastet ned fra https://github.com/metno/weathericons

## Clean file structure:

```bash
src/
├── components/
│ ├── LocationCard.jsx
│ ├── LocationList.jsx
│ ├── AddLocationModal.jsx
│ ├── LatestNews.jsx
│ ├── activeWarnings.jsx
│ ├── WeatherIcon.jsx
│ ├── Header.jsx
│ └── LoadingSpinner.jsx
├── hooks/
│ └── useWeather.js
├── utils/
│ ├── storage.js
│ ├── formatDate.js
│ └── getWeatherIcon.js
├── App.jsx
└── main.jsx
```

Obligatorisk NPM-pakke (oppgavekrav)
Bashnpm install pull-to-refresh-react
Gir ekte "Slipp for å oppdatere"-følelse på mobil. Når brukeren drar siden ned, hentes all værdata på nytt fra MET sine API-er – uten full page reload.
→ Fungerer automatisk på telefon/nettbrett
→ Desktop får en vanlig "↻ Oppdater"-knapp i Header-komponenten
