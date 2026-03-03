import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// import { authTest } from '.';
import { saveStorageState } from './util.js';

/**
 * ✅ 로그인 함수 (동적으로 사용자 정보를 받아 로그인 가능)
 */
export async function login(page: Page, username: string, password: string) {
  await page.goto('/ko/login');

  await page.getByPlaceholder('ID').fill(username);
  await page.getByPlaceholder(/비밀번호|Password/).fill(password);
  await page.getByRole('button', { name: /로그인|Sign in/ }).click();

  // 로그인 성공 여부 확인
  await page.waitForURL(/\/screening\/screened/);
}

/**
 * ✅ 로그아웃 함수
 */
export async function logout(page: Page, username: string) {
  console.log(`🔹 ${username} 로그아웃 중...`);

  await page.getByRole('button', { name: `${username} dropdown-arrow` }).click();
  await page.getByText('로그아웃').click();

  console.log('✅ 로그아웃 완료!');
}

/**
 * ✅ 인증을 위한 fixture
 */
async function authPage({ page }: { page: Page }, use: (r: Page) => Promise<void>) {
  // 현재 시간과 랜덤 문자열을 조합하여 고유한 세션 ID 생성 -> 여러 워커에서 file 생성 시 충돌 방지.
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2);
  const sessionId = `${timestamp}-${random}`;
  // const fileName = path.resolve(authTest.info().project.outputDir, `.auth/${sessionId}.json`);

  // await fs.promises.mkdir(path.dirname(fileName), { recursive: true });

  // // 이전 인증 정보가 있으면 로그인 생략, 기존 인증 세션 사용
  // if (fs.existsSync(fileName)) {
  //   await saveStorageState(page, fileName, use);
  //   return;
  // }

  // // 기본 로그인 정보
  // await login(page, 'nora01', 'aitrics1!');
  // await saveStorageState(page, fileName, use);
}

export default authPage;
