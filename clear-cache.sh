#!/bin/bash

echo "========================================"
echo "안전나침반 개발 환경 캐시 정리 도구"
echo "========================================"
echo

# Chrome 정리 (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "[1] Chrome 브라우저 데이터 정리 중..."
    pkill -f "Google Chrome" 2>/dev/null
    sleep 2
    rm -rf ~/Library/Caches/Google/Chrome/* 2>/dev/null
    rm -rf ~/Library/Application\ Support/Google/Chrome/Default/Cache/* 2>/dev/null
    rm -f ~/Library/Application\ Support/Google/Chrome/Default/Cookies 2>/dev/null
    rm -rf ~/Library/Application\ Support/Google/Chrome/Default/Local\ Storage/* 2>/dev/null
    echo "Chrome 캐시 정리 완료"

    echo "[2] Safari 브라우저 데이터 정리 중..."
    pkill -f Safari 2>/dev/null
    sleep 2
    rm -rf ~/Library/Caches/com.apple.Safari/* 2>/dev/null
    rm -rf ~/Library/Safari/LocalStorage/* 2>/dev/null
    echo "Safari 캐시 정리 완료"

# Linux 정리
else
    echo "[1] Chrome 브라우저 데이터 정리 중..."
    pkill -f chrome 2>/dev/null
    sleep 2
    rm -rf ~/.cache/google-chrome/* 2>/dev/null
    rm -rf ~/.config/google-chrome/Default/Cache/* 2>/dev/null
    rm -f ~/.config/google-chrome/Default/Cookies 2>/dev/null
    rm -rf ~/.config/google-chrome/Default/Local\ Storage/* 2>/dev/null
    echo "Chrome 캐시 정리 완료"

    echo "[2] Firefox 브라우저 데이터 정리 중..."
    pkill -f firefox 2>/dev/null
    sleep 2
    find ~/.mozilla/firefox -name "cache2" -type d -exec rm -rf {} + 2>/dev/null
    find ~/.mozilla/firefox -name "cookies.sqlite" -type f -delete 2>/dev/null
    echo "Firefox 캐시 정리 완료"
fi

echo
echo "========================================"
echo "모든 브라우저 캐시가 정리되었습니다!"
echo "이제 브라우저를 다시 열어서 테스트하세요."
echo "========================================"
echo

echo "5초 후 브라우저로 개발 서버를 엽니다..."
sleep 5

# 브라우저 열기
if [[ "$OSTYPE" == "darwin"* ]]; then
    open -a "Google Chrome" --args --new-window --incognito "http://localhost:5000"
else
    google-chrome --new-window --incognito "http://localhost:5000" 2>/dev/null &
fi

echo "캐시 정리 완료!"