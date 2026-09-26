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
- `/ministry` covers his ministry journey and church appointments.
- `/legacy` presents community impact, achievements, and recognition.
- `/community` presents community service and the St. Barnabas’ centenary project.
- `/contact` lists both locations, phone numbers, and email.

The supplied profile is the source of the biographical and contact content. Temporary images from the Sam Chand reference are collected in [`src/data/reference-images.ts`](src/data/reference-images.ts); replace those URLs with Victor’s image resources when available. Their alt text identifies them as temporary placeholders.

## Validate

```bash
npm run lint
npm run build
```

## Authentication & Authorization

This project uses **MongoDB** for persistence and **JWT** for authentication.

### Roles
- **Admin** – full access to all resources.
- **Manager** – can create, edit, delete posts and manage users.
- **User** – can view purchased items (books, resources).

### Required environment variables
```dotenv
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
```

See the `src/lib/mongodb.ts` and `src/models` directory for the connection logic and schema definitions.