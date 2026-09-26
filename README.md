# Ven. Victor Akpevwen Onosemuode

A profile and ministry website for Ven. Victor Akpevwen Onosemuode JP, Anglican priest, teacher, author, counsellor, and mentor from Arhavwarien, Delta State, Nigeria.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Site sections

- `/` introduces Victor, his books, ministry, and services.
- `/about` shares his biography and life timeline.
- `/resources` presents the five legacy books.
- `/services` describes vestments, Christian books, counselling, and priestly mentorship.
- `/twsc` covers his ministry journey and church appointments.
- `/blog` presents community impact, achievements, and recognition.
- `/donate` presents community service and the St. Barnabas’ centenary project.
- `/contact` lists both locations, phone numbers, and email.

The supplied profile is the source of the biographical and contact content. Temporary images from the Sam Chand reference are collected in [`src/data/reference-images.ts`](src/data/reference-images.ts); replace those URLs with Victor’s image resources when available. Their alt text identifies them as temporary placeholders.

## Validate

```bash
npm run lint
npm run build
```