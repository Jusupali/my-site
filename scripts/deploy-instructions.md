Deploy instructions (automated-friendly)

1) If you want a quick public demo (no git):

- Ensure server runs locally:

```powershell
npm install
npm start
```

- In another terminal run (localtunnel):

```powershell
npx localtunnel --port 3000
```

You'll get a public URL.

2) To publish to GitHub automatically (one-shot):

- Create a new GitHub repository (private or public) and copy its HTTPS URL.
- Run the provided script to init and push (PowerShell):

```powershell
# example
.\scripts\git-publish.ps1 -remoteUrl https://github.com/YOUR_USER/YOUR_REPO.git -branch main
```

3) To deploy to a container host (Railway/Render/Heroku):

- The project contains a `Dockerfile` and `Procfile`.
- If using Railway or Render, connect your GitHub repo and the platform will build using Docker or the `npm start` command.
- For Heroku, you can use the `Procfile` (web: node server.js) and `heroku` CLI to deploy.

4) To build locally into Docker image:

```powershell
# requires Docker installed
docker build -t luxdrive .
docker run -p 3000:3000 luxdrive
```

5) Notes about `database.sqlite`:

- The project uses SQLite for sessions and wishlists.
- When deploying to hosts, configure persistent storage or switch to a managed DB.
- For Docker deployments, mount a volume to persist `database.sqlite`:

```powershell
docker run -p 3000:3000 -v C:\path\to\data:/app luxdrive
```
