@echo off
echo ========================================
echo 안전나침반 개발 환경 캐시 정리 도구
echo ========================================
echo.

echo [1] Chrome 브라우저 데이터 정리 중...
taskkill /f /im chrome.exe >nul 2>&1
timeout /t 2 >nul
rd /s /q "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Cache" >nul 2>&1
rd /s /q "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Code Cache" >nul 2>&1
del /q "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Cookies" >nul 2>&1
del /q "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Local Storage\*" >nul 2>&1
echo Chrome 캐시 정리 완료

echo [2] Edge 브라우저 데이터 정리 중...
taskkill /f /im msedge.exe >nul 2>&1
timeout /t 2 >nul
rd /s /q "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Cache" >nul 2>&1
rd /s /q "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Code Cache" >nul 2>&1
del /q "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Cookies" >nul 2>&1
echo Edge 캐시 정리 완료

echo [3] Firefox 브라우저 데이터 정리 중...
taskkill /f /im firefox.exe >nul 2>&1
timeout /t 2 >nul
for /d %%i in ("%APPDATA%\Mozilla\Firefox\Profiles\*") do (
    rd /s /q "%%i\cache2" >nul 2>&1
    del /q "%%i\cookies.sqlite" >nul 2>&1
)
echo Firefox 캐시 정리 완료

echo.
echo ========================================
echo 모든 브라우저 캐시가 정리되었습니다!
echo 이제 브라우저를 다시 열어서 테스트하세요.
echo ========================================
echo.

echo 5초 후 Chrome으로 개발 서버를 엽니다...
timeout /t 5 >nul
start chrome "http://localhost:5000" --new-window --incognito

pause