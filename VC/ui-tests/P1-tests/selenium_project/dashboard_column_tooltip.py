import unittest
from setup import setUp,setUp_folder,setUp_subfolder,connect_to_mysql, execute_query,conn
# from setup import setUp_influxdb
# from influxdb_client import Point, WritePrecision
from datetime import datetime, timezone, timedelta
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import pre_setting
import time,re
import random

class Dashboard_Tooltip(unittest.TestCase):
    def setUp(self):
        print("7. 대시보드 스코어 컬럼 툴립 테스트=========================================>")
        self.driver = setUp(pre_setting.url)
        # _, self.write_api = setUp_influxdb()
    def column_index_find(self,column):
        driver = self.driver
        headers = driver.find_elements(By.XPATH, "/html/body/div[2]/div/div/div/div/div/div[2]/div[1]/table/thead/tr/th")
        column_index = None
        for index, header in enumerate(headers, start=1):  # note 컬럼 찾기
            if header.text.strip() == column:
                column_index = index
                break
        return column_index

    def score_policy(self,score):
        query = f"SELECT policy_desc FROM vitalcare.api_screening_policy WHERE subcategory = '{score}'"
        db_result = execute_query(conn,query)
        policy_desc = db_result[0][0]
        return policy_desc

    def test_1_CARED_tooltip(self):
        main_path = setUp_folder(pre_setting.result_folder)
        save_folder = setUp_subfolder(main_path, '07. [TC_002_003] 대시보드 스코어 툴팁 확인')
        driver = self.driver
        result_count = 0
        pre_setting.user_login(self, pre_setting.admin_id, pre_setting.admin_pw)  # admin 로그인
        WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, '/html/body/div[2]/div/div/div/div/div/div[2]/div[2]/div/table'))
        )
        DB_policy=self.score_policy("CARED")
        CARED_index = self.column_index_find("CARED") #CARED 인텍스 찾기
        CARED_column=driver.find_element(By.XPATH,
                                        f'/html/body/div[2]/div/div/div/div/div/div[2]/div[1]/table/thead/tr/th[{CARED_index}]/div/button/div/span')
        ActionChains(driver).move_to_element(CARED_column).perform() #마우스 호버
        CARED_tooltip=driver.find_element(By.XPATH,
                            f'/html/body/div[2]/div/div/div/div/div/div[2]/div[1]/table/thead/tr/th[{CARED_index}]/div/div[1]/div/span[2]').text
        if CARED_tooltip == f"24시간 이내에 일반병동에서의 심정지 발생 위험도 예측 스코어 ({DB_policy})":
            pre_setting.create_file(self, save_folder, 'CARED 스코어 툴팁 확인', '/html/body/div[2]')
            result_count += 1
            print("CARED 컬럼 툴팁 확인 >> pass")
        else:
            print(CARED_tooltip)
            print("CARED 컬럼 툴팁 확인>> fail")
        time.sleep(1)

        if result_count == 1:
            result = True
            print("[대시보드 CARED 컬럼 툴팁 테스트 PASS]")
        else:
            result = False
            print("[대시보드 CARED 컬럼 툴팁 테스트 fail  (" + str(result_count) + "/1)]")

    def test_2_MAES_tooltip(self):
        main_path = setUp_folder(pre_setting.result_folder)
        save_folder = setUp_subfolder(main_path, '07. [TC_002_003] 대시보드 스코어 툴팁 확인')
        driver = self.driver
        result_count = 0
        pre_setting.user_login(self, pre_setting.admin_id, pre_setting.admin_pw)  # admin 로그인
        WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, '/html/body/div[2]/div/div/div/div/div/div[2]/div[2]/div/table'))
        )
        DB_policy = self.score_policy("MAES")
        MAES_index = self.column_index_find("MAES")  # MAES 인텍스 찾기
        MAES_column = driver.find_element(By.XPATH,
                                          f'/html/body/div[2]/div/div/div/div/div/div[2]/div[1]/table/thead/tr/th[{MAES_index}]/div/button/div/span')
        ActionChains(driver).move_to_element(MAES_column).perform()  # 마우스 호버
        MAES_tooltip = driver.find_element(By.XPATH,
                                           f'/html/body/div[2]/div/div/div/div/div/div[2]/div[1]/table/thead/tr/th[{MAES_index}]/div/div[1]/div/span[2]').text
        if MAES_tooltip == f"6시간 이내에 일반병동에서의 급성 중증이벤트(심정지, 예기치않은 ICU Transfer, 사망) 발생 위험도 예측 스코어 ({DB_policy})":
            pre_setting.create_file(self, save_folder, 'MAES 스코어 툴팁 확인', '/html/body/div[2]')
            result_count += 1
            print("MAES 컬럼 툴팁 확인 >> pass")
        else:
            print("MAES 컬럼 툴팁 확인>> fail")
        time.sleep(1)

        if result_count == 1:
            result = True
            print("[대시보드 MAES 컬럼 툴팁 테스트 PASS]")
        else:
            result = False
            print("[대시보드 MAES 컬럼 툴팁 테스트 fail  (" + str(result_count) + "/1)]")

    def test_3_SEPS_tooltip(self):
        main_path = setUp_folder(pre_setting.result_folder)
        save_folder = setUp_subfolder(main_path, '07. [TC_002_003] 대시보드 스코어 툴팁 확인')
        driver = self.driver
        result_count = 0
        pre_setting.user_login(self, pre_setting.admin_id, pre_setting.admin_pw)  # admin 로그인
        WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, '/html/body/div[2]/div/div/div/div/div/div[2]/div[2]/div/table'))
        )
        DB_policy = self.score_policy("SEPS")
        SEPS_index = self.column_index_find("SEPS")  # MAES 인텍스 찾기
        SEPS_column = driver.find_element(By.XPATH,
                                          f'/html/body/div[2]/div/div/div/div/div/div[2]/div[1]/table/thead/tr/th[{SEPS_index}]/div/button/div/span')
        ActionChains(driver).move_to_element(SEPS_column).perform()  # 마우스 호버
        SEPS_tooltip = driver.find_element(By.XPATH,
                                           f'/html/body/div[2]/div/div/div/div/div/div[2]/div[1]/table/thead/tr/th[{SEPS_index}]/div/div[1]/div/span[2]').text
        if SEPS_tooltip == f"4시간 이내에 일반병동에서의 패혈증 발생 위험도 예측 스코어 ({DB_policy})":
            pre_setting.create_file(self, save_folder, 'SEPS 스코어 툴팁 확인', '/html/body/div[2]')
            result_count += 1
            print("SEPS 컬럼 툴팁 확인 >> pass")
        else:
            print("SEPS 컬럼 툴팁 확인>> fail")
        time.sleep(1)

        if result_count == 1:
            result = True
            print("[대시보드 SEPS 컬럼 툴팁 테스트 PASS]")
        else:
            result = False
            print("[대시보드 SEPS 컬럼 툴팁 테스트 fail  (" + str(result_count) + "/1)]")

    def test_4_MORS_tooltip(self):
        main_path = setUp_folder(pre_setting.result_folder)
        save_folder = setUp_subfolder(main_path, '07. [TC_002_003] 대시보드 스코어 툴팁 확인')
        driver = self.driver
        result_count = 0
        pre_setting.user_login(self, pre_setting.admin_id, pre_setting.admin_pw)  # admin 로그인
        WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, '/html/body/div[2]/div/div/div/div/div/div[2]/div[2]/div/table'))
        )
        DB_policy = self.score_policy("MORS")
        MORS_index = self.column_index_find("MORS")  # MAES 인텍스 찾기
        MORS_column = driver.find_element(By.XPATH,
                                          f'/html/body/div[2]/div/div/div/div/div/div[2]/div[1]/table/thead/tr/th[{MORS_index}]/div/button/div/span')

        ActionChains(driver).move_to_element(MORS_column).perform()  # 마우스 호버
        MORS_tooltip = driver.find_element(By.XPATH,
                                           f'/html/body/div[2]/div/div/div/div/div/div[2]/div[1]/table/thead/tr/th[{MORS_index}]/div/div[1]/div/span[2]').text
        if MORS_tooltip == f"6시간 이내에 중환자실에서의 급성 상태악화(사망) 위험도 예측 스코어 ({DB_policy})":
            pre_setting.create_file(self, save_folder, 'MORS 스코어 툴팁 확인', '/html/body/div[2]')
            result_count += 1
            print("MORS 컬럼 툴팁 확인 >> pass")
        else:
            print("MORS 컬럼 툴팁 확인>> fail")
        time.sleep(1)

        if result_count == 1:
            result = True
            print("[대시보드 MORS 컬럼 툴팁 테스트 PASS]")
        else:
            result = False
            print("[대시보드 MORS 컬럼 툴팁 테스트 fail  (" + str(result_count) + "/1)]")

    def tearDown(self):  # 테스트 종료
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()