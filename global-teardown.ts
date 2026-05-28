import { test, expect } from '@mobilewright/test';

import { exec } from 'child_process';
import { promisify } from 'util';

async ()=> {
await clearAppData("com.xpedeon.xpedeonapprovals");
  console.log('✅ App data cleared successfully');
  await grantPermissions("com.xpedeon.xpedeonapprovals");
  console.log('✅ Permissions granted successfully');
}

function runAdb(command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(`adb ${command}`, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${stderr || error.message}`);
        return;
      }
      console.log(stdout);
      resolve();
    });
  });
}

async function grantPermissions(packageName: string) {
  try {
    // Notification (Android 13+)
    await runAdb(`shell pm grant ${packageName} android.permission.POST_NOTIFICATIONS`);
    // Microphone
    await runAdb(`shell pm grant ${packageName} android.permission.RECORD_AUDIO`);

    // Location
    await runAdb(`shell pm grant ${packageName} android.permission.ACCESS_FINE_LOCATION`);
    await runAdb(`shell pm grant ${packageName} android.permission.ACCESS_COARSE_LOCATION`);


    await runAdb(`adb shell dpm set-permission-policy 1`);

    console.log("All permissions granted successfully");
  } catch (err) {
    console.error("Failed:", err);
  }
}

const execAsync = promisify(exec);

async function clearAppData(packageName: string): Promise<void> {
  try {
    const { stdout } = await execAsync(
      `adb shell pm clear ${packageName}`
    );

    console.log(`✅ ${stdout.trim()}`);
  } catch (error: any) {
    console.error(
      `❌ Failed to clear app data for ${packageName}`
    );

    console.error(error.message);
  }
}
