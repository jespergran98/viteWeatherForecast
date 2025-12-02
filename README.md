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

---

### Valgte NPM-pakker i prosjektet (alle er frivillige oppgaveforslag – ingen er påkrevd, men må minst bruke en)

| Pakke                          | Begrunnelse og nytte i Vær-appen                                                                      |
| ------------------------------ | ----------------------------------------------------------------------------------------------------- |
| **`ky`**                       | Ultralett (~1.7 kB) og moderne HTTP-klient. Valgt fremfor Axios – mindre bundle og mye penere syntax. |
| **`@tanstack/react-query`**    | Automatisk caching, refetch, retry, deduping og offline-støtte. Gjør all værdata-håndtering silkemyk. |
| **`zustand` + `persist`**      | Minimalistisk global state + automatisk lagring av "Mine steder" i localStorage uten egen kode.       |
| **`date-fns` + `date-fns-tz`** | Lett og treeshakable dato-bibliotek. Brukes til norsk formatering av tidspunkt og prognosedager.      |
| **`clsx`**                     | Rask og ryddig betinget klassenavn (f.eks. rød/gul/oransje varselbanner).                             |
| **`framer-motion`**            | Premium-animasjoner ved legg til/fjern steder og modal-transisjoner.                                  |
| **`pull-to-refresh-react`**    | Gir ekte native "pull-to-refresh"-følelse på mobil. På desktop vises vanlig oppdater-knapp.           |
| **`use-debounce`**             | Debouncer søket i AddLocationModal så vi slipper å spamme Nominatim.                                  |
| **`ngeohash`**                 | Hindrer duplikater av samme sted ved å sammenligne geografiske posisjoner presist.                    |
| **`@radix-ui/react-dialog`**   | 100 % tilgjengelig og pen modal for å søke og legge til nye steder.                                   |
| **`@radix-ui/react-toast`**    | Elegante toast-meldinger (f.eks. "Maks 10 steder nådd" eller nettverksfeil).                          |
| **`vite-plugin-svgr`** (dev)   | Lar oss importere METs weathericons direkte som React-komponenter.                                    |

### Beste praksis fra en som har laget 6 værnettsider:

- En liten `src/lib/api.js` med `ky.extend()` + TanStack Query → gir retry, timeout, caching og korrekt User-Agent automatisk på alle MET-kall
- Global `useLocationsStore` (Zustand + persist) → erstattet hele `utils/storage.js` og ryddet enormt opp i App.jsx
- `<AnimatePresence>` fra Framer Motion rundt kortene → magisk flyt når steder legges til eller fjernes

### Endelig package.json

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "ky": "^1.7.2",
    "@tanstack/react-query": "^5.59.16",
    "zustand": "^5.0.1",
    "date-fns": "^4.1.0",
    "date-fns-tz": "^3.2.0",
    "clsx": "^2.1.1",
    "framer-motion": "^12.0.0",
    "pull-to-refresh-react": "^2.0.0",
    "use-debounce": "^10.0.4",
    "ngeohash": "^0.6.3",
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-toast": "^1.2.6"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite-plugin-svgr": "^4.3.0"
  }
}
```
