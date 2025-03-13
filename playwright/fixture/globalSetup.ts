import { FullConfig } from '@playwright/test';
import { executeQuery } from './setDatabase.js';
import axios from 'axios';
import dotenv from 'dotenv'

dotenv.config();

async function globalSetup(config: FullConfig) {
    console.log('🚀 globalSetup.ts 실행 시작')
    try { 
        const loginUrl = `${process.env.API_BASE}${process.env.LOGIN_API}`;
        console.log('🔹 로그인 요청 URL:', loginUrl);
        const response = await axios.post(loginUrl, {
            username: process.env.ADMINID,
            password: process.env.ADMINPW,
        });

        const token = response.data.data.accessToken; // admin 토큰 발급

        const query = `SELECT * FROM accounts_user WHERE username = '${process.env.USERID}'`;
        const rows = await executeQuery(query);

        if (Array.isArray(rows) && rows.length === 0) {
            console.log(`✅ 계정(${process.env.USERID})이 DB에 존재하지 않아 삭제 API를 실행하지 않습니다.`);
        }else {const deleteUrl = `${process.env.API_BASE}${process.env.DELETE_API}/${process.env.USERID}`;
            console.log('🔹 계정 삭제 요청 URL:', deleteUrl);
            await axios.delete(deleteUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        }
        
        const dashboardResetURL = `${process.env.API_BASE}${process.env.DASHBOARD_RESET}`;
        console.log('🔹 대시보드 설정 초기화 URL:', dashboardResetURL);
        await axios.post(dashboardResetURL, {},{
            headers:{
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

    } catch (error) {
        console.error('⚠️ Global Setup 중 오류 발생 (무시됨):', error);
    }
        
    // db 쿼리
    // await executeQuery('DELETE FROM accounts_user WHERE username = "test_user";');
    console.log('✅ Global Setup 완료')
}

export default globalSetup;