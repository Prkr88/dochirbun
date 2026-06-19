# דו"חירבון

**כי כל חוויה ראויה לתיעוד.**

דו"חירבון is a humorous Next.js application for documenting poop reports only. It includes Google sign-in, structured poop-report submission, optional image upload to Firebase Storage, leaderboard logic, Firebase client/admin adapters, Firestore and Storage security rules, and GitHub Actions CI.

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create local environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Fill in the Firebase values in `.env.local`.

4. Enable Firebase Authentication with the Google provider.

5. Deploy Firestore and Storage rules:

   ```bash
   firebase deploy --only firestore,storage
   ```

6. Run the app:

   ```bash
   npm run dev
   ```

5. Validate before opening a pull request:

   ```bash
   npm run typecheck
   npm run lint
   npm test
   npm run build
   ```

## Source Control Workflow

The GitHub repository should be named `dochirbon` or `duchirbon`.

Branch strategy:

- `main`: production branch, protected
- `develop`: integration branch
- `feature/*`: feature work
- `bugfix/*`: fixes

Required repository settings:

- Protect `main`
- Require pull requests before merge
- Require the `CI / validate` check before merge
- Require branches to be up to date before merge
- Disable direct pushes to `main`

## CI/CD

GitHub Actions runs on pull requests and pushes to `main`.

Checks:

- TypeScript compilation
- ESLint
- Unit tests
- Build validation

Workflow file: `.github/workflows/ci.yml`

## Deployment

Connect the GitHub repository directly to Vercel.

Deployment flow:

```text
GitHub
   ↓
Pull Request
   ↓
Vercel Preview Deployment
   ↓
Merge to Main
   ↓
Automatic Production Deployment
```

No manual deployments should be used. Add the same Firebase environment variables in Vercel for preview and production environments.

## Required Environment Variables

Public Firebase client variables:

```text
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

Firebase Admin variables:

```text
FIREBASE_ADMIN_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL
FIREBASE_ADMIN_PRIVATE_KEY
```

Store these as GitHub Secrets when needed by workflows and as Vercel Environment Variables for deployments.

## Architecture

```text
Browser
  ↓
Next.js App Router
  ↓
Components + Hooks
  ↓
Services
  ↓
Firebase Client SDK
  ↓
Firestore / Auth / Storage

Server-only code
  ↓
Firebase Admin SDK
  ↓
Session verification and privileged operations
```

Key directories:

- `app/`: Next.js routes and global styles
- `components/`: reusable UI components
- `hooks/`: client-side state helpers
- `services/`: Firebase-backed report creation, image upload, and reads
- `lib/firebase/`: Firebase client and admin initialization
- `lib/auth/`: server-side session helpers
- `lib/leaderboard/`: leaderboard domain logic
- `types/`: shared TypeScript types

## Database Schema

### `reports/{reportId}`

| Field | Type | Description |
| --- | --- | --- |
| `userId` | string | Firebase Auth user id of the reporter |
| `userEmail` | string | Authenticated Google account email |
| `userPhotoUrl` | string | Optional Google profile image |
| `reporterName` | string | Submitted display name |
| `serviceNumber` | string | Optional service number |
| `role` | string | Submitter role |
| `facility` | string | `organized-toilet`, `chemical-toilet`, `field-squat`, or `improvised` |
| `improvisedFacilityDescription` | string | Required when facility is improvised |
| `sittingTime` | string | Sitting duration bucket |
| `peeTiming` | string | Before, during, after, or none |
| `entertainment` | string | None, phone, newspaper, book, or other |
| `color` | string | Stool color bucket |
| `foodResidue` | string | Food residue bucket |
| `stoolCharacter` | string | Shape/texture bucket |
| `dropStyle` | string | Drop style bucket |
| `dropSound` | string | Drop sound bucket |
| `exitCharacter` | string | Exit effort bucket |
| `smell` | string | Smell bucket |
| `paperSquares` | string | Toilet paper usage bucket |
| `rating` | number | Integer from 1 to 5 |
| `aftermath` | string | Cleanup method |
| `notes` | string | Free-text notes |
| `imageUrl` | string | Optional uploaded image URL |
| `createdAt` | timestamp | Server timestamp |

### `users/{userId}`

| Field | Type | Description |
| --- | --- | --- |
| `displayName` | string | Public display name |
| `photoURL` | string | Optional profile image |
| `createdAt` | timestamp | Account creation timestamp |

## Security Rules

Firestore rules are stored in `firestore.rules`. Storage rules are stored in `storage.rules`.

Current policy:

- Anyone can read reports and public user profiles.
- Only authenticated Google users can create reports.
- A report can only be created with `userId` equal to `request.auth.uid` and `userEmail` equal to the auth token email.
- All poop-report enum fields, notes, rating, and optional fields are validated at write time.
- Images can only be uploaded by the owning user under `reports/{userId}/`, must be images, and must be 2 MB or smaller.
- Only the owner can update or delete a report.
- Users can create or update only their own profile document.
- Profile deletion is denied by default.

Indexes are stored in `firestore.indexes.json`.

## Future Integrations

Planned follow-up integrations:

- Dependabot
- Renovate
- Snyk Security Scanning
- CodeQL
- Automated Firebase Rules Validation
- Automated Lighthouse Performance Checks
