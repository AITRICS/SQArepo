"""
계정 생성 확인
https://aitrics.atlassian.net/browse/VQ-327
"""

import unittest
from setup import setUp, setUp_folder,setUp_subfolder
# from influxdb_client import Point, WritePrecision
# from setup import setUp_influxdb
from datetime import datetime, timezone, timedelta
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import pre_setting
import time
import random


class CreateAccountTest(unittest.TestCase):
    def setUp(self):
        print("1. 계정 생성 테스트===========================================>")
        self.driver = setUp(pre_setting.url)
        # _, self.write_api=setUp_influxdb()

    # def create_file(self,sf,filename,elements):
    #     driver = self.driver
    #     now = datetime.now()
    #     timestamp = now.strftime("%Y-%m-%d_%H%M%S")
    #     filename = os.path.join(sf, f'{filename}_{timestamp}.png')
    #     driver.find_element(By.XPATH, elements).screenshot(filename)

    def test_create_account(self):
        self.phone_number = random.randint(10 ** 9, 10 ** 10 - 1)
        result_count = 0
        driver = self.driver
        # 테스트 결과 저장할 폴더 경로
        main_path = setUp_folder(pre_setting.result_folder)
        save_folder=setUp_subfolder(main_path, '01. [TC_002_001] 계정 생성')

        time.sleep(1)
        driver.find_element(By.XPATH,"/html/body/div[2]/div/button").click()  # 계정생성 버튼 클릭

        try: #계정 생성 모달창 대기
            WebDriverWait(driver, 10).until(
                EC.visibility_of_element_located((By.XPATH,'/html/body/div[6]'))
            )
            #스크린샷 저장
            pre_setting.create_file(self,save_folder,'계정 생성 모달 노출 확인','/html/body/div[6]')

            print("계정 생성 모달 노출 확인 >> pass")
            result_count += 1
        except TimeoutError:
            print("Timeout")
            print("계정 생성 모달 노출 확인 >> fail")
            pass
        time.sleep(1)
        #계정 생성 모달 아래로 스크롤
        dialog_button=driver.find_element(By.XPATH,'/html/body/div[6]/div[2]/div/form/div[9]/div[2]/span[2]')
        driver.execute_script("arguments[0].scrollIntoView();",dialog_button)

        #계정 생성 버튼 비활성화 확인
        button=driver.find_element(By.XPATH,'/html/body/div[6]/div[2]/div/form/div[9]/div[1]/button')

        if button.get_attribute('disabled'):
            print("계정 생성 버튼 비활성화 확인 >> pass")
            # 스크린샷 저장
            pre_setting.create_file(self,save_folder, '계정 생성 버튼 비활성화 확인', '/html/body/div[6]')
            result_count += 1
        else:
            print("계정 생성 버튼 비활성화 확인 >> fail")
            result_count += 0
        time.sleep(2)

        #계정 생성 모달 위로 스크롤
        dialog_element = driver.find_element(By.XPATH, '/html/body/div[6]/div[2]/div')
        driver.execute_script("arguments[0].scrollTop = 0;", dialog_element)
        time.sleep(1)
        driver.find_element(By.XPATH,'/html/body/div[6]/div[2]/div/form/div[1]/div[2]/input').send_keys(pre_setting.userid)
        time.sleep(1)
        driver.find_element(By.XPATH,'/html/body/div[6]/div[2]/div/form/div[2]/div[2]/input').send_keys(pre_setting.password)
        time.sleep(1)
        driver.find_element(By.XPATH,'/html/body/div[6]/div[2]/div/form/div[3]/div[2]/input').send_keys(pre_setting.password)
        time.sleep(1)
        driver.find_element(By.XPATH, '/html/body/div[6]/div[2]/div/form/div[5]/input').send_keys(pre_setting.name)
        time.sleep(1)
        driver.find_element(By.XPATH, '/html/body/div[6]/div[2]/div/form/div[7]/input').send_keys(self.phone_number)
        time.sleep(2)
        # 계정 생성 모달 아래로 스크롤
        target_element = driver.find_element(By.XPATH, '//div[text()="사용자 유형" or text()="User type"]')
        driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'start'});",
                              target_element)  # 스크롤
        time.sleep(1)
        driver.find_element(By.XPATH,
                            '//div[text()="사용자 유형" or text()="User type"]/following-sibling::button[@role="combobox"]').click()
        time.sleep(1)
        driver.find_element(By.XPATH,
                            '//div[@role="option"]//span[text()="의사" or text()="Physician"]').click()  # 사용자 유형 의사 선택
        time.sleep(1)
        driver.find_element(By.XPATH,
                            '//div[text()="사용자 소속" or text()="User group"]/following-sibling::button[@role="combobox"]').click()
        time.sleep(1)
        driver.find_element(By.XPATH,
                            '//div[@role="option"]//span[text()="일반병동" or text()="GW"]').click()  # 사용자 소속 기타 선택
        time.sleep(1)
        # 계정 생성 모달 아래로 스크롤
        driver.execute_script("arguments[0].scrollIntoView();", dialog_button)
        driver.find_element(By.XPATH, '/html/body/div[6]/div[2]/div/form/div[8]/section[1]/label/input').click() #서비스 이용약관 동의
        driver.find_element(By.XPATH, '/html/body/div[6]/div[2]/div/form/div[8]/section[2]/label/input').click() #개인정보 수집/이용 동의
        time.sleep(2)

        if button.get_attribute('disabled'):
            print("계정 생성 버튼 활성화 확인 >> fail")
            pass
        else:
            print("계정 생성 버튼 활성화 확인 >> pass")
            # 스크린샷 저장
            pre_setting.create_file(self,save_folder, '계정 생성 버튼 활성화 확인', '/html/body/div[6]')
            result_count += 1
            button.click()  # 계정생성 버튼 클릭

        start_time=time.time()

        try: #계정 생성 대기
            WebDriverWait(driver, 10).until(
                EC.visibility_of_element_located((By.ID,'toast'))
            )
            # 스크린샷 저장
            pre_setting.create_file(self,save_folder, '계정 생성 토스트 메시지 확인', '/html/body')
        except TimeoutError:
            print("Timeout")

        end_time=time.time()

        toast_element = driver.find_element(By.ID,'toast')
        toast_message = toast_element.text

        if toast_message == "계정 생성 완료! 관리자의 승인 후 로그인이 가능합니다.":
            print("계정 생성 토스트 메시지 확인 >> pass")
            result_count += 1
        else:
            print("계정 생성 토스트 메시지 확인 >> fail")
            self.driver.find_element(By.XPATH,'/html/body/div[6]/div[1]/button').click()#계정 생성모달 닫기
            pass

        try: #로그인 화면 확인
            WebDriverWait(driver, 10).until(
                EC.visibility_of_element_located((By.XPATH,'/html/body/div[2]/div/form'))
            )
            print("로그인 화면 진입 확인 >> pass")
            # 스크린샷 저장
            pre_setting.create_file(self,save_folder, '로그인 화면 진입 확인', '/html/body')
            result_count += 1
        except TimeoutError:
            print("Timeout")
            print("로그인 화면 진입 확인 >> fail")
            pass

        #생성 계정 로그인 확인
        pre_setting.user_login(self, pre_setting.userid, pre_setting.password)  # 미승인 계정 로그인
        pre_setting.create_file(self,save_folder, '생성 계정 로그인 시도(승인X)', '/html/body')  # 스크린샷 저장
        toast_message = driver.find_element(By.ID, 'toast').text

        # if toast_message == "로그인에 실패했습니다. 관리자에게 문의해 주세요.":
        if toast_message == "로그인에 실패했습니다. 관리자에게 문의해 주세요.":
            print("생성 계정 로그인 확인(승인X) >> pass")
            result_count += 1
        else:
            print("생성 계정 로그인 확인(승인X) >> fail")
            pass

        pre_setting.user_login(self,pre_setting.admin_id,pre_setting.admin_pw)#admin 로그인
        pre_setting.user_active(self,pre_setting.userid,pre_setting.admin_id)#계정 승인
        pre_setting.user_logout(self,pre_setting.admin_id) #admin 로그아웃
        pre_setting.user_login(self,pre_setting.userid,pre_setting.password) #승인 계정 로그인
        try: #대시보드 화면 확인
            WebDriverWait(driver, 10).until(
                EC.visibility_of_element_located((By.XPATH,'/html/body/div[2]/div/div/div'))
            )
            print("생성 계정 로그인 확인(승인O) >> pass")
            # 스크린샷 저장
            pre_setting.create_file(self,save_folder, '대시보드 화면 진입 확인', '/html/body')
            pre_setting.user_logout(self,pre_setting.userid)#계정 로그아웃
            result_count += 1
        except TimeoutError:
            print("Timeout")
            print("생성 계정 로그인 확인(승인O) >> fail")
            pass

        run_time = end_time - start_time #계정 생성 시간
        time.sleep(2)
        #계정 생성 테스트 결과
        if result_count == 7:
            result = True
            print("[계정 생성 PASS]")
        else:
            result = False
            print("[계정 생성 fail  ("+str(result_count)+"/7)]")

        # pre_setting.record_result(result, run_time, 'Create Account')
    # def record_result(self, test_method,run_time,test_name):#결과 DB 저장
    #     test_status = 'pass' if test_method else 'fail' #테스트 결과가 True->pass, False->fail
    #
    #     utc_now = datetime.now(timezone.utc)
    #     kst_now = utc_now + timedelta(hours=9)
    #
    #     test_result = (Point("unittest_results")#테이블명
    #                    .field("test_name", test_name)#테스트이름
    #                    .field("status", test_status)#테스트결과
    #                     .field("run_time",run_time)
    #                    .time(kst_now, WritePrecision.NS))
    #     self.write_api.write(bucket="AUTO_UI_TEST", record=test_result)


    def tearDown(self):#테스트 종료
        pre_setting.user_login(self,pre_setting.admin_id,pre_setting.admin_pw) #admin 로그인
        pre_setting.delete_user(self,pre_setting.userid,pre_setting.admin_id) #사용한 계정 삭제
        pre_setting.user_logout(self,pre_setting.admin_id) # admin 로그아웃
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()
