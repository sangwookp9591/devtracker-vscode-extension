# DevTacker Time Tracker

**DevTacker Time Tracker**는 개발자의 작업 시간을 자동으로 기록하고, DevTracker 서버로 활동 데이터를 전송하는 VS Code 확장 프로그램입니다.

## ✨ 기능

-   **자동 시간 추적**: API Key가 설정되어 있으면 VS Code 실행 시 자동으로 추적 시작
-   **수동 제어**: 명령어를 통해 추적 시작/중지 가능
-   **상태바 표시**: 작업 시간 경과를 분 단위로 상태바에 표시
-   **서버 전송**: 5분마다 활동 데이터를 DevTracker 서버에 전송
-   **활동 기록**:
    -   파일 이름
    -   프로젝트 경로
    -   언어 종류
    -   작업 시간(분)
    -   변경된 라인 수
    -   활동 시각

---

## 📦 설치

1. 이 저장소를 클론하거나 VSIX 파일을 설치합니다.
2. VS Code에서 확장을 로드합니다.

```bash
npm install
npm run compile
```
