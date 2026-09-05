# HANOUT API smoke test
# Usage:
#   ./smoke-test.ps1                              # against http://localhost:4000
#   ./smoke-test.ps1 -BaseUrl https://api.example.com -AdminPassword admin123
# Requires a running backend with a seeded DB (npm run seed).
param(
  [string]$BaseUrl = "http://localhost:4000",
  [string]$AdminEmail = "admin@hanout.dz",
  [string]$AdminPassword = "admin123"
)

$ErrorActionPreference = 'Stop'
$api = "$BaseUrl/api"

function Step($name, $block) {
  try { & $block; Write-Host "PASS  $name" -ForegroundColor Green }
  catch { Write-Host "FAIL  $name -> $($_.Exception.Message)" -ForegroundColor Red; $script:failed = $true }
}

$script:failed = $false

Step "health" {
  $h = Invoke-RestMethod "$api/health" -TimeoutSec 10
  if (-not $h.success) { throw "not healthy" }
}

Step "admin login" {
  $a = Invoke-RestMethod "$api/auth/login" -Method Post -ContentType "application/json" `
    -Body (@{ email = $AdminEmail; password = $AdminPassword } | ConvertTo-Json)
  if ($a.data.user.role -ne 'admin') { throw "seeded account is not admin" }
  $script:adminToken = $a.data.token
}

$authAdmin = @{ Authorization = "Bearer $script:adminToken" }

Step "products list" {
  $p = Invoke-RestMethod "$api/products" -TimeoutSec 10
  if ($p.data.Count -lt 1) { throw "no products; run npm run seed" }
  $script:productId = $p.data[0].id
}

Step "register is always role=user" {
  $email = "smoke+$([guid]::NewGuid().ToString('N').Substring(0,8))@example.com"
  $r = Invoke-RestMethod "$api/auth/register" -Method Post -ContentType "application/json" `
    -Body (@{ name = "Smoke Tester"; email = $email; password = "secret123" } | ConvertTo-Json)
  if ($r.data.user.role -ne 'user') { throw "privilege escalation: got $($r.data.user.role)" }
  $script:userToken = $r.data.token
}
$authUser = @{ Authorization = "Bearer $script:userToken" }

Step "checkout computes delivery server-side" {
  $body = @{
    items = @(@{ productId = $script:productId; quantity = 1 })
    customerName = "Smoke Tester"; email = "smoke@example.com"; phone = "+213555123456"
    address = "123 Test St"; wilaya = "30 - Ouargla"; city = "Ouargla"; deliveryMethod = "Desk"
  } | ConvertTo-Json -Depth 5
  $co = Invoke-RestMethod "$api/cart/checkout" -Method Post -ContentType "application/json" -Headers $authUser -Body $body
  if ($co.data.status -ne 'Processing') { throw "unexpected status" }
  $script:orderId = $co.data.id
}

Step "checkout rejects invalid payload (400)" {
  try {
    Invoke-RestMethod "$api/cart/checkout" -Method Post -ContentType "application/json" -Headers $authUser -Body '{"bad":true}' | Out-Null
    throw "accepted invalid payload"
  } catch {
    if ($_.Exception.Response.StatusCode.value__ -ne 400) { throw $_ }
  }
}

Step "non-admin cannot create products (403)" {
  try {
    Invoke-RestMethod "$api/products" -Method Post -ContentType "application/json" -Headers $authUser `
      -Body '{"name":"x","description":"too short","price":1,"category":"Apparel","stock":1}' | Out-Null
    throw "non-admin created a product"
  } catch {
    if ($_.Exception.Response.StatusCode.value__ -ne 403) { throw $_ }
  }
}

Step "settings strips unknown keys" {
  $s = Invoke-RestMethod "$api/settings" -Method Put -ContentType "application/json" -Headers $authAdmin `
    -Body (@{ storeName = "HANOUT Smoke"; role = "superadmin" } | ConvertTo-Json)
  if ($s.data.storeName -ne 'HANOUT Smoke') { throw "storeName not saved" }
}

Step "admin can update order status" {
  Invoke-RestMethod "$api/orders/$script:orderId/status" -Method Patch -ContentType "application/json" -Headers $authAdmin `
    -Body '{"status":"Shipped"}' | Out-Null
}

Write-Host ""
if ($script:failed) { Write-Host "SOME CHECKS FAILED" -ForegroundColor Red; exit 1 }
Write-Host "ALL CHECKS PASSED" -ForegroundColor Green
