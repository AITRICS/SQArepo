/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs/promises');
const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv');

const NEXT_DIST_DIR = '.next_e2e';
const VC_FRONTEND_DIR = path.join(__dirname, '../');
const NEXT_DIR = path.join(VC_FRONTEND_DIR, NEXT_DIST_DIR);
const PUBLIC_DIR = path.join(VC_FRONTEND_DIR, 'public');
const STANDALONE_DIR = path.join(__dirname, './e2e-standalone-app');
const STANDALONE_FRONTEND_DIR = path.join(STANDALONE_DIR, 'apps/vc-frontend');
const STANDALONE_NEXT_DIR = path.join(STANDALONE_FRONTEND_DIR, NEXT_DIST_DIR);
const STANDALONE_STATIC_DIR = path.join(STANDALONE_NEXT_DIR, 'static');
const STANDALONE_PUBLIC_DIR = path.join(STANDALONE_DIR, 'apps/vc-frontend/public'); // standalone public 디렉토리 경로 추가
const PLAYWRIGHT_ENV = path.join(__dirname, './.env.playwright');

async function setupStandalone() {
  try {
    // 디렉토리 초기화
    console.log('Cleaning up directories...');
    await fs.rm(STANDALONE_DIR, {
      recursive: true,
      force: true,
    });

    // 환경 변수 로드
    console.log('Loading playwright environment variables...');

    const envConfig = dotenv.config({ path: PLAYWRIGHT_ENV });

    if (envConfig.error) {
      throw new Error('Error loading .env.playwright file');
    }

    // Next.js 빌드 실행 (환경 변수와 함께)
    console.log('Building Next.js app with test environment...');
    execSync('pnpm next build', {
      cwd: VC_FRONTEND_DIR,
      stdio: 'inherit',
      env: {
        ...process.env,
        // .env.playwright 파일의 내용을 빌드 환경에 주입
        ...dotenv.config({ path: PLAYWRIGHT_ENV }).parsed,
        E2E_TEST: 'true',
        NODE_ENV: 'production',
        NEXT_DIST_DIR,
      },
    });

    // Next.js standalone 빌드 복사
    console.log('Copying standalone build...');
    await fs.cp(path.join(NEXT_DIR, 'standalone'), STANDALONE_DIR, {
      recursive: true,
    });

    // static 파일 복사
    console.log('Copying static directory...');
    await fs.mkdir(STANDALONE_STATIC_DIR, {
      recursive: true,
    });
    await fs.cp(path.join(NEXT_DIR, 'static'), STANDALONE_STATIC_DIR, {
      recursive: true,
    });

    // public 디렉토리 복사
    console.log('Copying public directory...');
    await fs.mkdir(STANDALONE_PUBLIC_DIR, {
      recursive: true,
    });
    await fs.cp(PUBLIC_DIR, STANDALONE_PUBLIC_DIR, {
      recursive: true,
    });

    // BUILD_ID 복사
    await fs.copyFile(path.join(NEXT_DIR, 'BUILD_ID'), path.join(STANDALONE_NEXT_DIR, 'BUILD_ID'));

    // package.json 생성
    console.log('Creating package.json...');
    const startEnv = [
      'PORT=3000',
      'HOST=0.0.0.0',
      'E2E_TEST=true',
      'NODE_OPTIONS=--inspect=9229',
      'NODE_ENV=production',
    ].join(' ');
    const packageJson = {
      name: 'standalone-app',
      private: true,
      dependencies: {
        next: '^14.0.0',
        react: '^18.2.0',
        'react-dom': '^18.2.0',
      },
      devDependencies: {
        'cross-env': '^7.0.3',
      },
      scripts: {
        start: `cross-env ${startEnv} node ./apps/vc-frontend/server.js`,
      },
    };

    await fs.writeFile(path.join(STANDALONE_DIR, 'package.json'), JSON.stringify(packageJson, null, 2));

    // 의존성 설치
    console.log('Installing dependencies...');
    execSync('pnpm install', {
      cwd: STANDALONE_DIR,
      stdio: 'inherit',
    });
    /*
      pnpm+turborepo 사용할 때 일부 의존성이 설치 안되는 문제가 있는 것 같아 따로 설치.
      참고 -> https://github.com/pnpm/pnpm/issues/5716#issuecomment-2420390343
    */
    execSync('pnpm install -D cross-env', {
      cwd: STANDALONE_DIR,
      stdio: 'inherit',
    });

    console.log('Standalone app setup completed successfully!');
  } catch (error) {
    console.error('Error setting up standalone app:', error);
    process.exit(1);
  }
}

setupStandalone().then(() => {
  console.log('Setup completed successfully!');
});