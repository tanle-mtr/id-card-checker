@echo off
setlocal EnableDelayedExpansion
set tmp_file=%TEMP%\clean_items.txt
set count=0
if exist "%tmp_file%" del "%tmp_file%"

echo ========================================
echo        C Drive Cleaner
echo ========================================
echo.
echo    Scanning...

rem === TEMP FILES ===
echo    [1/5] Temp files...
for %%f in (%TEMP%\*.tmp %TEMP%\*.log %TEMP%\*.old %TEMP%\*.bak) do (
    if exist "%%f" (
        set /a count+=1
        echo !count!^|%%f^|>>"%tmp_file%"
    )
)

rem === WINDOWS TEMP ===
echo    [2/5] Windows temp...
for %%f in (C:\Windows\Temp\*.tmp C:\Windows\Temp\*.log C:\Windows\Temp\*.old) do (
    if exist "%%f" (
        set /a count+=1
        echo !count!^|%%f^|>>"%tmp_file%"
    )
)

rem === DOWNLOADS ===
echo    [3/5] Downloads...
if exist "%USERPROFILE%\Downloads" (
    for %%f in ("%USERPROFILE%\Downloads\*.exe" "%USERPROFILE%\Downloads\*.msi" "%USERPROFILE%\Downloads\*.apk" "%USERPROFILE%\Downloads\*.zip" "%USERPROFILE%\Downloads\*.rar" "%USERPROFILE%\Downloads\*.7z") do (
        if exist "%%f" (
            set /a count+=1
            echo !count!^|%%f^|>>"%tmp_file%"
        )
    )
)

rem === VIDEOS ===
echo    [4/5] Videos...
for %%f in ("%USERPROFILE%\Videos\*.mp4" "%USERPROFILE%\Videos\*.avi" "%USERPROFILE%\Videos\*.mkv") do (
    if exist "%%f" (
        set /a count+=1
        echo !count!^|%%f^|>>"%tmp_file%"
    )
)
for %%f in ("%USERPROFILE%\Desktop\*.mp4" "%USERPROFILE%\Desktop\*.avi" "%USERPROFILE%\Desktop\*.mkv") do (
    if exist "%%f" (
        set /a count+=1
        echo !count!^|%%f^|>>"%tmp_file%"
    )
)

rem === SCREEN RECORDINGS ===
echo    [5/5] Screen recordings...
for %%f in ("%USERPROFILE%\Desktop\bandicam*.mp4") do (
    if exist "%%f" (
        set /a count+=1
        echo !count!^|%%f^|>>"%tmp_file%"
    )
)

if not exist "%tmp_file%" (
    echo No cleanable items found.
    pause
    exit /b 0
)

echo.
echo ========================================
echo        Scan complete: %count% items
echo ========================================
echo.

set per_page=10
set /a total_pages=(count+per_page-1)/per_page
set page=0

:show_page
cls
echo.
echo ========================================
echo    Cleanable Items (Page %page%/%total_pages%)
echo ========================================
echo.

set /a start=(page*per_page)+1
set /a end=(page+1)*per_page
set display_count=0

set cur=0
for /f "tokens=1,2 delims=|" %%a in ('type "%tmp_file%" ') do (
    set /a cur+=1
    if !cur! geq !start! (
        if !cur! leq !end! (
            set /a display_count+=1
            set fname=%%b
            for %%x in ("%%b") do set fname=%%~nx
            echo    [!cur!] !fname!
        )
    )
)

if !display_count! equ 0 (
    echo    (Empty)
)

echo.
echo    [p] Prev    [n] Next    [a] Select All    [q] Quit
echo.
set /p selection=Enter numbers (space separated): 

if /i "%selection%"=="p" (
    if %page% gtr 0 (
        set /a page-=1
        goto :show_page
    )
)
if /i "%selection%"=="n" (
    if %page% lss %total_pages% (
        set /a page+=1
        goto :show_page
    )
)
if /i "%selection%"=="q" (
    echo Cancelled.
    del "%tmp_file%" 2>nul
    pause
    exit /b 0
)
if /i "%selection%"=="a" (
    set selection=
    set /a start=(page*per_page)+1
    set /a end=(page+1)*per_page
    set cur=0
    for /f "tokens=1" %%n in ('type "%tmp_file%"'') do (
        set /a cur+=1
        if !cur! geq !start! if !cur! leq !end! (
            set selection=!selection! %%n
        )
    )
    if "!selection==" goto :show_page
)

if "!selection==" (
    echo No items selected.
    timeout /t 2 /nobreak >nul
    goto :show_page
)

echo.
echo    Selected items:
set cur=0
for /f "tokens=1,2 delims=|" %%a in ('type "%tmp_file%" ') do (
    set /a cur+=1
    for %%n in (%selection%) do (
        if !cur! equ %%n (
            set fname=%%b
            for %%x in ("%%b") do set fname=%%~nx
            echo      - !fname!
        )
    )
)

echo.
set /p confirm=Confirm delete? (y/n): 
if /i not "%confirm%"=="y" (
    goto :show_page
)

echo.
echo    Deleting...
echo.

set deleted=0
set failed=0

for %%n in (%selection%) do (
    set sel_path=
    set cur=0
    for /f "tokens=1,2 delims=|" %%a in ('type "%tmp_file%"'') do (
        set /a cur+=1
        if !cur! equ %%n (
            set sel_path=%%b
        )
    )
    if not "!sel_path==" (
        if exist "!sel_path!" (
            del "!sel_path!" /f /q >nul 2>&1
            if exist "!sel_path!" (
                echo    [X] Failed: %%~nx!sel_path!
                set /a failed+=1
            ) else (
                echo    [OK] Deleted: %%~nx!sel_path!
                set /a deleted+=1
            )
        ) else (
            echo    [--] Already gone
            set /a deleted+=1
        )
    )
)

echo.
echo ========================================
echo    Done: %deleted% deleted, %failed% failed
echo ========================================
echo.
del "%tmp_file%" 2>nul
pause