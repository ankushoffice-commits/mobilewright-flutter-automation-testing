import { test, expect } from '@mobilewright/test';
import * as dotenv from 'dotenv';
import data from './testdata/data.json';
import { exec } from 'child_process';
import { promisify } from 'util';

dotenv.config();


test.beforeAll('Grant permissions and notifications', async () => {
  await clearAppData("com.xpedeon.xpedeonapprovals");
  console.log('✅ App data cleared successfully');
  await grantPermissions("com.xpedeon.xpedeonapprovals");
  console.log('✅ Permissions granted successfully');
});




test('app launches and shows home screen', async ({ screen, device }) => {
  await expect(screen.getByTestId('next_button')).toBeVisible({ timeout: 20_000 });
});

test('try to sign up into the app', async ({ screen, device }) => {
    
//   await expect(await screen.getByText('Skip')).toBeVisible({ timeout: 20_000 });
  await screen.getByTestId('next_button').tap({timeout: 20_000})
  await screen.getByTestId('next_button').tap()
  await screen.getByTestId('get_started_button').tap()

  await screen.getByTestId('signup_username_textfield').fill(data.user_name)
  await screen.getByTestId('signup_password_textfield').fill(data.password)
  await screen.getByTestId('signup_email_textfield').fill(data.email)
  await screen.getByTestId('signup_server_textfield').fill(data.server)

  await screen.getByTestId('app_checkbox').tap()
  await screen.getByTestId('signup_submit_button').tap()

  await expect(screen.getByTestId('signup_submit_button')).not.toBeVisible();

    // await(!(await screen.getByText('Later').isVisible() || await screen.getByText('Dashboard'))) ? await screen.getByText('Later').tap() : await screen.getByText('Dashboard').tap()

    // if(await screen.getByText('Later').isVisible()){
    //   await screen.getByText('Later').tap()
    // } else {
    //   await screen.getByText('Dashboards').tap()
    // }
});

test('try to text search into the app', async ({ screen, device }) => {

    if(await screen.getByText('Later').isVisible()) {
    await screen.getByText('Later').tap()
  }

  // 7. Check whether user is able to send text in app search field
  await screen.getByTestId('app_search_text_field').fill('Automation1')

  await expect(screen.getByTestId('approval_list_card')).toContainText('Automation1')

  await expect(screen.getByTestId('app_search_text_field')).not.toBeEmpty()


});

test('get text while scrolling', async ({ screen, device }) => {

    const doc
    = new Set<string>();
    for(let j=0; j<1000; j++) {
        await screen.swipe('up', { distance: j, duration: 500 })

        j=100

        const elements = await screen.getByTestId('approval_list_card_document_value').all()

        await Promise.all(elements.map(async (element) => {
            const text = await element.getText() ?? '';
            doc.add(text);
        }));
    }

    await Promise.all([...doc].map(async (text) => {
        console.log(text);
    }));
});

test('scroll to the bottom of the list', async ({ screen, device }) => {

  if(await screen.getByText('Later').isVisible()) {
    await screen.getByText('Later').tap();
  }

  let daysCountFirst = await screen.getByTestId('approval_list_card_days_count').nth(1).getText() ?? ''

  // 8. Scroll to the bottom of the list
  await screen.swipe('up', { distance: 10000, duration: 5000 })

  let daysCountLast = await screen.getByTestId('approval_list_card_days_count').nth(1).getText() ?? ''

  let daysCountFirstNum: number = parseInt(daysCountFirst, 10)
  let daysCountLastNum: number = parseInt(daysCountLast, 10)

  // console.log('Days count at the top:', daysCountFirstNum)
  // console.log('Days count at the bottom:', daysCountLastNum)

  await expect(daysCountFirstNum).toBeGreaterThanOrEqual(daysCountLastNum)

});







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


test.afterEach('reset app data', async ({ screen, device }) => {
  await device.terminateApp("com.xpedeon.xpedeonapprovals")
  
});

test.afterAll('get tree', async ({ screen, device }) => {
  await clearAppData("com.xpedeon.xpedeonapprovals");
  console.log('✅ App data cleared successfully');
  await grantPermissions("com.xpedeon.xpedeonapprovals");
  console.log('✅ Permissions granted successfully');
});