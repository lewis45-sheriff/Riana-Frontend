# Company X Feedback Frontend

Next.js web application for the Company X customer feedback system. It provides
the customer survey, a staff dashboard, response and alert management, and the
AI-assisted dashboard and reply workflows. The frontend talks to the Django
API through a small typed client in `src/lib/api.ts`.

## Requirements

- Node.js 22
- npm
- The Django API running locally or at the URL configured with
  `NEXT_PUBLIC_API_URL`

## Local development

From this directory:

```bash
npm ci
npm run dev
```

Open <http://localhost:3000>. By default, API requests go to
`http://localhost:8000`; start the backend separately or set
`NEXT_PUBLIC_API_URL` to the API base URL before starting the frontend.

## Useful commands

```bash
npm run dev       # Start the Next.js development server
npm run lint      # Run ESLint
npm run test      # Run Vitest once
npm run test:watch
npm run build     # Create a production build
npm run start     # Serve a production build
```

## Configuration

`NEXT_PUBLIC_API_URL` is the API base URL, without a trailing slash. For local
development, use `http://localhost:8000`. The production release is built with
an empty value so the app calls `/api/...` on its current origin; the server's
Nginx configuration routes API requests to Django.

The API client sends credentials with requests because staff authentication is
stored in an HTTP-only cookie. Configure the backend's CORS and cookie settings
to match the frontend origin when they are hosted on different origins.

## Docker

The `Dockerfile` builds a multi-stage production image and runs Next.js in
standalone mode. Build it from this directory:

```bash
docker build --build-arg NEXT_PUBLIC_API_URL= -t riana-frontend:local .
docker run --rm -p 3000:3000 riana-frontend:local
```

The workspace-level `docker-compose.yml` can run the database, API, and
frontend together when the full project workspace is available.

## CI and deployment

The workflow in `.github/workflows/deploy.yml` runs ESLint and Vitest, builds
the Docker image, scans dependencies and the image with Trivy, then packages
the tested Next.js standalone output with a SHA-256 checksum. A push to `main`
deploys that exact artifact to staging. Production promotes the same
staging-tested artifact after the production GitHub Environment approval.

The Docker image is a build and scan gate; the EC2 host runs the packaged
standalone app as a Node `systemd` service. `ops/dispatch.sh` transfers the
artifact over pinned-host-key SSH, and `ops/deploy.sh` verifies and installs
the release, switches the `current` release link, restarts the service, and
checks the local health endpoint. Environment-specific settings and deployment
secrets are configured in GitHub Environments; do not commit credentials.

See [`CI_CD.md`](CI_CD.md) for environment setup, server layout, and operational
details.
