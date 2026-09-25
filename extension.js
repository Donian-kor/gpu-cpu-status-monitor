const vscode = require('vscode');
const os = require('os');
const { exec } = require('child_process');

let statusBarItem;
let intervalHandle;

/**
 * CPU 코어들의 idle/total 시간 합계를 구한다.
 */
function cpuSnapshot() {
  const cpus = os.cpus();
  let idle = 0;
  let total = 0;
  for (const cpu of cpus) {
    for (const type in cpu.times) {
      total += cpu.times[type];
    }
    idle += cpu.times.idle;
  }
  return { idle, total };
}

/**
 * 200ms 간격으로 두 번 스냅샷을 찍어 CPU 사용률(%)을 계산한다.
 */
function getCpuUsage() {
  return new Promise((resolve) => {
    const start = cpuSnapshot();
    setTimeout(() => {
      const end = cpuSnapshot();
      const idleDiff = end.idle - start.idle;
      const totalDiff = end.total - start.total;
      const usage = totalDiff === 0 ? 0 : Math.round(100 - (idleDiff / totalDiff) * 100);
      resolve(Math.max(0, Math.min(100, usage)));
    }, 200);
  });
}

/**
 * nvidia-smi를 호출해 GPU 사용률, VRAM 사용량, 온도를 가져온다.
 */
function getGpuStats(nvidiaSmiPath) {
  return new Promise((resolve) => {
    const cmd = `"${nvidiaSmiPath}" --query-gpu=utilization.gpu,memory.used,memory.total,temperature.gpu --format=csv,noheader,nounits`;
    exec(cmd, { timeout: 3000 }, (err, stdout) => {
      if (err || !stdout) {
        resolve(null);
        return;
      }
      const parts = stdout.trim().split(',').map((s) => s.trim());
      if (parts.length < 4 || parts.some((p) => isNaN(Number(p)))) {
        resolve(null);
        return;
      }
      const [gpuUtil, memUsed, memTotal, temp] = parts.map(Number);
      resolve({ gpuUtil, memUsed, memTotal, temp });
    });
  });
}

async function updateStatusBar() {
  const config = vscode.workspace.getConfiguration('gpuCpuMonitor');
  const nvidiaSmiPath = config.get('nvidiaSmiPath') || 'nvidia-smi';

  const [cpuUsage, gpuStats] = await Promise.all([
    getCpuUsage(),
    getGpuStats(nvidiaSmiPath)
  ]);

  let text = `$(pulse) CPU ${cpuUsage}%`;

  if (gpuStats) {
    const vramPercent =
      gpuStats.memTotal > 0 ? Math.round((gpuStats.memUsed / gpuStats.memTotal) * 100) : 0;
    text += ` | GPU ${gpuStats.gpuUtil}% | ${gpuStats.temp}°C | VRAM ${gpuStats.memUsed}/${gpuStats.memTotal}MB (${vramPercent}%)`;
    statusBarItem.tooltip = 'CPU / NVIDIA GPU 사용량 — 클릭하면 즉시 새로고침';
  } else {
    text += ' | GPU: nvidia-smi 실행 실패';
    statusBarItem.tooltip =
      'nvidia-smi를 찾을 수 없습니다. 설정(gpuCpuMonitor.nvidiaSmiPath)에서 경로를 확인하세요.';
  }

  statusBarItem.text = text;
}

function startInterval(ms) {
  if (intervalHandle) clearInterval(intervalHandle);
  intervalHandle = setInterval(updateStatusBar, ms);
}

function activate(context) {
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'gpuCpuMonitor.refresh';
  statusBarItem.text = '$(pulse) 로딩 중...';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  context.subscriptions.push(
    vscode.commands.registerCommand('gpuCpuMonitor.refresh', updateStatusBar)
  );

  const config = vscode.workspace.getConfiguration('gpuCpuMonitor');
  startInterval(config.get('updateInterval') || 2000);
  updateStatusBar();

  context.subscriptions.push({
    dispose: () => {
      if (intervalHandle) clearInterval(intervalHandle);
    }
  });

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('gpuCpuMonitor.updateInterval')) {
        const newConfig = vscode.workspace.getConfiguration('gpuCpuMonitor');
        startInterval(newConfig.get('updateInterval') || 2000);
      }
    })
  );
}

function deactivate() {
  if (intervalHandle) clearInterval(intervalHandle);
}

module.exports = { activate, deactivate };
