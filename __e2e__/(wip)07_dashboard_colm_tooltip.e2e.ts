import { expect, authTest as test } from '../playwright/fixture/index.js';

test('대시보드 컬럼 툴팁 확인', async ({
  authPage: page,
  getRegExForClassList,
}) => {
  // await page.goto('/ko/screening/dismissed');

  await page.getByRole('link', { name: 'Dismissed' }).click();

  // 활성화 상태인 탭은 border-b-[2px], border-brandBlue, text-brandBlue 클래스를 가지고 있어야 한다.
  const tab = page.getByRole('tab', { name: 'Dismissed' });
  const regex = getRegExForClassList(['border-b-[2px]', 'border-brandBlue', 'text-brandBlue']);

  await expect(tab).toHaveClass(regex);
  await expect(page.getByRole('tabpanel')).toContainText(
    'Status가 Dismissed일 경우, 새로운 알람이 감지되어도 Screened에서 조회되지 않습니다. 지속적인 모니터링을 원하시면 Status를 변경해주세요.'
  );

  await page.waitForTimeout(parseInt(process.env.SLOW_MO || '5000')); //5초 대기
  const column = page.getByRole('button', { name: 'CAPS' });
  await column.hover();

  const cellLocator = page.getByText('시간 이내에 일반병동에서의 심정지 발생 위험도 예측 스코어 (CAPS ≥ 39)24');

  await cellLocator.waitFor(); // 요소가 준비될 때까지 대기

  await expect(cellLocator).toContainText('24시간 이내에 일반병동에서의 심정지 발생 위험도 예측 스코어 (CAPS ≥ 39)');

});