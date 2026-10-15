# 할 일 (TODO) 앱

설치나 빌드 없이 브라우저에서 바로 실행되는 TODO 앱입니다. (HTML/CSS/JavaScript)

## 실행

`index.html`을 브라우저로 열면 됩니다. 로컬 서버로 띄우려면:

```bash
python3 -m http.server 8000
# http://localhost:8000 접속
```

## 기능

- 할 일 추가 / 완료 체크 / 삭제
- 더블클릭으로 수정 (Enter 저장, Esc 취소, 내용을 비우면 삭제)
- 전체 완료/해제 토글
- 필터: 전체 · 진행 중 · 완료 (URL 해시 `#/active`, `#/completed`로 유지)
- 완료 항목 일괄 삭제, 남은 개수 표시
- `localStorage`에 자동 저장, 여러 탭 간 동기화
- 다크 모드 자동 지원, 모바일 화면 대응

## 파일 구성

| 파일 | 역할 |
| --- | --- |
| `index.html` | 화면 구조 |
| `style.css` | 스타일 (라이트/다크 테마) |
| `app.js` | 상태 관리, 렌더링, 이벤트 처리 |
