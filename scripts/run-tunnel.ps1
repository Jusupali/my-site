if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm is not installed or not available in PATH."
    exit 1
}

Write-Output "Starting public tunnel on port 3000..."
npx localtunnel --port 3000
