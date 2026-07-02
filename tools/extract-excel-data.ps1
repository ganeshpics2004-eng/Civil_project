param(
  [string]$WorkbookPath = "C:\Users\Ganesh\Downloads\CEFP PROJECT.xlsx",
  [string]$OutputPath = "src\data\experiments.json",
  [string]$AnalysisPath = "src\data\workbook-analysis.json"
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.IO.Compression.FileSystem

function Read-ZipText($zip, [string]$name) {
  $entry = $zip.GetEntry($name)
  if ($null -eq $entry) {
    throw "Missing workbook entry: $name"
  }

  $reader = [IO.StreamReader]::new($entry.Open())
  try {
    return $reader.ReadToEnd()
  }
  finally {
    $reader.Dispose()
  }
}

function Get-NodeText($node) {
  if ($null -eq $node) {
    return ""
  }

  if ($node -is [System.Xml.XmlElement]) {
    return ($node.InnerText -replace "\s+", " ").Trim()
  }

  return ([string]$node -replace "\s+", " ").Trim()
}

function Get-ColIndex([string]$cellRef) {
  $letters = ([regex]::Match($cellRef, "^[A-Z]+")).Value
  $index = 0
  foreach ($char in $letters.ToCharArray()) {
    $index = $index * 26 + ([int][char]$char - [int][char]"A" + 1)
  }

  return $index
}

function Get-ColName([int]$index) {
  $name = ""
  while ($index -gt 0) {
    $index--
    $name = [char](65 + ($index % 26)) + $name
    $index = [math]::Floor($index / 26)
  }

  return $name
}

function Get-NumericValue([string]$text) {
  if ([string]::IsNullOrWhiteSpace($text)) {
    return $null
  }

  $match = [regex]::Match($text, "[-+]?\d+(?:\.\d+)?")
  if (-not $match.Success) {
    return $null
  }

  return [double]::Parse($match.Value, [Globalization.CultureInfo]::InvariantCulture)
}

function Get-DateText([string]$text) {
  if ([string]::IsNullOrWhiteSpace($text)) {
    return $null
  }

  $match = [regex]::Match($text, "\b\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}\b")
  if ($match.Success) {
    return $match.Value
  }

  return $null
}

function Get-Material([string]$text) {
  $upper = $text.ToUpperInvariant()
  if ($upper -match "WITHOUT|WITH OUT") { return "Without agro waste" }
  if ($upper.Contains("SUGARCANE") -or $upper.Contains("BAGASSE")) { return "Sugarcane bagasse" }
  if ($upper.Contains("STRAW")) { return "Straw" }
  if ($upper.Contains("GRASS")) { return "Grass" }
  return "Unknown"
}

function New-RawRow([int]$rowNumber, $rowValues) {
  $cells = @()
  foreach ($key in ($rowValues.Keys | Sort-Object)) {
    $cells += [ordered]@{
      column = Get-ColName $key
      value = $rowValues[$key]
    }
  }

  return [ordered]@{
    rowNumber = $rowNumber
    cells = $cells
  }
}

function Get-RecipeField($rows, [int]$start, [int]$end, [string]$pattern) {
  for ($row = $start; $row -le $end; $row++) {
    if ($rows.ContainsKey($row) -and $rows[$row].ContainsKey(1)) {
      $value = [string]$rows[$row][1]
      if ($value -match $pattern) {
        return $value
      }
    }
  }

  return $null
}

function New-Composition($dustPercentage, $dustQuantity, $cement, $pSand, $fiber, $water) {
  return [ordered]@{
    dustPercentage = [ordered]@{ label = $dustPercentage; value = Get-NumericValue $dustPercentage; unit = "percent" }
    dustQuantity = [ordered]@{ label = $dustQuantity; value = Get-NumericValue $dustQuantity; unit = "kg" }
    cement = [ordered]@{ label = $cement; value = Get-NumericValue $cement; unit = "kg" }
    pSand = [ordered]@{ label = $pSand; value = Get-NumericValue $pSand; unit = "kg" }
    fiber = [ordered]@{ label = $fiber; value = Get-NumericValue $fiber; unit = "kg equivalent volume" }
    water = [ordered]@{ label = $water; value = Get-NumericValue $water; unit = "litre" }
  }
}

function Get-Observations($rawRows) {
  $observations = @()
  foreach ($rawRow in $rawRows) {
    foreach ($cell in $rawRow.cells) {
      $text = [string]$cell.value
      if ([string]::IsNullOrWhiteSpace($text)) {
        continue
      }

      $upper = $text.ToUpperInvariant()
      $category = $null
      if ($upper -match "KG|WATER ABSORPTION") { $category = "water_absorption" }
      if ($upper -match "ULTIMATE LOAD|CS|FS|LENGTH|BREADTH|HEIGHT|AREA") { $category = "strength_dimension" }
      if ($upper -match "ACID|MUFFLE|CURING|FURNANCE|FURNACE") { $category = "curing_condition" }

      if ($null -ne $category) {
        $brickMatch = [regex]::Match($text, "\b\d+[A-Z]\b")
        $observations += [ordered]@{
          category = $category
          sourceRow = $rawRow.rowNumber
          sourceColumn = $cell.column
          brickId = if ($brickMatch.Success) { $brickMatch.Value } else { $null }
          text = $text
        }
      }
    }
  }

  return $observations
}

if (-not (Test-Path -LiteralPath $WorkbookPath)) {
  throw "Workbook not found: $WorkbookPath"
}

$zip = [System.IO.Compression.ZipFile]::OpenRead($WorkbookPath)
try {
  [xml]$workbook = Read-ZipText $zip "xl/workbook.xml"
  [xml]$sharedStringsXml = Read-ZipText $zip "xl/sharedStrings.xml"
  [xml]$sheetXml = Read-ZipText $zip "xl/worksheets/sheet1.xml"

  $namespace = [Xml.XmlNamespaceManager]::new($sheetXml.NameTable)
  $namespace.AddNamespace("x", "http://schemas.openxmlformats.org/spreadsheetml/2006/main")

  $sharedStrings = @()
  foreach ($stringItem in $sharedStringsXml.sst.si) {
    $sharedStrings += Get-NodeText $stringItem
  }

  $rows = @{}
  foreach ($rowNode in $sheetXml.SelectNodes("//x:sheetData/x:row", $namespace)) {
    $rowNumber = [int]$rowNode.r
    $values = @{}
    foreach ($cell in $rowNode.c) {
      $columnIndex = Get-ColIndex $cell.r
      $value = ""
      if ($cell.t -eq "s") {
        $value = $sharedStrings[[int]$cell.v]
      }
      elseif ($cell.t -eq "inlineStr") {
        $value = Get-NodeText $cell.is
      }
      else {
        $value = Get-NodeText $cell.v
      }

      if (-not [string]::IsNullOrWhiteSpace($value)) {
        $values[$columnIndex] = ($value -replace "\s+", " ").Trim()
      }
    }

    if ($values.Count -gt 0) {
      $rows[$rowNumber] = $values
    }
  }

  $mergedRanges = @()
  foreach ($merge in $sheetXml.SelectNodes("//x:mergeCell", $namespace)) {
    $mergedRanges += $merge.ref
  }

  $experiments = @()

  $compactGroups = @(
    @{ start = 1; end = 8 },
    @{ start = 9; end = 16 },
    @{ start = 17; end = 24 }
  )

  foreach ($group in $compactGroups) {
    for ($column = 1; $column -le 3; $column++) {
      $title = [string]$rows[$group.start][$column]
      if ([string]::IsNullOrWhiteSpace($title)) {
        continue
      }

      $dustPercentage = [string]$rows[$group.start + 1][$column]
      $dustQuantity = [string]$rows[$group.start + 2][$column]
      $cement = [string]$rows[$group.start + 3][$column]
      $pSand = [string]$rows[$group.start + 4][$column]
      $fiber = [string]$rows[$group.start + 5][$column]
      $water = [string]$rows[$group.start + 6][$column]
      $curing = [string]$rows[$group.start + 7][$column]
      $rawRows = @()

      for ($row = $group.start; $row -le $group.end; $row++) {
        if ($rows.ContainsKey($row) -and $rows[$row].ContainsKey($column)) {
          $rawRows += [ordered]@{
            rowNumber = $row
            cells = @([ordered]@{ column = Get-ColName $column; value = $rows[$row][$column] })
          }
        }
      }

      $experiments += [ordered]@{
        id = "recipe-r$($group.start)-c$(Get-ColName $column)"
        sourceType = "compact_recipe"
        sourceSheet = "Sheet1"
        sourceRange = "$(Get-ColName $column)$($group.start):$(Get-ColName $column)$($group.end)"
        title = $title
        material = Get-Material $title
        recordedDate = Get-DateText $title
        composition = New-Composition $dustPercentage $dustQuantity $cement $pSand $fiber $water
        curingDate = $curing
        removedFromCuring = $null
        notes = @($fiber)
        observations = @()
        rawRows = $rawRows
      }
    }
  }

  $sectionStarts = @()
  foreach ($rowNumber in ($rows.Keys | Sort-Object)) {
    $row = $rows[$rowNumber]
    $text = (($row.Values | ForEach-Object { [string]$_ }) -join " ").ToUpperInvariant()
    if (
      $rowNumber -ge 26 -and
      (
        $text.Contains("WATER ABSORPTION TEST") -or
        $text.Contains("STRAW BRICK 40%") -or
        $text.Contains("BRICKS WITH OUT AGRO WASTE")
      )
    ) {
      $sectionStarts += [int]$rowNumber
    }
  }

  $sectionStarts = $sectionStarts | Sort-Object -Unique
  for ($index = 0; $index -lt $sectionStarts.Count; $index++) {
    $start = $sectionStarts[$index]
    $end = if ($index -lt $sectionStarts.Count - 1) { $sectionStarts[$index + 1] - 1 } else { 281 }
    while ($end -gt $start -and -not $rows.ContainsKey($end)) {
      $end--
    }

    $rawRows = @()
    for ($row = $start; $row -le $end; $row++) {
      if ($rows.ContainsKey($row)) {
        $rawRows += New-RawRow $row $rows[$row]
      }
    }

    $firstTexts = @()
    for ($row = $start; $row -le [Math]::Min($start + 5, $end); $row++) {
      if ($rows.ContainsKey($row)) {
        $firstTexts += (($rows[$row].Values | ForEach-Object { [string]$_ }) -join " ")
      }
    }

    $combined = ($firstTexts -join " ")
    $titleText = if ($rows[$start].ContainsKey(1) -and -not [string]::IsNullOrWhiteSpace($rows[$start][1])) {
      [string]$rows[$start][1]
    }
    elseif ($rows[$start].ContainsKey(2)) {
      [string]$rows[$start][2]
    }
    else {
      "Experiment section row $start"
    }

    $dustPercentage = Get-RecipeField $rows $start $end "%\s*DUST"
    if ($null -eq $dustPercentage) {
      $percentMatch = [regex]::Match($combined, "\d+\s*%")
      if ($percentMatch.Success) {
        $dustPercentage = "$($percentMatch.Value) DUST"
      }
    }

    $dustQuantity = Get-RecipeField $rows $start $end "KGS?\s+DUST"
    $cement = Get-RecipeField $rows $start $end "KGS?\s+CEMENT|%\s*CEMENT"
    $pSand = Get-RecipeField $rows $start $end "P\s*-?\s*SAND|P SAND"
    $fiber = Get-RecipeField $rows $start $end "EQUAL VOLUME|AGRO WASTE|GRASS USED|STRAW USED|BAGASSE"
    $water = Get-RecipeField $rows $start $end "LITRES?\s+OF\s+WATER"
    $curing = Get-RecipeField $rows $start $end "CURING DONE"
    $removed = Get-RecipeField $rows $start $end "TAKEN OUT"

    $notes = @()
    foreach ($rawRow in $rawRows) {
      foreach ($cell in $rawRow.cells) {
        $text = [string]$cell.value
        if ($text -match "KEPT|DON'T KNOW|CS-|FS-|ARE BRICK NUMBERS|H2S04|H2SO4|FURNANCE|FURNACE|ACID") {
          $notes += $text
        }
      }
    }

    $experiments += [ordered]@{
      id = "section-r$start"
      sourceType = "detailed_section"
      sourceSheet = "Sheet1"
      sourceRange = "A$($start):E$($end)"
      title = $titleText
      material = Get-Material $combined
      recordedDate = Get-DateText $combined
      composition = New-Composition $dustPercentage $dustQuantity $cement $pSand $fiber $water
      curingDate = $curing
      removedFromCuring = $removed
      notes = @($notes | Select-Object -Unique)
      observations = Get-Observations $rawRows
      rawRows = $rawRows
    }
  }

  $analysis = [ordered]@{
    workbook = Split-Path -Leaf $WorkbookPath
    sheetCount = 1
    sheets = @([ordered]@{
      name = "Sheet1"
      dimension = $sheetXml.worksheet.dimension.ref
      mergedRanges = $mergedRanges
      nonEmptyRows = $rows.Count
    })
    detectedStructure = [ordered]@{
      compactRecipeRecords = 9
      detailedExperimentSections = $sectionStarts.Count
      totalExperimentRecords = $experiments.Count
      sectionStarts = $sectionStarts
    }
    schema = [ordered]@{
      experiment = "ExperimentRecord"
      relationships = @(
        "ExperimentRecord has one Composition",
        "ExperimentRecord has many Observation entries",
        "ExperimentRecord preserves source rows and cells in rawRows",
        "Compact recipe records come from one source column; detailed sections come from A:E row blocks"
      )
    }
  }

  $outputDirectory = Split-Path -Parent $OutputPath
  if (-not (Test-Path -LiteralPath $outputDirectory)) {
    New-Item -ItemType Directory -Path $outputDirectory | Out-Null
  }

  [ordered]@{
    generatedFrom = Split-Path -Leaf $WorkbookPath
    generatedAt = (Get-Date).ToString("s")
    analysis = $analysis
    experiments = $experiments
  } | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $OutputPath -Encoding UTF8

  $analysis | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $AnalysisPath -Encoding UTF8

  Write-Host "Extracted $($experiments.Count) experiment records to $OutputPath"
}
finally {
  $zip.Dispose()
}
