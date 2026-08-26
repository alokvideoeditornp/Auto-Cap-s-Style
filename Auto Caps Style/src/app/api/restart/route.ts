import { NextResponse } from 'next/server';
import { exec } from 'child_process';

export async function POST() {
  try {
    setTimeout(() => {
      if (process.platform === 'win32') {
        const killCmd = `powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'AutoCapStyle_Core.py' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }; Stop-Process -Name node -Force -ErrorAction SilentlyContinue"`;
        exec(killCmd, () => {
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    }, 400);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
