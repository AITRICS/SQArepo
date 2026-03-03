"""
계정 잠금 초기화 확인
https://aitrics.atlassian.net/browse/VQ-336
"""
import unittest
from selenium.common import NoSuchElementException
from setup import setUp,setUp_folder,setUp_subfolder
from selenium.webdriver.common.by import By
from datetime import datetime, timezone, timedelta
# from setup import setUp_influxdb
# from influxdb_client import Point, WritePrecision
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from set_database import conn
import time,sys
import pre_setting
class UnlockAccountTest(unittest.TestCase):
    def setUp(self):
        print("4. 권한별 계정 오류 횟수 초기화 테스트=========================================>")
        self.driver = setUp(pre_setting.url)
        # _, self.write_api = setUp_influxdb()

    # def create_file(self, sf, filename, elements):
    #     driver = self.driver
    #     now = datetime.now()
    #     timestamp = now.strftime("%Y-%m-%d_%H%M%S")
    #     filename = os.path.join(sf, f'{filename}_{timestamp}.png')
    #     driver.find_element(By.XPATH, elements).screenshot(filename)


    def toast_message(self,i,recent_role,save_folder):
        driver = self.driver
        global toast_message
        try:  # 토스트 메지시 대기
            WebDriverWait(driver, 10).until(
                EC.visibility_of_element_located((By.ID, 'toast'))
            )
            toast_element = driver.find_element(By.ID, 'toast')
            toast_message = toast_element.text

            # 스크린샷 저장
            if recent_role == "MEMBER":
                if i < 4:
                    pre_setting.create_file(self,save_folder, f'MEMBER 로그인 토스트 메세지 확인 {i + 1}회', '/html/body/div[2]')
                elif i == 5:
                    pre_setting.create_file(self,save_folder, 'MEMBER 로그인 실패 횟수 초기화 확인', '/html/body/div[2]')
            if recent_role == "MANAGER":
                if i < 4:
                    pre_setting.create_file(self,save_folder, f'MANAGER 로그인 토스트 메세지 확인 {i + 1}회', '/html/body/div[2]')
                elif i == 5:
                    pre_setting.create_file(self,save_folder, 'MANAGER 로그인 실패 횟수 초기화 확인', '/html/body/div[2]')
            # if recent_role == "ADMIN":
            #     if i < 4:
            #         pre_setting.create_file(self,save_folder, f'ADMIN 로그인 토스트 메세지 확인 {i + 1}회', '/html/body/div[1]')
            #     elif i == 5:
            #         pre_setting.create_file(self,save_folder, 'ADMIN 로그인 실패 횟수 초기화 확인', '/html/body/div[1]')

            # 토스트 메시지 사라짐 대기
            WebDriverWait(driver, 10).until(
                EC.invisibility_of_element_located((By.ID, 'toast'))
            )
        except TimeoutError:
            print("Timeout")

        return toast_message

    def account_lock_check(self, id,password,recent_role,save_folder):
        unlock_check_result = 0
        pw=None
        for i in range(6):
            if i<4 or i==5:
                pw="1234"
            elif i==4:
                pw=password

            pre_setting.user_login(self, id, pw)  # 로그인

            if i < 4 : #로그인 4회 실패
                print(recent_role + " 로그인 실패 확인 (" + str(i + 1) + "/4)")

            elif i==4: # 로그인 성공 후 로그아웃
                pre_setting.user_logout(self, id)

            elif i == 5: #로그인 시도 초기화 후 로그인 실패
                tm = self.toast_message(i,recent_role, save_folder)  # 토스트 메시지 읽어오기
                if "ID 또는 비밀번호를 확인해주세요." in tm:  # 토스트 메시지 확인
                    unlock_check_result += 1
                    print(recent_role + " 계정 오류 횟수 초기화 확인 >> pass")
                else:
                    print(recent_role + " 계정 오류 횟수 초기화 확인 >> fail")
                    unlock_check_result = 0

        return unlock_check_result

    def test_unlock_account(self):
        # 테스트 결과 저장할 폴더 경로
        #exe_path = setUp_folder()
        # 스크린샷 저장 폴더 경로 지정
        #save_folder = os.path.join(exe_path, '04.계정 잠금 초기화 확인')

        # # 스크린샷 저장 폴더 경로 지정
        main_path = setUp_folder(pre_setting.result_folder)
        save_folder = setUp_subfolder(main_path, '04. [TC_002_001] 권한별 계정 오류 횟수 초기화')
        # # 폴더 존재 확인 및 생성
        # if not os.path.exists(save_folder):
        #     os.makedirs(save_folder)

        # member 계정 생성
        pre_setting.create_user(self)  # member 계정 생성
        pre_setting.user_login(self, pre_setting.admin_id, pre_setting.admin_pw)  # admin 로그인
        pre_setting.user_active(self, pre_setting.userid,pre_setting.admin_id)  # member 계정 승인
        pre_setting.user_logout(self,pre_setting.admin_id )  # admin로그아웃

        result_count = 0
        start_time = time.time()
        # cur = conn.cursor()
        # cur.execute(  # 계정 권한, 오류 횟수 초기화
        #     "UPDATE vitalcare.accounts_user SET incorrect_password_tries =0, role='ROLE_TYPE_MEMBER' WHERE username='"+pre_setting.userid+"'")
        # conn.commit()
        for account_change in range(3):
            if account_change == 0:  # MEMBER 계정 확인
                result = self.account_lock_check(pre_setting.userid,pre_setting.password,"MEMBER",save_folder)
                result_count += result
            elif account_change == 1:  # MANAGER 계정 확인
                result = self.account_lock_check(pre_setting.manager_id,pre_setting.manager_pw,"MANAGER",save_folder)
                result_count += result
            # elif account_change == 2:  # ADMIN 계정 확인
            #     result = self.account_lock_check(pre_setting.admin_id,pre_setting.admin_pw,"ADMIN",save_folder)
            #     result_count += result
            else:
                print("account change fail")

        # 테스트 시간
        end_time = time.time()
        run_time = end_time - start_time

        if result_count == 2:
            result = True
            print("[권한별 계정 오류 횟수 초기화 PASS]")
        else:
            result = False
            print("[권한별 계정 오류 횟수 초기화 FAIL]")

        # pre_setting.record_result(result, run_time, 'Reset Incorrect Password Tries')

    # def record_result(self, test_method, run_time, test_name):  # 결과 DB 저장
    #     test_status = 'pass' if test_method else 'fail'  # 테스트 결과가 True->pass, False->fail
    #
    #     utc_now = datetime.now(timezone.utc)
    #     kst_now = utc_now + timedelta(hours=9)
    #
    #     test_result = (Point("unittest_results")  # 테이블명
    #                    .field("test_name", test_name)  # 테스트이름
    #                    .field("status", test_status)  # 테스트결과
    #                    .field("run_time", run_time)  # 테스트 경과 시간
    #                    .time(kst_now, WritePrecision.NS))
    #     self.write_api.write(bucket="AUTO_UI_TEST", record=test_result)

    def tearDown(self):  # 테스트 종료
        cur = conn.cursor()  # admin 로그인 실패 횟수 초기화
        cur.execute(
            "UPDATE vitalcare.accounts_user SET incorrect_password_tries =0 WHERE username='" + pre_setting.admin_id + "'")
        conn.commit()

        try:
            # manager 계정 비번 재설정
            new_pw = pre_setting.user_pwReset(self, pre_setting.manager_id,pre_setting.admin_id)  # manager 비번 재설정
            pre_setting.user_logout(self,pre_setting.admin_id)  # admin 로그아웃
            pre_setting.user_login(self, pre_setting.manager_id, new_pw)  # manager 로그인
            pre_setting.change_pw(self, new_pw)  # manager 계정 비번 변경
            pre_setting.user_logout(self,pre_setting.manager_id)  # manager 로그아웃

            # member 계정 삭제
            pre_setting.user_login(self, pre_setting.admin_id, pre_setting.admin_pw)  # admin 로그인
            pre_setting.delete_user(self, pre_setting.userid,pre_setting.admin_id)  # admin계정으로 member계정 삭제
            pre_setting.user_logout(self,pre_setting.admin_id)  # admin 로그아웃
            self.driver.quit()
        except Exception as e:
            print("계정 잠김 횟수 초기화 실패ㅜㅜ")
            # 테스트 실패한 경우 강제로 실패 횟수 초기화
            cur.execute(
                "UPDATE vitalcare.accounts_user SET incorrect_password_tries =0 WHERE username='" + pre_setting.manager_id + "'")
            conn.commit()
            cur.execute(
                "UPDATE vitalcare.accounts_user SET incorrect_password_tries =0 WHERE username='" + pre_setting.userid + "'")
            conn.commit()
            sys.exit()

if __name__ == "__main__":
    unittest.main()