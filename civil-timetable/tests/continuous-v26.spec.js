const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto('/civil-timetable/app-v25.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#appBootV25')).toBeHidden({ timeout: 30_000 });
});

test('복습 날짜 없이 3일 주기로 계속 순환한다', async ({ page }) => {
  const plans = await page.evaluate(() => {
    const start = date(S.startDate);
    return [0, 1, 2, 3, 4, 5].map(offset => {
      const d = add(start, offset);
      const plan = scheduledForDate(d);
      return { cycle: plan.cycle, review: plan.review, total: plan.items.reduce((sum, item) => sum + item.tasks.length, 0) };
    });
  });

  expect(plans.map(plan => plan.cycle)).toEqual([0, 1, 2, 0, 1, 2]);
  expect(plans.every(plan => plan.review === false)).toBe(true);
});

test('모든 필기·실기 과목의 하루 강의 수가 4강으로 고정된다', async ({ page }) => {
  const values = await page.evaluate(() => ({
    written: S.subjects.map(subject => subject.per),
    practical: S.practicalSubjects.map(subject => subject.per),
  }));

  expect(values.written.every(value => value === 4)).toBe(true);
  expect(values.practical.every(value => value === 4)).toBe(true);

  await page.locator('.nav button[data-v="settings"]').click();
  const perSelects = page.locator('[data-f="per"]');
  expect(await perSelects.count()).toBeGreaterThan(0);
  for (let index = 0; index < await perSelects.count(); index++) {
    await expect(perSelects.nth(index)).toHaveValue('4');
    await expect(perSelects.nth(index)).toBeDisabled();
  }
});

test('같은 날 과목 하나가 끝나면 남은 과목으로 4강 자리를 채운다', async ({ page }) => {
  const result = await page.evaluate(() => {
    const first = S.subjects.find(subject => subject.day === 0);
    const today = new Date();
    const studyDate = iso(today);
    writtenTasks(first).forEach(task => {
      S.checks[taskKey(first, task)] = { checkedAt: new Date().toISOString(), studyDate };
    });
    save();

    const cycleZeroDate = (() => {
      let d = new Date(Math.max(date(S.startDate).getTime(), today.getTime()));
      d = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      while (isSkipped(d) || writtenCycle(d) !== 0) d = add(d, 1);
      return d;
    })();

    const plan = scheduledForDate(cycleZeroDate);
    return {
      completedSubject: first.id,
      ids: plan.items.map(item => item.s.id),
      total: plan.items.reduce((sum, item) => sum + item.tasks.length, 0),
      counts: Object.fromEntries(plan.items.map(item => [item.s.id, item.tasks.length])),
    };
  });

  expect(result.ids).not.toContain(result.completedSubject);
  expect(result.total).toBe(8);
  expect(Object.values(result.counts).reduce((sum, count) => sum + count, 0)).toBe(8);
});

test('달력에 복습 이벤트가 나타나지 않는다', async ({ page }) => {
  await page.locator('.nav button[data-v="schedule"]').click();
  await page.locator('#scheduleDays').selectOption('64');
  await page.locator('#showSchedule').click();
  await expect(page.locator('.month-calendar').first()).toBeVisible();
  await expect(page.locator('.calendar-event.review')).toHaveCount(0);
  await expect(page.locator('.calendar-legend span', { hasText: '복습' })).toHaveCount(0);
});
