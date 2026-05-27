# Verify project setup and core server endpoints
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js is not installed or not available in PATH."
    exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm is not installed or not available in PATH."
    exit 1
}

npm ci
node --check server.js
node --check script.js

Write-Output "Starting server temporarily for smoke tests..."
$job = Start-Job -ScriptBlock {
    Set-Location $using:PSScriptRoot
    npm start | Out-Null
}
Start-Sleep -Seconds 3

try {
    $urls = @(
        'http://localhost:3000/',
        'http://localhost:3000/index.html',
        'http://localhost:3000/catalog.html',
        'http://localhost:3000/profile.html'
    )

    foreach ($url in $urls) {
        Write-Output "Checking $url"
        Invoke-WebRequest -Uri $url -UseBasicParsing -Method GET | Out-Null
    }

    $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/chat' -Method POST -Body (@{message='привет'} | ConvertTo-Json) -ContentType 'application/json'
    Write-Output "Chat API reply: $($response.reply)"
    Write-Output "Smoke tests completed successfully."
} finally {
    Write-Output "Stopping temporary server..."
    Stop-Job $job | Out-Null
    Remove-Job $job | Out-Null
}
