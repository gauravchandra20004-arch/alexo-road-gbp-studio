Write-Host "=== 1. SYSTEM SPECS ==="
$os = Get-CimInstance Win32_OperatingSystem
$proc = Get-CimInstance Win32_Processor
$disk = Get-PSDrive C

[PSCustomObject]@{
    OS = $os.Caption
    Architecture = $os.OSArchitecture
    TotalRAM_GB = [math]::Round($os.TotalVisibleMemorySize / 1MB, 2)
    FreeRAM_GB = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
    FreeDisk_C_GB = [math]::Round($disk.Free / 1GB, 2)
    CPU = $proc.Name
    Cores = $proc.NumberOfCores
    Threads = $proc.NumberOfLogicalProcessors
} | Format-List

Write-Host "=== 2. DEVELOPMENT TOOLS AUDIT ==="

function Check-Command($cmd, $args) {
    try {
        $out = & $cmd $args 2>&1 | Out-String
        return $out.Trim()
    } catch {
        return "Not Installed"
    }
}

$results = [ordered]@{
    "Node.js" = Check-Command "node" "-v"
    "npm" = Check-Command "npm" "-v"
    "Git" = Check-Command "git" "--version"
    "GitHub CLI (gh)" = Check-Command "gh" "--version"
    "Firebase CLI" = Check-Command "firebase" "--version"
    "Flutter SDK" = Check-Command "flutter" "--version"
    "Dart SDK" = Check-Command "dart" "--version"
    "Java (JDK)" = Check-Command "java" "-version"
    "Android ADB" = Check-Command "adb" "--version"
}

# Chrome check
$chromePath = (Get-ItemProperty 'HKLM:\Software\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe' -ErrorAction SilentlyContinue).'(default)'
if ($chromePath -and (Test-Path $chromePath)) {
    $results["Google Chrome"] = (Get-Item $chromePath).VersionInfo.ProductVersion + " ($chromePath)"
} else {
    $results["Google Chrome"] = "Not Found in Standard Registry"
}

# Android Studio Check
$asPath = "C:\Program Files\Android\Android Studio"
if (Test-Path $asPath) {
    $results["Android Studio"] = "Installed at $asPath"
} else {
    $results["Android Studio"] = "Not Installed"
}

# Android SDK Check
$sdkPath = "$env:LOCALAPPDATA\Android\Sdk"
if (Test-Path $sdkPath) {
    $results["Android SDK"] = "Found at $sdkPath"
} else {
    $results["Android SDK"] = "Not Installed"
}

# Figma Check
$figmaPath = "$env:LOCALAPPDATA\Figma"
if (Test-Path $figmaPath) {
    $results["Figma Desktop"] = "Found in LocalAppData"
} else {
    $results["Figma Desktop"] = "Not Installed"
}

$results | Format-Table -AutoSize
