# Script to initialize a git repo (if missing), commit and push to provided remote
param(
  [Parameter(Mandatory=$true)]
  [string]$remoteUrl,
  [string]$branch = 'main'
)

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "git is not installed or not in PATH. Install git to run this script."
  exit 2
}

if (-not (Test-Path .git)) {
  git init
  git add .
  git commit -m "Initial commit: prepare for deploy"
} else {
  git add .
  git commit -m "Update: prepare for deploy" || Write-Output "No changes to commit"
}

# set branch and push
git branch -M $branch
git remote remove origin 2>$null || $null
git remote add origin $remoteUrl
git push -u origin $branch --force
