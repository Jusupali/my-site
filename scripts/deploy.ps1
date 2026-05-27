param(
    [string]$remoteUrl,
    [string]$branch = 'main'
)

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "git is not installed or not available in PATH. Install Git to use this script."
    exit 1
}

if (-not (Test-Path .git)) {
    git init
    git add .
    git commit -m "Initial commit: prepare for deploy"
} else {
    git add .
    try {
        git commit -m "Update deploy files" 2>$null
    } catch {
        Write-Output "No changes to commit."
    }
}

git branch -M $branch
if ($remoteUrl) {
    git remote remove origin 2>$null
    git remote add origin $remoteUrl
    git push -u origin $branch --force
} else {
    Write-Output "Remote URL not provided. Repository initialized locally."
}

if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Output "Docker found, building image luxdrive..."
    docker build -t luxdrive .
} else {
    Write-Output "Docker not available in PATH. Skipping local image build."
}
