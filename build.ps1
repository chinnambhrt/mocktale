param (
    [string]$ContainerTool = ""
)

$ErrorActionPreference = "Stop"

function Check-Command {
    param ($cmd)
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        Write-Error "$cmd is not installed or not in PATH."
        exit 1
    }
}

# 1. Check tools
Check-Command npm
Check-Command git

# 2. Determine Container Tool
if ([string]::IsNullOrWhiteSpace($ContainerTool)) {
    $ContainerTool = Read-Host "Enter container tool to use (docker/podman) [default: docker]"
    if ([string]::IsNullOrWhiteSpace($ContainerTool)) { $ContainerTool = "docker" }
}

if ($ContainerTool -ne "docker" -and $ContainerTool -ne "podman") {
    Write-Error "Invalid container tool. Use 'docker' or 'podman'."
    exit 1
}
Check-Command $ContainerTool

# 3. Get Branch Name
try {
    $Branch = git rev-parse --abbrev-ref HEAD
    if ($LASTEXITCODE -ne 0) { throw "git failed" }
} catch {
    Write-Error "Failed to get git branch. Ensure this is a git repository."
    exit 1
}

# Sanitize branch name for docker tag (replace invalid chars with -)
$ImageTag = $Branch -replace '[^a-zA-Z0-9_.-]', '-'

Write-Host "Building for branch: $Branch (Image tag: $ImageTag)" -ForegroundColor Cyan

# 4. Build UI
Write-Host "Building UI..." -ForegroundColor Cyan
Push-Location ui
try {
    npm install
    if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "npm run build failed" }
}
catch {
    Write-Error "UI Build failed."
    exit 1
}
finally {
    Pop-Location
}

# 5. Move to service/static
Write-Host "Moving UI artifacts to service/static..." -ForegroundColor Cyan
$UiDist = Join-Path "ui" "dist"
$ServiceStatic = Join-Path "service" "static"

if (-not (Test-Path $UiDist)) {
    Write-Error "UI dist folder not found at $UiDist"
    exit 1
}

if (Test-Path $ServiceStatic) {
    Remove-Item $ServiceStatic -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $ServiceStatic | Out-Null
Copy-Item "$UiDist\*" $ServiceStatic -Recurse -Force

# 6. Build Service (Install deps)
Write-Host "Building Service..." -ForegroundColor Cyan
Push-Location service
try {
    npm install
    if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
}
catch {
    Write-Error "Service build failed."
    exit 1
}
finally {
    Pop-Location
}

# 7. Build Container Image
Write-Host "Building Container Image with $ContainerTool..." -ForegroundColor Cyan
try {
    & $ContainerTool build -t "mocktale:$ImageTag" .
    if ($LASTEXITCODE -ne 0) { throw "Container build failed" }
}
catch {
    Write-Error "Container build failed."
    exit 1
}

Write-Host "Build Complete! Image: mocktale:$ImageTag" -ForegroundColor Green
