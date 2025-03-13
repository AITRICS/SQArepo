import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

let connection: mysql.Connection | null = null;
/**
 * MySQL 연결 함수
 * @returns MySQL Connection 객체
 */
export async function connectToMySQL(): Promise<mysql.Connection> {
  if (!connection) {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '192.168.132.5',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'cV72Buj3[m:7hl=@!',
      database: process.env.DB_NAME || 'vitalcare',
    });

    // 🔹 세션 변수 설정 (복호화 키 저장)
    await connection.execute("SET @hashed_key = (SELECT UNHEX(SHA2('some_secret', 256)))");
    await connection.execute("SET @secretkey = LEFT(@hashed_key, 16)");
    await connection.execute("SET @iv = RIGHT(@hashed_key, 16)");

  }
  return connection;
}

/**
 * SQL 쿼리 실행 함수
 * @param query 실행할 SQL 쿼리
 * @returns 결과 데이터
 */
export async function executeQuery(query: string): Promise<any[]> {
  const conn = await connectToMySQL();
  try {
    const [rows] = await conn.execute(query);
    return rows as any[];
  } catch (error) {
    console.error('❌ SQL 실행 중 오류 발생:', error);
    throw error;
  }
}

export async function closeConnection() {
  if (connection) {
    await connection.end();
    connection = null;
  }
}