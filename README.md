# GPU/CPU Status Monitor

VS Code 상태바(하단 오른쪽)에 아래 정보를 실시간으로 표시합니다.

- CPU 사용률 (%)
- RAM 사용률 (%) — 상태바 마우스 오버 시 현재/최대 용량 표시
- GPU 사용률 (%) — NVIDIA GPU, `nvidia-smi` 사용
- GPU 온도 (°C)
- VRAM 사용량 (현재/최대 MB, %)

## 사전 조건

- NVIDIA 드라이버가 설치되어 있어야 합니다 (RTX 5060이면 보통 이미 설치되어 있습니다).
- `nvidia-smi` 명령어가 실행 가능해야 합니다. 윈도우 명령 프롬프트(cmd)에서 `nvidia-smi`를 쳤을 때
  표가 나오면 정상입니다. 만약 "명령을 찾을 수 없음" 오류가 나면 아래 "GPU 정보가 안 나올 때"를 참고하세요.

## 설치 방법 (가장 쉬운 방법 — 빌드 없이 바로 실행)

1. 압축을 풀어서 나온 `gpu-cpu-status-monitor` 폴더를 원하는 위치에 둡니다.
   (예: `C:\Users\사용자명\vscode-extensions\gpu-cpu-status-monitor`)
2. VS Code를 열고 `파일 > 폴더 열기`로 이 폴더를 엽니다.
3. 키보드에서 **F5**를 누릅니다. (또는 좌측 "실행 및 디버그" 탭 → "실행" 버튼)
4. "확장 개발 호스트(Extension Development Host)"라는 새 VS Code 창이 뜹니다.
   이 새 창의 상태바 오른쪽에 CPU/RAM/GPU 정보가 표시됩니다.

이 방법은 npm install이나 별도 빌드 과정 없이 바로 됩니다. 다만 이 방식은
"디버그 실행"이라서, 그 새 창을 닫으면 확장도 꺼집니다. 평소에 VS Code를 켤 때마다
자동으로 켜지길 원하면 아래 "상시 설치" 방법을 사용하세요.

## 상시 설치 방법 (.vsix로 패키징해서 평소 VS Code에 설치)

1. Node.js가 설치되어 있어야 합니다 (없다면 nodejs.org에서 설치).
2. 터미널(명령 프롬프트)에서 아래 명령으로 패키징 도구를 설치합니다.
   ```
   npm install -g @vscode/vsce
   ```
3. 이 폴더로 이동한 뒤 패키징합니다.
   ```
   cd 경로/gpu-cpu-status-monitor
   vsce package
   ```
   같은 폴더에 `gpu-cpu-status-monitor-0.1.0.vsix` 파일이 생깁니다.
4. VS Code에서 좌측 확장(Extensions) 탭 → 우측 상단 `...` 메뉴 →
   `VSIX에서 설치...(Install from VSIX...)` 선택 후 방금 만든 파일을 선택합니다.
5. VS Code를 재시작하면 상태바에 항상 표시됩니다.

## 설정 변경

VS Code 설정(Ctrl+,)에서 `gpuCpuMonitor`로 검색하면 아래 항목을 바꿀 수 있습니다.

- `gpuCpuMonitor.updateInterval`: 업데이트 주기(기본 2000ms = 2초)
- `gpuCpuMonitor.nvidiaSmiPath`: nvidia-smi 실행 파일 경로

## GPU 정보가 안 나올 때 ("nvidia-smi 실행 실패"로 표시될 때)

윈도우 기준 `nvidia-smi.exe`는 보통 아래 경로에 있습니다.

```
C:\Windows\System32\nvidia-smi.exe
```

VS Code 설정에서 `gpuCpuMonitor.nvidiaSmiPath` 값을 위 전체 경로로 바꿔보세요.
