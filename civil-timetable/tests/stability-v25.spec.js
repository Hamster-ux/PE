const { test, expect } = require('@playwright/test');

async function openStableApp(page, options = {}) {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  if (options.slowScripts) {
    await page.route('**/*.js*', async route => {
      await new Promise(resolve => setTimeout(resolve, 140));
      await route.continue();
    });
  }

  await page.goto('/civil-timetable/app-v25.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#appBootV25')).toBeHidden({ timeout: 30_000 });
  await expect(page.locator('.hero')).toBeVisible();
  await expect(page.locator('#today')).toHaveClass(/on/);
  return pageErrors;
}

async function selectStudyDate(page, value = '2026-07-01') {
  await page.locator('#selectedDate').evaluate((element, dateValue) => {
    element.value = dateValue;
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
  await expect(page.locator('#todayDate')).not.toHaveText('');
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem('civilTestInitialized') !== '1') {
      localStorage.clear();
      sessionStorage.clear();
      sessionStorage.setItem('civilTestInitialized', '1');
    }
  });
});

test('앱 첫 실행과 모든 하단 탭이 아이폰 WebKit에서 열린다', async ({ page }) => {
  const errors = await openStableApp(page);

  const tabs = [
    ['schedule', '#schedule'],
    ['records', '#records'],
    ['settings', '#settings'],
    ['today', '#today'],
  ];

  for (const [name, selector] of tabs) {
    await page.locator(`.nav button[data-v="${name}"]`).click();
    await expect(page.locator(selector)).toHaveClass(/on/);
  }

  expect(errors).toEqual([]);
});

test('강의 체크가 새로고침 뒤에도 유지된다', async ({ page }) => {
  const errors = await openStableApp(page);
  await selectStudyDate(page);

  const firstCheck = page.locator('.check').first();
  await expect(firstCheck).toBeVisible();
  await firstCheck.click();
  await expect(firstCheck).toHaveClass(/on/);

  const savedBeforeReload = await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem('civilPlannerWeb1') || '{}');
    return Object.keys(saved.checks || {}).length;
  });
  expect(savedBeforeReload).toBeGreaterThan(0);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#appBootV25')).toBeHidden({ timeout: 30_000 });
  await selectStudyDate(page);
  await expect(page.locator('.check').first()).toHaveClass(/on/);
  expect(errors).toEqual([]);
});

test('365일 달력이 지연 렌더링되고 마지막 달까지 스크롤된다', async ({ page }) => {
  const errors = await openStableApp(page);
  await page.locator('.nav button[data-v="schedule"]').click();
  await page.locator('#scheduleDays').selectOption('365');
  await page.locator('#showSchedule').click();

  const months = page.locator('.month-calendar');
  await expect(months.first()).toBeVisible();
  expect(await months.count()).toBeGreaterThanOrEqual(12);

  const lastMonth = months.last();
  await lastMonth.scrollIntoViewIfNeeded();
  await expect(lastMonth.locator('.calendar-loading')).toHaveCount(0, { timeout: 30_000 });
  expect(await lastMonth.locator('.calendar-day:not(.empty)').count()).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('설정 화면에 백업, 알림, 홈 화면 안내, 상태 점검이 모두 보인다', async ({ page }) => {
  const errors = await openStableApp(page);
  await page.locator('.nav button[data-v="settings"]').click();

  await expect(page.locator('#autoBackupCardV25')).toBeVisible();
  await expect(page.locator('#notificationSettingsV25')).toBeVisible();
  await expect(page.locator('#homeInstallCardV24')).toBeVisible();
  await expect(page.locator('#healthCardV25')).toBeVisible();

  page.once('dialog', dialog => dialog.accept());
  await page.locator('#backupNowV25').click();
  const backupCount = await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem('civilPlannerAutoBackupsV25') || '[]');
    return saved.length;
  });
  expect(backupCount).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('다크모드에서 주요 글씨와 배경의 대비가 유지된다', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  const errors = await openStableApp(page);

  const colors = await page.locator('body').evaluate(element => {
    const style = getComputedStyle(element);
    return { color: style.color, backgroundColor: style.backgroundColor };
  });
  expect(colors.color).not.toBe(colors.backgroundColor);

  const riskTitle = page.locator('#examRiskCardV25 h2');
  await expect(riskTitle).toBeVisible();
  const riskColors = await riskTitle.evaluate(element => {
    const style = getComputedStyle(element);
    const card = getComputedStyle(element.closest('.risk-card'));
    return { color: style.color, backgroundColor: card.backgroundColor };
  });
  expect(riskColors.color).not.toBe(riskColors.backgroundColor);
  expect(errors).toEqual([]);
});

test('느린 네트워크처럼 스크립트가 늦게 와도 흰 화면 없이 열린다', async ({ page }) => {
  const errors = await openStableApp(page, { slowScripts: true });
  await expect(page.locator('#todayContent')).toBeVisible();
  await expect(page.locator('.nav')).toBeVisible();
  expect(errors).toEqual([]);
});
