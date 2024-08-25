# 프로젝트 "IceCraft"

배포 도메인 : [배포 링크 이동하기](https://icecraft.co.kr)

프로젝트 명 : IceCraft

팀 노션 : [이동하기](https://daisy-nemophila-c53.notion.site/Ice-Craft-2a79b9aa450844b1964829b0378671d7?pvs=4)
<br>
<br>

`1차 개발 기간` : 2024.03.26 ~ 2024.05.01 <br>
`2차 개발 기간` : 2024.05.20 ~ 2024.07.29
<br>
<br>
프로젝트 소개 : 실시간 화상 게임 서비스

<br>
<br>
<br>

## 팀원 소개

|                                           박서영                                           |                                           김명환                                           |                                           이준구                                           |                                           안주원                                           |
| :----------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------: |
| <img src="https://avatars.githubusercontent.com/u/116704646?v=4" alt="박서영" width="100"> | <img src="https://avatars.githubusercontent.com/u/154975499?v=4" alt="김명환" width="100"> | <img src="https://avatars.githubusercontent.com/u/145527618?v=4" alt="이준구" width="100"> | <img src="https://avatars.githubusercontent.com/u/154520094?v=4" width="100" alt="안주원"> |
|                          [@seokachu](https://github.com/seokachu)                          |                           [@baram55](https://github.com/baram55)                           |                       [@LeeJunGoo](https://github.com/LeeJunGoo)                       |                             [@joo1e](https://github.com/joo1e)                             |
|                                            리더                                            |                                           부리더                                           |                                            팀원                                            |                                            팀원                                            |

<br>
<br>
<br>


## 핵심 기능

`메인페이지` <br>
- 방 리스트 검색 : Debounce를 사용한 방 목록 검색 가능 <br>
- 실시간 방 리스트 : 게임 현재 인원수, 총 인원수, 방 리스트를 실시간으로 볼 수 있는 기능 <br>
- 메인 슬라이드 : 다양한 게임의 설명과 게임 시작 옵션을 슬라이드 형식으로 제공하여 사용자 UI/UX 향상 <br>
- TypeBot : IceCraft에 대한 설명을 볼 수 있는 기능 <br>
- Loading UI : 데이터를 불러오기 전, loading UI를 표시하여 UI/UX 향상 <br>

`랭킹페이지` <br>
- 내 닉네임 보기 : 모든 user의 랭킹 리스트 중, 자신의 랭킹의 정보를 상단에 고정
- 페이지네이션 : 10명 단위로 페이지네이션 기능으로 긴 목록을 스크롤하는 부담을 줄임

`마피아 게임 페이지` <br>
- 오디오 & 캠 설정 : 방 입장하기 전 미디어 장치를 설정
- 닉네임 & 플레이어 번호 : 게임의 원활한 진행을 위해 각 Player의 닉네임 및 PlayerNumber를 부여
- Loading UI : 메인페이지로 이동 시 DB에 적용되기 전 까지 빈 공백을 Loading UI로 표시하여 UI/UX 향상
  



<br>
<br>
<br>


## Tools

Communication

<table>
  <tr>
    <th>Github</th>
    <th>Slack</th>
    <th>Figma</th>
    <th>ZEP</th>
  </tr>
  <tr>
    <td width="100" height="100">
      <div style="display: flex; align-items: center;">
        <img src="https://techstack-generator.vercel.app/github-icon.svg" alt="icon" width="65" height="65" />
      </div>     
    </td>
    <td width="100" height="100">
      <div style="display: flex; align-items:center; justify-content:center;">
         &nbsp;&nbsp;&nbsp;<img src="https://github.com/seokachu/movie_project/assets/116704646/7587830d-ead0-4adb-aa60-984df1b326a5" alt="icon" width="45" height="45" style="text-align:center" />
      </div>
    </td>
    <td width="100" height="100">
      <div style="display: flex; align-items:center; justify-content:center;">
        &nbsp;&nbsp;
        <img src="https://github.com/sparta-advancedProject-team10/HappyMungLife/assets/116704646/867feb77-319b-497f-9836-07abb6637596" alt="icon" width="45" text-align="center">
      </div>
    </td>
     <td width="100" height="100">
      <div style="display: flex; align-items:center; justify-content:center;">
        &nbsp;&nbsp;
        <img src="https://github.com/user-attachments/assets/09e371f7-81eb-49f7-9443-a5c2bc357734" alt="icon" width="50" text-align="center">
      </div>
    </td>
  </tr>
</table>

<br>
<br>
<br>

## 개발환경

<table>
  <tr>
    <th>Next.js</th>
    <th>TypeScript</th>
    <th>Supabase</th>
    <th>Prettier</th>
    <th>Module css</th>
    <th>Zustand</th>
  </tr>
  <tr>
    <td width="100" height="100">
      <div style="display: flex; align-items:center; justify-content:center;">
        &nbsp;&nbsp;<img src="https://github.com/sparta-advancedProject-team10/HappyMungLife/assets/116704646/ca3b35d4-25bf-4038-9a33-2daf9e6c5ade" alt="icon" width="50" height="50" style="text-align:center" />
      </div>
    </td>
    <td width="100" height="100">
       <div style="display: flex; align-items: flex-start;">
         <img src="https://techstack-generator.vercel.app/ts-icon.svg" alt="icon" width="80" height="80" />
       </div>
     </td>
     <td width="100" height="100">
      <div style="display: flex; align-items: center;">
        &nbsp;
        <img src="https://github.com/sparta-advancedProject-team10/HappyMungLife/assets/121484282/81b31829-810a-4653-b54e-2fc9a3d98ad0" alt="icon" width="65" height="65" />
      </div>     
    </td>
    <td width="100" height="100">
      <div style="display: flex; align-items: center;">
        <img src="https://techstack-generator.vercel.app/prettier-icon.svg" alt="icon" width="65" height="65" />
      </div>     
    </td>
    <td width="100" height="100">
      <div style="display: flex; align-items: center;">
          &nbsp;
        <img src="https://github.com/ice-craft/ice-craft/assets/116704646/248b37f6-b404-42fd-8e4a-2ea1ab4a53d1" alt="icon" width="60" height="60" />
      </div>     
    </td>
    <td width="100" height="100">
      <div style="display: flex; align-items: center;">
        &nbsp;
        <img src="https://github.com/ice-craft/ice-craft/assets/116704646/c519f7e9-ae7a-4749-a849-97a836428a05" alt="icon" width="60" height="60" />
      </div>     
    </td>
  </tr>
</table>

<br>
<table>
  <tr>
    <th>Livekit</th>
    <th>Socket.io</th>
    <th>Express.js</th>
    <th>AWS</th>
  </tr>
  <tr>
    <td width="100" height="100">
      <div style="display: flex; align-items: center;">
        &nbsp;
        <img src="https://github.com/ice-craft/ice-craft/assets/116704646/8d33be75-ce12-495c-8a19-03d4913e7578" alt="icon" width="60" height="60" />
      </div>     
    </td>
     <td width="100" height="100">
      <div style="display: flex; align-items: center;">
        &nbsp;
        <img src="https://github.com/ice-craft/ice-craft/assets/116704646/98b0fa6c-8a9d-431d-9c21-b54a34858ddb" alt="icon" width="60" height="60" />
      </div>     
    </td>
    <td width="100" height="100">
      <div style="display: flex; align-items: center;">
        &nbsp;
        <img src="https://github.com/ice-craft/ice-craft/assets/116704646/c57e63a4-2d75-4579-8ae2-4622f25d516d" alt="icon" width="60" height="60" />
      </div>     
    </td>
     <td width="100" height="100">
      <div style="display: flex; align-items: center;">
        &nbsp;
        <img src="https://techstack-generator.vercel.app/aws-icon.svg" alt="icon" width="60" height="60" />
      </div>     
    </td>
  </tr>
</table>

<br>
<br>
<br>



## Git Branch

`main` : 운영, 배포 브랜치 <br>

`dev` : 기능 통합 개발 브랜치

`Feature` : 하나의 기능을 담당하는 브랜치, 컨벤션을 적용하여 표시

<br>
<br>
<br>



## 역할 소개

<table>
  <tr>
    <th>역할</th>
    <th>Features</td>
  </tr>
  <tr>
    <td>
      박서영
    </td>
    <td align="center">
      <br>
      <strong><em>** 메인 페이지 **</em></strong> <br>
      socket.io 양방향 통신 구현, 실시간 방 리스트 정보 구현<br>
      Swiper - 슬라이드 추가 <br>
      Skeleton - 로딩페이지 구현 <br>
      Typebot - Typebot 추가 <br>
      Debounce를 이용한 방 리스트 검색 구현 <br>
      Cookie - 하루 창 닫기 모달창 구현 <br>
      <br>
      <strong><em>** Info 페이지 **</em></strong> <br>
      스크롤 이벤트 - 애니메이션을 사용한 인터렉티브한 UI/UX 구현 <br>
      <br>
      <strong><em>** QnA 페이지 **</em></strong> <br>  
      Email.js - 유저 문의 받기 구현<br>
      <br>
      <strong><em>** 마피아 게임 페이지 **</em></strong> <br> 
      Livekit - 연결 작업 <br>
      게임페이지 레이아웃 작업 <br>
      모달창 UI 작업 - 조건부 랜더링에 따라 모달창 작업 <br>
      폭죽 효과 애니메이션 <br>
      <br>
      전체페이지 퍼블리싱<br>
      구글 애널리틱스 추가<br>
      <br>
    </td>
  </tr>
  <tr>
    <td>김명환</td>
     <td align="center">
      <br>
      <strong><em>** 마피아 게임 페이지 (Server) **</em></strong> <br> 
      Express.js - 마피아의 게임 서버 <br>
      Socket.io - 클라이언트와의 양방향 통신을 통해 게임을 진행 <br>
Supabase - 게임 방 및 게임 진행에 필요한 DB 설계 및 api 구현 <br>
Nodemon - 서버 개발의 편의성을 위해 nodemon을 사용 <br>
PM2 - 서버의 안정성과 성능 향상을 위해 PM2를 이용하여 서버 구동 <br>
AWS - 서버를 배포하기 위한 플랫폼으로 AWS를 선택 <br>
사용자의 방 생성, 입장, 탈퇴 등 게임 방에 관련된 기능 구현 <br>
마피아 게임 전체 알고리즘 구현 <br>
      <br>
      <strong><em>** Front-End **</em></strong> <br> 
    Supabase DB 설계 및 api 구현 <br>
sns 사이트 auth 설정<br>
      <br>
      <strong><em>** 로그인 페이지 **</em></strong> <br> 
   Supabase - supabase의 auth 기능을 통해 로그인 처리 <br>
유효성 검사 - id와 password를 Supabase에 저장된 데이터와 비교<br>
react-cookie - 리액트 쿠키 라이브러리를 통해서 일정 기간 동안 이메일을 쿠키에 저장<br>
supabase와 각 sns 사이트의 auth 기능을 통해 sns 계정으로 로그인이 가능하도록 구현<br>
      <br>
      <strong><em>** 회원가입 페이지 **</em></strong> <br> 
Supabase - supbase의 계정 테이블에 유저의 계정을 저장, 입력한 이메일의 가입 중복 여부 확인<br> 
유효성 검사 - 유저가 입력한 계정 정보가 회원가입에 적합한지 확인<br> 
실시간 피드백 - 유저가 타이핑하는 정보를 실시간으로 검사하여 회원 가입 가능 여부를 알림<br> 
정규식 - 정규식을 통해 유저가 입력한 이메일과 비밀번호의 패턴을 분석하여 회원 가입 가능 여부 검사<br> 
supabase와 각 sns 사이트의 auth 기능을 통해 sns 계정으로 회원 가입이 가능하도록 구현<br> 
      <br>
        <strong><em>** 랭킹 페이지 **</em></strong> <br> 
supabase api를 랭킹 페이지에 적용<br> 
유저의 랭킹을 정하는 알고리즘 구현<br> 
      <br>
    </td>
  </tr>
  <tr>
    <td>이준구</td>
     <td align="center">
      <br>
      <strong><em>** 마피아 게임 페이지 **</em></strong> <br> 
       Livekit - 화상 채팅 구현<br>
       Socket.io 양방향 통신 UI 연결 작업 <br>
       Local, Remote 컴포넌트 분리 및 사용자 구분 처리, <br>
       게임 방 입장 시 플레이어 입장에 따라 번호 부여<br>
       게임 방장 표시 UI 연결 작업 <br>
       게임 중 밤, 낮 진입 시 배경화면, 타이머 UI 조건부 랜더링 작업 <br>
       Socket.io 앙방향 통신 타이머 작업 <br>
       게임 종료 시 랭킹 페이지 점수 산정<br>
       마피아 게임 페이지 뒤로가기 및 페이지 새로고침 작업 <br>
       <br>
       <strong><em>** 전체 페이지 **</em></strong> <br> 
       Zustand 전역상태 관리 및 최적화<br>
       커스텀 훅 변경 <br>
       최적화 및 리팩토링 작업 <br>
      <br>
    </td>
  </tr>
  <tr>
    <td>안주원</td>
     <td align="center">
      <br>
      <strong><em>** 랭킹 페이지 **</em></strong> <br> 
      ISR 방식의 랭킹 페이지 구현 <br>
      Pagenation - 재사용성을 위한 페이지네이션 컴포넌트 분리 및 생성 <br>
      <br>
      <strong><em>** INTRO 페이지 **</em></strong> <br> 
      인트로페이지 제작 및 UI/UX 향상을 위한 Video 작업<br>
      UX를 위한 로딩 전 이미지 삽입 <br>
      <br>
      <strong><em>** 메인 페이지 **</em></strong> <br> 
      메인페이지 방 만들기 리스트 구현<br>
      메인페이지 방 만들기 버튼 모달창 구현<br>
      <br>
      전체페이지 메타데이터 삽입 <br>
      <br>
    </td>
  </tr>
</table>

<br>
<br>
<br>

## 기능 미리보기

<table>
  <tr>
    <th>페이지 명</th>
    <th>페이지 및 기능</th>
    <th>설명</th>
  </tr>
  <tr>
    <td align="center">Intro 페이지</td>
    <td>
      <img src="https://github.com/user-attachments/assets/ca0beb74-0da4-4e38-a89c-5ab093fdc210" alt="intro page">
    </td>
    <td>
      - Video 삽입 <br>
      - TextTyping으로 UX경험 향상 <br>
      - Video 로딩 전 이미지 삽입 <br>
    </td>
  </tr>
  <tr>
    <td align="center">메인 페이지</td>
    <td>
      <img src="https://github.com/user-attachments/assets/4b12a07c-5c91-4bab-9ba9-cffc877ae52f" alt="main page"> <br>
      <img src="https://github.com/user-attachments/assets/de147326-1a28-4e15-a17a-9f9f7828c731" alt="main page"> <br>
      <img src="https://github.com/user-attachments/assets/9b0f73fc-22d2-40ba-ab2f-6870ba712d43" alt="main page">
    </td>
    <td>
      - 방 리스트 검색 <br>
      - GoTopButton 페이지 최상단 이동 <br>
      - TypeBot을 추가하여 QnA설명 <br>
      - 방 입장 전 Loading UI <br>
      - 양방향 통신으로 실시간 방 정보 리스트 구현<br>
      - 공지사항 하루 창 닫기 모달창 구현 <br>
    </td>
  </tr>
  <tr>
    <td align="center">로그인 페이지</td>
    <td>
        <img src="https://github.com/user-attachments/assets/764a7ae7-5dc3-4e61-9794-8cab3e0468b8" alt="login page">
    </td>
    <td>
      - 이메일, 비밀번호 입력 유효성 검사 <br>
      - SNS 로그인 <br>
      - 이메일 저장 기능 <br>
    </td>
  </tr>
  <tr>
    <td align="center">회원가입 페이지</td>
    <td>
        <img src="https://github.com/user-attachments/assets/8ac43af8-9ef9-4933-b9f2-cebb46d9bb73" alt="register page">
    </td>
    <td>
      - 이메일, 비밀번호 입력 유효성 검사 <br>
      - 이메일 중복확인 검사 <br>
      - SNS 로그인 <br>
    </td>
  </tr>
  <tr>
    <td align="center">랭킹 페이지</td>
    <td>
       <img src="https://github.com/user-attachments/assets/a2916a58-7dd8-4cd5-af9b-30b6845bec36" alt="ranking page">
    </td>
    <td>
      - 30분 마다 데이터 갱신 (ISR) <br>
      - 10명씩 Pagenation 다음페이지로 이동 <br>
      - 내 닉네임 리스트 최상위 표시 <br>
    </td>
  </tr>
  <tr>
    <td align="center">마피아 설명 페이지</td>
    <td>
       <img src="https://github.com/user-attachments/assets/4a46b2b2-6c48-4c38-8c7d-0f610d686be4" alt="mafia info page">
    </td>
    <td>
      - 마피아 게임 페이지 설명 <br>
    </td>
  </tr>
  <tr>
    <td align="center">QnA 페이지</td>
    <td>
         <img src="https://github.com/user-attachments/assets/940a7d25-db2e-4bd3-87c2-ff0ba8fc5f3a" alt="qna page">
    </td>
    <td>
      - 유저가 문의 시 관리자 메일로 전송 <br>
    </td>
  </tr>
  <tr>
    <td align="center">not-found 페이지</td>
    <td>
         <img src="https://github.com/user-attachments/assets/0e4aae62-8f0f-4561-b9f2-b58b1a2a0c32" alt="not-found page" width="600">
         <img src="https://github.com/user-attachments/assets/129e3b04-9c9b-4ef6-8be5-673fa05eb11b" alt="not-found page" width="600">
    </td>
    <td>
      - 잘못된 url 경로 접속 시 메인페이지로 유도 <br>
      - 사용자가 캠,마이크 비활성화 시 메인페이지로 유도 <br>
    </td>
  </tr>
  <tr>
    <td align="center">마피아 게임 페이지</td>
    <td>
      <img src="https://github.com/user-attachments/assets/143d1a76-e05b-4195-86e9-1f9e27fcfbd9" alt="mafia game page" width="600">
      <img src="https://github.com/user-attachments/assets/6083bda6-07aa-4912-a95c-9325741a7def" alt="mafia game page" width="600">
      <img src="https://github.com/user-attachments/assets/e8f45396-e548-4b64-abd9-9f3490be2af1" alt="mafia game page" width="600">
      <img src="https://github.com/user-attachments/assets/8fef94c4-b82f-49c1-9610-ccdc0f7f2c27" alt="mafia game page" width="600">
    </td>
    <td>
      - 실시간으로 플레이어들의 ready 여부를 알 수 있습니다. <br>
      - 방장이 게임 시작 버튼을 누르면 게임이 시작 됩니다  <br>
      - 밤과 낮으로 진입 시 배경화면이 변경 됩니다. <br>
      - 게임이 끝나면 폭죽효과와 함께 승리자 닉네임이 표시되며, 게임이 종료됩니다  <br>
    </td>
  </tr>
</table>

<br>
<br>
<br>

##  파일구조
```
📦 
├─ .github
│  ├─ ISSUE_TEMPLATE
│  │  └─ custom.md
│  ├─ pull_request_template.md
│  └─ workflows
│     └─ deploy.yml
├─ .gitignore
├─ .prettierrc
├─ .vscode
│  └─ settings.json
├─ LICENSE
├─ README.md
├─ app
│  ├─ (withGlobalLayout)
│  │  ├─ inquiry
│  │  │  └─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ mafiainfo
│  │  │  └─ page.tsx
│  │  ├─ main
│  │  │  └─ page.tsx
│  │  └─ ranking
│  │     └─ page.tsx
│  ├─ (withoutGlobalLayout)
│  │  ├─ login
│  │  │  └─ page.tsx
│  │  ├─ page.tsx
│  │  ├─ register
│  │  │  └─ page.tsx
│  │  ├─ room
│  │  │  └─ [id]
│  │  │     └─ page.tsx
│  │  └─ sns-login
│  │     └─ page.tsx
│  ├─ favicon.ico
│  ├─ globals.css
│  ├─ layout.tsx
│  ├─ livekit
│  │  └─ get-participant-token
│  │     └─ route.ts
│  └─ not-found.tsx
├─ assets
│  └─ images
│     ├─ Citizens_Card.avif
│     ├─ Doctor_Card.avif
│     ├─ Mafia_Card.avif
│     ├─ Police_Card.avif
│     ├─ arrow_top.svg
│     ├─ arrow_top_hover.svg
│     ├─ bg.avif
│     ├─ cam_check.svg
│     ├─ cam_citizen.svg
│     ├─ cam_doctor.svg
│     ├─ cam_mafia.svg
│     ├─ cam_police.svg
│     ├─ citizen_victory.svg
│     ├─ citizens_ToolTip_Icon.svg
│     ├─ citizens_ToolTip_text.svg
│     ├─ doctor_ToolTip_Icon.svg
│     ├─ doctor_ToolTip_text.svg
│     ├─ error_page.avif
│     ├─ footer_logo.svg
│     ├─ game_choice_mafia.svg
│     ├─ game_choice_mafia_active.svg
│     ├─ game_choice_song.svg
│     ├─ game_choice_song_active.png.svg
│     ├─ icon-github.svg
│     ├─ icon_person.svg
│     ├─ icon_plus.svg
│     ├─ icon_point.svg
│     ├─ icon_search.svg
│     ├─ intro_bg.avif
│     ├─ join_facebook.svg
│     ├─ join_github.svg
│     ├─ join_google.svg
│     ├─ join_kakaotalk.svg
│     ├─ leader.svg
│     ├─ logo.svg
│     ├─ mafia_ToolTip_Icon.svg
│     ├─ mafia_ToolTip_text.svg
│     ├─ mafia_day_bg.avif
│     ├─ mafia_game_title.svg
│     ├─ mafia_info_choosing.svg
│     ├─ mafia_info_citizen.svg
│     ├─ mafia_info_doctor.svg
│     ├─ mafia_info_final.svg
│     ├─ mafia_info_mafia.svg
│     ├─ mafia_info_morning.svg
│     ├─ mafia_info_police.svg
│     ├─ mafia_info_start.svg
│     ├─ mafia_info_title.svg
│     ├─ mafia_info_vote.svg
│     ├─ mafia_item.png
│     ├─ mafia_night_bg.avif
│     ├─ mafia_night_bg2.avif
│     ├─ mafia_room_bg.avif
│     ├─ mafia_victory.svg
│     ├─ mafia_visual.avif
│     ├─ media_error.svg
│     ├─ modal_bg.svg
│     ├─ moon.svg
│     ├─ player_die.svg
│     ├─ police_ToolTip_Icon.svg
│     ├─ police_ToolTip_text.svg
│     ├─ ranking_1.svg
│     ├─ ranking_2.svg
│     ├─ ranking_3.svg
│     ├─ ranking_arrow_left.svg
│     ├─ ranking_arrow_right.svg
│     ├─ ranking_empty.svg
│     ├─ song_game_title.svg
│     ├─ song_visual.avif
│     ├─ sorry_image.avif
│     ├─ sun.svg
│     └─ visit_empty.svg
├─ build.sh
├─ components
│  ├─ layout
│  │  ├─ Footer.tsx
│  │  ├─ Header.tsx
│  │  ├─ Loading.tsx
│  │  └─ Nav.tsx
│  ├─ logIn
│  │  └─ ErrorMessage.tsx
│  ├─ mafia
│  │  ├─ GameStartButton.tsx
│  │  ├─ JoinMafiaRoom.tsx
│  │  ├─ LocalParticipant.tsx
│  │  ├─ MafiaHeader.tsx
│  │  ├─ MafiaModals.tsx
│  │  ├─ MafiaPlayRooms.tsx
│  │  ├─ MafiaToolTip.tsx
│  │  ├─ RemoteParticipant.tsx
│  │  ├─ RemoteParticipantTile.tsx
│  │  ├─ RenderCards.tsx
│  │  └─ SpeakTimer.tsx
│  ├─ mafiaInfo
│  │  ├─ InfoItem.tsx
│  │  └─ InfoTitle.tsx
│  ├─ main
│  │  ├─ CreateRoomModal.tsx
│  │  ├─ MainCreateRoom.tsx
│  │  ├─ MainSkeleton.tsx
│  │  ├─ MainVisual.tsx
│  │  ├─ RoomList.tsx
│  │  └─ RoomListItem.tsx
│  ├─ modal
│  │  ├─ CheckModal.tsx
│  │  ├─ GroupMafiaModal.tsx
│  │  ├─ LastVoteResultModal.tsx
│  │  ├─ UserRoleModal.tsx
│  │  ├─ VictoryModal.tsx
│  │  └─ VoteResultModal.tsx
│  ├─ ranking
│  │  ├─ MyRanking.tsx
│  │  └─ Pagination.tsx
│  └─ register
│     ├─ InputMessage.tsx
│     └─ RegisterButton.tsx
├─ hooks
│  ├─ useBeforeUnloadHandler.ts
│  ├─ useClickHandler.ts
│  ├─ useCountDown.ts
│  ├─ useGetRoomsSocket.ts
│  ├─ useJoinRoom.ts
│  ├─ useJoinRoomSocket.ts
│  ├─ useMediaDevice.ts
│  ├─ usePlayerNumber.ts
│  ├─ usePopStateHandler.ts
│  ├─ useSearchDebounce.ts
│  ├─ useSelectSocket.ts
│  └─ useSocketOn.ts
├─ middleware.ts
├─ next.config.js
├─ package-lock.json
├─ package.json
├─ postcss.config.js
├─ public
│  └─ fonts
│     ├─ Designer.otf
│     ├─ Pretendard-Bold.woff
│     ├─ Pretendard-Regular.woff
│     ├─ PretendardVariable.otf
│     └─ fonts.ts
├─ store
│  ├─ connect-store.ts
│  ├─ game-store.ts
│  ├─ loading-store.ts
│  ├─ overlay-store.ts
│  ├─ room-store.ts
│  └─ show-modal-store.ts
├─ style
│  ├─ Intropage
│  │  └─ intro.module.css
│  ├─ commons
│  │  └─ commons.module.css
│  ├─ livekit
│  │  └─ livekit.module.css
│  ├─ login
│  │  └─ login.module.css
│  ├─ mafiaInfo
│  │  └─ mafiaInfo.module.css
│  ├─ mainpage
│  │  ├─ main.module.css
│  │  └─ swiper.css
│  ├─ modal
│  │  └─ modal.module.css
│  ├─ ranking
│  │  └─ ranking.module.css
│  └─ register
│     └─ register.module.css
├─ tailwind.config.js
├─ tsconfig.json
├─ types
│  ├─ index.ts
│  └─ supabase.ts
├─ utils
│  ├─ CommonsLoading.tsx
│  ├─ FormSearch.tsx
│  ├─ GoTopButton.tsx
│  ├─ GoogleTracker.tsx
│  ├─ InfoChat.tsx
│  ├─ ModalConfetti.tsx
│  ├─ ModalProgress.tsx
│  ├─ Popup.tsx
│  ├─ TextTyping.tsx
│  ├─ goBack
│  │  └─ goBackHandler.ts
│  ├─ livekit
│  │  └─ liveKitApi.ts
│  ├─ mafia
│  │  ├─ getPlayerJob.ts
│  │  └─ getPlayersNumber.ts
│  ├─ socket
│  │  └─ socket.ts
│  └─ supabase
│     ├─ accountAPI.ts
│     ├─ authAPI.ts
│     ├─ client.ts
│     ├─ middleware.ts
│     ├─ rankingAPI.ts
│     ├─ roomAPI.ts
│     └─ server.ts
└─ yarn.lock
```
