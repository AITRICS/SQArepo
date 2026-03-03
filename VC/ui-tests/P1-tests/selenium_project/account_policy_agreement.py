import unittest
from setup import setUp,setUp_folder,setUp_subfolder
# from influxdb_client import Point, WritePrecision
# from setup import setUp_influxdb
from datetime import datetime, timezone, timedelta
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from set_database import conn
import pre_setting
import time

class AccountPolicyAgreementTest(unittest.TestCase):
    def setUp(self):
        print("5. 개인정보 미동의 계정 테스트===========================================>")
        self.driver = setUp(pre_setting.url)
        # _, self.write_api=setUp_influxdb()

    def set_disagreement(self,id):
        cur = conn.cursor()  # 이용약관, 개인정보 동의 여부 삭제
        cur.execute(
            "DELETE from vitalcare.accounts_policy_agreement WHERE username='" + id + "'")
        conn.commit()

    def test_account_policy_agreement(self):
        def is_button_enabled(button):
            return button.is_enabled()

        def set_checkboxes(state1, state2, terms, privacy):
            if terms.is_selected() != state1:
                terms.click()
            if privacy.is_selected() != state2:
                privacy.click()

        result_count = 0
        driver = self.driver
        main_path = setUp_folder(pre_setting.result_folder)
        save_folder = setUp_subfolder(main_path, '05. [TC_002_001] 개인정보 미동의 계정')

        time.sleep(3)
        pre_setting.create_user(self)  # member 계정 생성
        pre_setting.user_login(self, pre_setting.admin_id, pre_setting.admin_pw)  # admin 로그인
        pre_setting.user_active(self, pre_setting.userid,pre_setting.admin_id)  # member 계정 승인
        pre_setting.user_logout(self, pre_setting.admin_id)  # admin로그아웃

        self.set_disagreement(pre_setting.userid,)#계정 미동의 설정
        pre_setting.user_login(self,pre_setting.userid,pre_setting.password)#미동의 계정 로그인

        start_time = time.time()

        try:
            #개인정보 동의 모달 확인
            WebDriverWait(driver, 10).until(
             EC.visibility_of_element_located((By.XPATH,'/html/body/div[6]'))
            )
            print("개인정보 동의 모달 확인 >> pass")
            # 스크린샷 저장
            pre_setting.create_file(self,save_folder, '개인정보 동의 모달 확인', '/html/body')
        except TimeoutError:
            print("Timeout")
            print("개인정보 동의 모달 확인 >> fail")
            pass

        # 개인정보 동의 모달 아래로 스크롤
        dialog_button = driver.find_element(By.XPATH,
                                            '/html/body/div[6]/div[2]/form/div/button')
        driver.execute_script("arguments[0].scrollIntoView();", dialog_button)
        time.sleep(0.5)

        terms_check=driver.find_element(By.XPATH,'/html/body/div[6]/div[2]/form/section[1]/label/input')
        privacy_check=driver.find_element(By.XPATH,'/html/body/div[6]/div[2]/form/section[2]/label/input')
        # agree_button = driver.find_element(By.XPATH,'/html/body/div[2]/div/section/article/form/button')

        #동의 여부에 따른 버튼 활성화 여부 확인
        # 이용약관 동의, 개인정보 미동의 -> 버튼 비활성화 확인
        set_checkboxes(True, False,terms_check,privacy_check)

        try:
            assert not is_button_enabled(dialog_button), "동의 버튼 활성화 >> FAIL"
        except AssertionError as e:
            print(f"fail: {e}")
        time.sleep(1)
        # 스크린샷 저장
        pre_setting.create_file(self, save_folder, '동의 버튼 비활성화 확인1', '/html/body')
        result_count += 1

        # 이용약관 미동의, 개인정보 동의 -> 버튼 비활성화 확인
        set_checkboxes(False, True,terms_check,privacy_check)
        try:
            assert not is_button_enabled(dialog_button), "동의 버튼 활성화 >> FAIL"
        except AssertionError as e:
            print(f"fail: {e}")
        # 스크린샷 저장
        pre_setting.create_file(self, save_folder, '동의 버튼 비활성화 확인2', '/html/body')
        result_count += 1

        # 이용약관 미동의, 개인정보 미동의 -> 버튼 비활성화 확인
        set_checkboxes(False, False,terms_check,privacy_check)
        try:
            assert not is_button_enabled(dialog_button), "동의 버튼 활성화 >> FAIL"
        except AssertionError as e:
            print(f"fail: {e}")
        # 스크린샷 저장
        pre_setting.create_file(self, save_folder, '동의 버튼 비활성화 확인3', '/html/body')
        result_count += 1

        # 이용약관 동의, 개인정보 동의 -> 버튼 활성화 확인
        set_checkboxes(True, True,terms_check,privacy_check)
        try:
            assert is_button_enabled(dialog_button), "동의 버튼 비활성화 >> FAIL"
        except AssertionError as e:
            print(f"fail: {e}")
        # 스크린샷 저장
        pre_setting.create_file(self, save_folder, '동의 버튼 활성화 확인', '/html/body')
        result_count += 1

        #이용약관, 개인정보 동의
        dialog_button.click() #동의 버튼 클릭
        #개정 안내 모달 확인
        WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, '/html/body/div[6]'))
        )
        time.sleep(1)
        driver.find_element(By.XPATH, '/html/body/div[6]/div[1]/button').click() #안내 모달 닫기

        try:  # 대시보드 화면 확인
            WebDriverWait(driver, 10).until(
                EC.visibility_of_element_located((By.XPATH, '/html/body/div[2]/div/div'))
            )
            print("동의 후 대시보드 진입 >> pass")
            # 스크린샷 저장
            pre_setting.create_file(self, save_folder, '동의 후 대시보드 진입', '/html/body')
            result_count += 1
        except TimeoutError:
            print("Timeout")
            print("동의 후 대시보드 진입 >> fail")
            pass

        #로그아웃 후 동의서 노출 여부 확인
        pre_setting.user_logout(self,pre_setting.userid)#로그아웃
        pre_setting.user_login(self,pre_setting.userid,pre_setting.password)#동의 계정 로그인
        try:  # 대시보드 화면 확인
            WebDriverWait(driver, 10).until(
                EC.visibility_of_element_located((By.XPATH, '/html/body/div[2]/div/div/div'))
            )
            print("동의 계정 동의서 미노출 >> pass")
            # 스크린샷 저장
            pre_setting.create_file(self, save_folder, '동의 계정 동의서 미노출 확인', '/html/body')
            result_count += 1
        except TimeoutError:
            print("Timeout")
            print("동의 계정 동의서 미노출 >> fail")
            pass

        end_time = time.time()
        run_time = end_time - start_time
        if result_count == 6:
            result = True
            print("[이용약관, 개인정보 동의서 확인 PASS]")
        else:
            result = False
            print("[이용약관, 개인정보 동의서 확인 FAIL  (" +str(result_count)+"/6)]")

        # pre_setting.record_result(result, run_time, 'Account Policy')

    def tearDown(self):#테스트 종료
        pre_setting.user_logout(self,pre_setting.userid)  #  로그아웃
        pre_setting.user_login(self,pre_setting.admin_id,pre_setting.admin_pw)
        pre_setting.delete_user(self,pre_setting.userid,pre_setting.admin_id ) #사용한 계정 삭제
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()