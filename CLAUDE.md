# 블로그 관리 지침

## 타임존
- 모든 포스트의 날짜/시간은 **한국 표준시(KST, UTC+9)** 기준으로 작성한다.
- Frontmatter 형식: `date: YYYY-MM-DD HH:MM:SS +0900`

## 포스트 생성 규칙
- 저장 경로: `_posts/`
- 파일명: `YYYY-MM-DD-타이틀.md` (공백은 하이픈으로 대체)
- Frontmatter 서식:
```
---
layout: post
title: "[타이틀]"
date: YYYY-MM-DD HH:MM:SS +0900
tags: [[태그]]
---
```

## 브랜치 전략
- 모든 작업은 **main** 브랜치에 직접 푸시한다.
