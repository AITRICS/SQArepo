import type { Page, TestInfo } from "@playwright/test";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import mysql from "mysql2/promise";
import "dotenv/config";
import { ADMIN_ID, ADMIN_PASSWORD, MANAGER_ID, MANAGER_PASSWORD, ADMIN_URL, ADMIN_PAGE_ID, ADMIN_PAGE_PASSWORD } from "./config";
//스크린샷 함수
function sanitize(name: string) {
  return name.replace(/[\\\/:*?"<>|]/g, "_").replace(/\s+/g, " ").trim();
}
export async function shot(page: Page, testInfo: TestInfo, name: string) {
  const safe = sanitize(name);
  const tmpPath = path.join(os.tmpdir(), `${Date.now()}_${safe}.png`);
  await page.screenshot({ path: tmpPath, fullPage: true });
  await testInfo.attach(`${safe}.png`, {
    path: tmpPath,
    contentType: "image/png",
  });
  try { fs.unlinkSync(tmpPath); } catch {}
}


//user생성 함수
export type CreateUserOptions = {
  password?: string;
  name?: string;
  phone?: string;
  userTypeText?: string;   // 예: "의사"
  userGroupText?: string;  // 예: "가정의학과"
  timeoutMs?: number;      // waitForTimeout에 쓰는 기본 값
};

export async function createUser(page: Page, userId: string, opts: CreateUserOptions = {}) {
  const password = opts.password ?? "change_this!1";
  const name = opts.name ?? "smoketest2";
  const phone = opts.phone ?? "010-9999-9999";
  const userTypeText = opts.userTypeText ?? "의사";
  const userGroupText = opts.userGroupText ?? "가정의학과";
  const t = opts.timeoutMs ?? 500; 
  await page.goto("/login");

  // 계정생성 클릭
  await page.getByText("계정생성").click();

  // ID 입력
  await page.locator('input[name="username"]').click();
  await page.locator('input[name="username"]').fill(userId);
  await page.locator('input[name="username"]').press("Tab");

  // PW / PW 확인 입력
  await page.locator('input[name="password"]').fill(password);
  await page.locator('input[name="password"]').press("Tab");
  await page.locator('input[name="confirmPassword"]').fill(password);
  await page.waitForTimeout(t * 4); // python sleep(2) 정도 대체

  // 다음 클릭
  await page.getByText("다음").click();

  // 이름 입력
  await page.locator('input[name="name"]').fill(name);

  // 휴대폰번호 입력
  await page.locator('input[name="phone"]').fill(phone);

  // 사용자유형 입력
  await page.locator('[data-testid="select-user-type-trigger"]').click();
  await page.waitForTimeout(t * 2);
  await page.locator(`div[role="option"] >> text=${userTypeText}`).click();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(t * 4);

  // 사용자그룹 입력
  await page.locator('[data-testid="select-user-group-trigger"]').click();
  await page.waitForTimeout(t * 2);
  await page.locator(`div[role="option"] >> text=${userGroupText}`).click();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(t * 4);

  // 다음 클릭
  await page.getByText("다음").click();

  // 서비스약관동의 클릭
  await page.locator('xpath=//*[@id="isAllAgree"]').click();
  await page.waitForTimeout(t * 4);

  // 다음 클릭 > 생성 완료
  await page.locator('[data-testid="next-button"]').click();

  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(t * 4);
}




// //DB 함수
// type Where = Record<string, string | number | boolean | null>;
// type SetValues = Record<string, string | number | boolean | null>;

// let _pool: mysql.Pool | null = null;

// function getMysqlPool(): mysql.Pool {
//   if (_pool) return _pool;

//   const host = process.env.MYSQL_HOST?.trim();
//   const user = process.env.MYSQL_USER?.trim();
//   const password = process.env.MYSQL_PASSWORD ?? "";
//   const database = process.env.MYSQL_DATABASE?.trim();
//   const port = Number(process.env.MYSQL_PORT ?? "3306");

//   if (!host || !user || !database) {
//     throw new Error(
//       "Missing MySQL env. Require: MYSQL_HOST, MYSQL_USER, MYSQL_DATABASE (and usually MYSQL_PASSWORD)."
//     );
//   }

//   _pool = mysql.createPool({
//     host,
//     user,
//     password,
//     database,
//     port,
//     waitForConnections: true,
//     connectionLimit: 5,
//     queueLimit: 0,
//   });

//   return _pool;
// }

// function assertSafeIdentifier(id: string) {
//   if (!/^[a-zA-Z0-9_]+$/.test(id)) {
//     throw new Error(`Unsafe identifier: ${id}`);
//   }
// }

// function q(id: string) {
//   assertSafeIdentifier(id);
//   return `\`${id}\``;
// }

// function buildWhere(where: Where) {
//   const keys = Object.keys(where);
//   if (keys.length === 0) throw new Error("WHERE clause is required.");

//   const clauses: string[] = [];
//   const params: any[] = [];

//   for (const k of keys) {
//     const v = where[k];
//     if (v === null) {
//       clauses.push(`${q(k)} IS NULL`);
//     } else {
//       clauses.push(`${q(k)} = ?`);
//       params.push(v);
//     }
//   }
//   return { sql: clauses.join(" AND "), params };
// }

// function buildSet(set: SetValues) {
//   const keys = Object.keys(set);
//   if (keys.length === 0) throw new Error("SET values are required.");

//   const clauses: string[] = [];
//   const params: any[] = [];

//   for (const k of keys) {
//     clauses.push(`${q(k)} = ?`);
//     params.push(set[k]);
//   }
//   return { sql: clauses.join(", "), params };
// }

// export async function dbSelectOne<T extends mysql.RowDataPacket>(
//   table: string,
//   selectCols: string[] | "*" = "*",
//   where: Where
// ): Promise<T | null> {
//   const { sql: whereSql, params } = buildWhere(where);

//   const colsSql = selectCols === "*" ? "*" : selectCols.map(q).join(", ");
//   const query = `SELECT ${colsSql} FROM ${q(table)} WHERE ${whereSql} LIMIT 1`;

//   const pool = getMysqlPool();
//   const [rows] = await pool.execute<T[]>(query, params);

//   return rows.length ? rows[0] : null;
// }

// export async function dbCount(
//   table: string,
//   where: Where
// ): Promise<number> {
//   const { sql: whereSql, params } = buildWhere(where);
//   const query = `SELECT COUNT(*) as cnt FROM ${q(table)} WHERE ${whereSql}`;
//   const pool = getMysqlPool();
//   const [rows] = await pool.execute<mysql.RowDataPacket[]>(query, params);
//   return rows[0].cnt as number;
// }



// export async function dbUpdate(
//   table: string,
//   set: SetValues,
//   where: Where
// ): Promise<number> {
//   const { sql: setSql, params: setParams } = buildSet(set);
//   const { sql: whereSql, params: whereParams } = buildWhere(where);

//   const query = `UPDATE ${q(table)} SET ${setSql} WHERE ${whereSql}`;

//   const pool = getMysqlPool();
//   const [result] = await pool.execute<mysql.ResultSetHeader>(query, [...setParams, ...whereParams]);

//   return result.affectedRows ?? 0;
// }

// export async function dbUpdateOrThrow(
//   table: string,
//   set: SetValues,
//   where: Where
// ): Promise<void> {
//   const affected = await dbUpdate(table, set, where);
//   if (affected === 0) {
//     throw new Error(`UPDATE affected 0 rows. table=${table}, where=${JSON.stringify(where)}`);
//   }
// }

// export async function dbClosePool(): Promise<void> {
//   if (_pool) {
//     await _pool.end();
//     _pool = null;
//   }
// }


// DB 함수
// 1. 타입
type DbKey = "default" | "EMR";
type Where = Record<string, string | number | boolean | null>;
type SetValues = Record<string, string | number | boolean | null>;

// 2. 유틸 함수
function assertSafeIdentifier(id: string) {
  if (!/^[a-zA-Z0-9_]+$/.test(id)) {
    throw new Error(`Unsafe identifier: ${id}`);
  }
}

function q(id: string) {
  assertSafeIdentifier(id);
  return `\`${id}\``;
}

function buildWhere(where: Where) {
  const keys = Object.keys(where);
  if (keys.length === 0) throw new Error("WHERE clause is required.");

  const clauses: string[] = [];
  const params: any[] = [];

  for (const k of keys) {
    const v = where[k];
    if (v === null) {
      clauses.push(`${q(k)} IS NULL`);
    } else {
      clauses.push(`${q(k)} = ?`);
      params.push(v);
    }
  }
  return { sql: clauses.join(" AND "), params };
}

function buildSet(set: SetValues) {
  const keys = Object.keys(set);
  if (keys.length === 0) throw new Error("SET values are required.");

  const clauses: string[] = [];
  const params: any[] = [];

  for (const k of keys) {
    clauses.push(`${q(k)} = ?`);
    params.push(set[k]);
  }
  return { sql: clauses.join(", "), params };
}

// 3. Pool 관리
const _pools: Partial<Record<DbKey, mysql.Pool>> = {};

function getMysqlPool(db: DbKey = "default"): mysql.Pool {
  if (_pools[db]) return _pools[db]!;

  const prefix = db === "default" ? "MYSQL" : `MYSQL_${db}`;

  const host     = process.env[`${prefix}_HOST`]?.trim();
  const user     = process.env[`${prefix}_USER`]?.trim();
  const password = process.env[`${prefix}_PASSWORD`] ?? "";
  const database = process.env[`${prefix}_DATABASE`]?.trim();
  const port     = Number(process.env[`${prefix}_PORT`] ?? "3306");

  if (!host || !user || !database) {
    throw new Error(
      `Missing MySQL env for "${db}". Require: ${prefix}_HOST, ${prefix}_USER, ${prefix}_DATABASE.`
    );
  }

  _pools[db] = mysql.createPool({
    host, user, password, database, port,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
  });

  return _pools[db]!;
}

// 4. export 함수들
export async function dbSelectOne<T extends mysql.RowDataPacket>(
  table: string,
  selectCols: string[] | "*" = "*",
  where: Where,
  db: DbKey = "default"
): Promise<T | null> {
  const { sql: whereSql, params } = buildWhere(where);
  const colsSql = selectCols === "*" ? "*" : selectCols.map(q).join(", ");
  const query = `SELECT ${colsSql} FROM ${q(table)} WHERE ${whereSql} LIMIT 1`;
  const pool = getMysqlPool(db);
  const [rows] = await pool.execute<T[]>(query, params);
  return rows.length ? rows[0] : null;
}

export async function dbCount(
  table: string,
  where: Where,
  db: DbKey = "default"
): Promise<number> {
  const { sql: whereSql, params } = buildWhere(where);
  const query = `SELECT COUNT(*) as cnt FROM ${q(table)} WHERE ${whereSql}`;
  const pool = getMysqlPool(db);
  const [rows] = await pool.execute<mysql.RowDataPacket[]>(query, params);
  return rows[0].cnt as number;
}

export async function dbUpdate(
  table: string,
  set: SetValues,
  where: Where,
  db: DbKey = "default"
): Promise<number> {
  const { sql: setSql, params: setParams } = buildSet(set);
  const { sql: whereSql, params: whereParams } = buildWhere(where);
  const query = `UPDATE ${q(table)} SET ${setSql} WHERE ${whereSql}`;
  const pool = getMysqlPool(db);
  const [result] = await pool.execute<mysql.ResultSetHeader>(query, [...setParams, ...whereParams]);
  return result.affectedRows ?? 0;
}

export async function dbUpdateOrThrow(
  table: string,
  set: SetValues,
  where: Where,
  db: DbKey = "default"
): Promise<void> {
  const affected = await dbUpdate(table, set, where, db);
  if (affected === 0) {
    throw new Error(`UPDATE affected 0 rows. table=${table}, where=${JSON.stringify(where)}`);
  }
}

export async function dbClosePool(db?: DbKey): Promise<void> {
  if (db) {
    if (_pools[db]) {
      await _pools[db]!.end();
      delete _pools[db];
    }
  } else {
    for (const key of Object.keys(_pools) as DbKey[]) {
      await _pools[key]!.end();
      delete _pools[key];
    }
  }
}


//로그인 함수
export type LoginOptions = {
  loginPath?: string;       
  waitAfterGotoMs?: number; 
};

export async function Login(
  page: Page,
  adminId: string,
  adminPw: string,
  opts: LoginOptions = {}
) {
  if (!adminId || !adminPw) {
    throw new Error("Login: Id/Pw are required.");
  }

  const loginPath = opts.loginPath ?? "/login";
  const waitAfterGotoMs = opts.waitAfterGotoMs ?? 3000;

  await page.goto(loginPath);
  await page.waitForTimeout(waitAfterGotoMs);

  // username
  await page.locator('input[name="username"]').click();
  await page.locator('input[name="username"]').fill(adminId);
  await page.waitForTimeout(1000);
  await page.locator('input[name="username"]').press("Tab");

  // password
  await page.locator('input[name="password"]').fill(adminPw);
  await page.waitForTimeout(2000);

  // login click
  await page.locator('[data-testid="login-button"]').nth(0).click();

  // ✅ 중복 로그인 예외처리 (있으면 처리, 없으면 pass)
  try {
    const dupHeader = page.locator(`xpath=//h2[text()='중복 로그인 안내']`);
    await dupHeader.waitFor({ timeout: 3000 });

    await page.waitForTimeout(1000);
    await page.getByText("예").click();

    // 앱이 polling/websocket 쓰면 networkidle이 오래 걸릴 수 있음
    await page.waitForLoadState("networkidle");
  } catch {
    // pass
  }

  await page.waitForTimeout(1000);
}


function buildWhereOracle(where: Where) {
  const keys = Object.keys(where);
  if (keys.length === 0) throw new Error("WHERE clause is required.");

  const clauses: string[] = [];
  const params: any[] = [];
  let i = 1;

  for (const k of keys) {
    const v = where[k];
    if (v === null) {
      clauses.push(`${k} IS NULL`);
    } else {
      clauses.push(`${k} = :${i++}`);
      params.push(v);
    }
  }
  return { sql: clauses.join(" AND "), params };
}

import oracledb from "oracledb";

// Oracle Pool
let _oraclePool: oracledb.Pool | null = null;

async function getOraclePool(): Promise<oracledb.Pool> {
  if (_oraclePool) return _oraclePool;

  const user     = process.env.ORACLE_EMR_USER?.trim();
  const password = process.env.ORACLE_EMR_PASSWORD ?? "";
  const host     = process.env.ORACLE_EMR_HOST?.trim();
  const port     = process.env.ORACLE_EMR_PORT ?? "1521";
  const service  = process.env.ORACLE_EMR_SERVICE?.trim(); // 서비스명

  if (!user || !host || !service) {
    throw new Error(
      "Missing Oracle env. Require: ORACLE_EMR_USER, ORACLE_EMR_HOST, ORACLE_EMR_SERVICE."
    );
  }

  _oraclePool = await oracledb.createPool({
    user,
    password,
    connectString: `${host}:${port}/${service}`,
    poolMin: 1,
    poolMax: 5,
  });

  return _oraclePool;
}

export async function oracleCount(
  table: string,
  where: Where
): Promise<number> {
  const { sql: whereSql, params } = buildWhereOracle(where);
  const query = `SELECT COUNT(*) AS cnt FROM ${table} WHERE ${whereSql}`;
  const pool = await getOraclePool();
  const conn = await pool.getConnection();
  try {
    const result = await conn.execute<{ CNT: number }>(query, params, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });
    return result.rows?.[0]?.CNT ?? 0;
  } finally {
    await conn.close();
  }
}

export async function oracleClosePool(): Promise<void> {
  if (_oraclePool) {
    await _oraclePool.close(0);
    _oraclePool = null;
  }
}

//암호화함수
import * as crypto from "crypto";

export function encryptAESCBC(data: string, key: string): string {
  const hashedKey = crypto.createHash("sha256").update(key).digest();
  const aesKey = hashedKey.slice(0, 16);
  const iv = hashedKey.slice(16);

  const cipher = crypto.createCipheriv("aes-128-cbc", aesKey, iv);
  cipher.setAutoPadding(true); // PKCS7 패딩
  const encrypted = Buffer.concat([cipher.update(data, "utf-8"), cipher.final()]);
  return encrypted.toString("base64");
}

export async function adminPageLogin(page: Page): Promise<void> {
  await page.goto(ADMIN_URL);
  await page.locator('input[name="username"]').click();
  await page.locator('input[name="username"]').fill(ADMIN_PAGE_ID);
  await page.waitForTimeout(1000);
  await page.locator('input[name="username"]').press('Tab');
  await page.locator('input[name="password"]').fill(ADMIN_PAGE_PASSWORD);
  await page.waitForTimeout(1000);
  await page.getByText('로그인').click();
  await page.waitForTimeout(1000);
}