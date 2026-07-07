$files = Get-ChildItem "c:\Users\Prafull\Desktop\SevaSetu\frontend\src\components\*.tsx"
foreach ($f in $files) {
    $content = Get-Content $f.FullName -Raw
    if ($content -match 'http://localhost:8000') {
        $content = $content -replace 'http://localhost:8000', '`${API_URL}'
        if ($content -notmatch "import \{ API_URL \}") {
            $firstImport = ($content | Select-String -Pattern "^import .+from 'react';" -AllMatches).Matches[0].Value
            $content = $content.Replace($firstImport, "$firstImport`nimport { API_URL } from '../config';")
        }
        Set-Content $f.FullName $content -NoNewline
        Write-Host "Updated: $($f.Name)"
    }
}
