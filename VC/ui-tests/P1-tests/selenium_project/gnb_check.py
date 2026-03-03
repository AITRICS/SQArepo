"""
HPME 상단 GNB Menu 확인

"""

import unittest
from selenium.common import NoSuchElementException
from setup import setUp, setUp_folder, setUp_subfolder
from selenium.webdriver.common.by import By
from datetime import datetime, timezone, timedelta
# from setup import setUp_influxdb
# from influxdb_client import Point, WritePrecision
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from set_database import conn
import time
import pre_setting
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from urllib.parse import urlparse,urlunparse

class GNBCheckTest(unittest.TestCase):
    def setUp(self):
        self.driver = setUp(pre_setting.url)
        # _, self.write_api = setUp_influxdb()

    # def try_login(self,id,pw):#로그인 시도
    #     driver = self.driver
    #     pre_setting.user_login(self,id,pw) #로그인
    #
    #     try:  # 로그인 대기
    #         WebDriverWait(driver, 10).until(
    #             EC.visibility_of_element_located((By.XPATH, '//*[@id="table"]'))
    #         )
    #     except TimeoutError:
    #         print("Timeout")

    def GNB_check(self,name,menu_name):
        if menu_name==name:
            print(f"GNB {name} 노출 확인 > pass")
            check_result=1
        else:
            print(f"GNB {name} 노출 확인 > fail")
            check_result=0
        return check_result

    def url_lang_change(self, oldLang, newLang,lang_check,lang_result):
        driver = self.driver
        check_result = 0
        current_url = driver.current_url
        parsed_url = urlparse(current_url)
        new_path = parsed_url.path.replace(oldLang, newLang, 1)
        new_url = urlunparse(
            (parsed_url.scheme, parsed_url.netloc, new_path, parsed_url.params, parsed_url.query, parsed_url.fragment))
        driver.get(new_url)
        try:
            WebDriverWait(driver, 10).until(
                EC.visibility_of_element_located((By.XPATH, '/html/body/div[1]/div/div/div/div'))
            )
            lang_set = driver.find_element(By.XPATH, "/html/body/div[1]/nav/div[2]/button[1]/div/span")
            if lang_check == lang_set.text:
                check_result=1
                print(f"URL {lang_result} 설정 >> pass")
                # 스크린샷 저장
                # pre_setting.create_file(self,save_folder, '개인정보 동의 모달 확인', '/html/body')
            else:
                print(f"URL {lang_result}  설정 >> fail")
        except TimeoutError:
            print(f"URL {lang_result}  설정 >> fail")
            pass
        return check_result

    def test_GNB_check(self):

        # # 스크린샷 저장 폴더 경로 지정
        main_path = setUp_folder(pre_setting.result_folder)
        save_folder = setUp_subfolder(main_path, '06.[TC_002_002]HOME GNB 확인')
        driver = self.driver

        pre_setting.user_login(self,pre_setting.admin_id,pre_setting.admin_pw) #admin 로그인
        result_count=0

        #Screening, Report 메뉴 확인
        screening_menu=driver.find_element(By.XPATH,"/html/body/div[1]/nav/div[1]/a[1]").text #Screening 메뉴 확인
        gnb_check_result = self.GNB_check("Screening",screening_menu)
        time.sleep(2)
        result_count += gnb_check_result
        report_menu=driver.find_element(By.XPATH,"/html/body/div[1]/nav/div[1]/a[2]").text #Report 메뉴 확인
        gnb_check_result = self.GNB_check("Report",report_menu)
        time.sleep(2)
        result_count += gnb_check_result
        driver.find_element(By.XPATH, "/html/body/div[1]/nav/div[1]/a[2]").click() #Report 페이지 이동
        time.sleep(2)
        try:
            WebDriverWait(driver, 10).until(
             EC.visibility_of_element_located((By.XPATH,'/html/body/div[1]/div/div'))
            )
            result_count += 1
            print("Report 페이지 이동 >> pass")
            # 스크린샷 저장
            #pre_setting.create_file(self,save_folder, '개인정보 동의 모달 확인', '/html/body')
        except TimeoutError:
            print("Report 페이지 이동 >> fail")
            pass
        driver.find_element(By.XPATH, "/html/body/div[1]/nav/div[1]/a[1]").click() #Screening 페이지 이동
        time.sleep(3)

        # url 기본 언어 설정 확인
        lang_default = driver.execute_script("return navigator.language;") #한국어 ko-KR
        current_url = driver.current_url
        parsed_url = urlparse(current_url)
        path = parsed_url.path
        if lang_default=="ko-KR":
            if path.startswith("/ko"):
                result_count += 1
                print("기본 언어 설정 확인 >> pass")
            else:
                print("기본 언어 설정 확인 >> fail")
        #elif lang_default==""
            # if path.startswith("/en"):
            #     result_count += 1
            #     print("기본 언어 설정 확인 >> pass")
            # else:
            #     print("기본 언어 설정 확인 >> fail")

        #url로 언어 설정 변경
        gnb_check_result=self.url_lang_change("/ko","/en","English","영어")
        result_count += gnb_check_result
        time.sleep(3)
        # gnb_check_result = self.url_lang_change("/en", "/vn", "Tiếng Việt", "베트남어")
        # result_count += gnb_check_result
        # time.sleep(3)
        gnb_check_result = self.url_lang_change("/en", "/ko", "한국어", "한국어")
        result_count += gnb_check_result
        time.sleep(3)

        #언어 설정 메뉴 확인
        lang_menu = driver.find_element(By.XPATH, "/html/body/div[1]/nav/div[2]/button[1]/div/span").text  # 언어 설정 메뉴 확인
        lang_default=driver.execute_script("return navigator.language;")
        if lang_default=="ko-KR":
            lang_default="한국어"
        gnb_check_result = self.GNB_check(lang_default, lang_menu)
        result_count += gnb_check_result

        driver.find_element(By.XPATH, "/html/body/div[1]/nav/div[2]/button[1]/div/span").click()
        time.sleep(2)
        lang_menu_ko=driver.find_element(By.XPATH,"/html/body/div[4]/div/div[1]").text #한국어
        lang_menu_en=driver.find_element(By.XPATH,"/html/body/div[4]/div/div[2]").text #영어
        # lang_menu_va=driver.find_element(By.XPATH,"/html/body/div[4]/div/div[3]").text #베트남어
        gnb_check_result = self.GNB_check("한국어", lang_menu_ko)
        result_count += gnb_check_result
        gnb_check_result = self.GNB_check("English", lang_menu_en)
        result_count += gnb_check_result
        # gnb_check_result = self.GNB_check("Tiếng Việt", lang_menu_va)
        # result_count += gnb_check_result

        driver.find_element(By.XPATH, "/html/body/div[4]/div/div[2]").click() #영어 설정
        time.sleep(3)
        try:
            WebDriverWait(driver, 10).until(
                EC.visibility_of_element_located((By.XPATH, '/html/body/div[1]/div/div/div/div'))
            )
            lang_set_text = driver.find_element(By.XPATH, "/html/body/div[1]/nav/div[2]/button[1]/div/span").text
            current_url=driver.current_url
            parsed_url=urlparse(current_url)
            path=parsed_url.path
            if path.startswith("/en") and "English"==lang_set_text:
                result_count += 1
                print("영어 설정 >> pass")
                # 스크린샷 저장
                # pre_setting.create_file(self,save_folder, '개인정보 동의 모달 확인', '/html/body')
            else:
                print("영어 설정 >> fail")
        except TimeoutError:
            print("영어 설정 >> fail")
            pass
        # driver.find_element(By.XPATH, "/html/body/div[1]/nav/div[2]/button[1]/div/span").click()
        # driver.find_element(By.XPATH, "/html/body/div[4]/div/div[3]").click() #베트남어 설정
        # time.sleep(3)
        # try:
        #     WebDriverWait(driver, 10).until(
        #         EC.visibility_of_element_located((By.XPATH, '/html/body/div[1]/div/div/div/div'))
        #     )
        #     current_url = driver.current_url
        #     parsed_url = urlparse(current_url)
        #     path = parsed_url.path
        #     lang_set_text = driver.find_element(By.XPATH, "/html/body/div[1]/nav/div[2]/button[1]/div/span").text
        #     if path.startswith("/vn") and "Tiếng Việt"==lang_set_text:
        #         result_count += 1
        #         print("베트남어 설정 >> pass")
        #         # 스크린샷 저장
        #         # pre_setting.create_file(self,save_folder, '개인정보 동의 모달 확인', '/html/body')
        #     else:
        #         print("베트남어 설정 >> fail")
        # except TimeoutError:
        #     print("베트남어 설정 >> fail")
        #     pass
        driver.find_element(By.XPATH, "/html/body/div[1]/nav/div[2]/button[1]/div/span").click()
        driver.find_element(By.XPATH, "/html/body/div[4]/div/div[1]").click() #한국어 설정
        time.sleep(3)
        try:
            WebDriverWait(driver, 10).until(
                EC.visibility_of_element_located((By.XPATH, '/html/body/div[1]/div/div/div/div'))
            )
            current_url = driver.current_url
            parsed_url = urlparse(current_url)
            path = parsed_url.path
            lang_set_text = driver.find_element(By.XPATH, "/html/body/div[1]/nav/div[2]/button[1]/div/span").text
            if path.startswith("/ko") and "한국어" == lang_set_text:
                result_count += 1
                print("한국어 설정 >> pass")
                # 스크린샷 저장
                # pre_setting.create_file(self,save_folder, '개인정보 동의 모달 확인', '/html/body')
            else:
                print("한국어 설정 >> fail")
        except TimeoutError:
            print("한국어 설정 >> fail")
            pass

        #user 메뉴 확인
        user_menu=driver.find_element(By.XPATH,"/html/body/div[1]/nav/div[2]/button[2]").text # user 메뉴 확인
        gnb_check_result = self.GNB_check(pre_setting.admin_id,user_menu)
        result_count += gnb_check_result

        driver.find_element(By.XPATH, "/html/body/div[1]/nav/div[2]/button[2]").click()
        time.sleep(3)
        setting_menu=driver.find_element(By.XPATH,"/html/body/div[4]/div/div[1]").text # 설정 메뉴 확인
        logout_menu=driver.find_element(By.XPATH,"/html/body/div[4]/div/div[2]").text # 로그아웃 메뉴 확인
        gnb_check_result = self.GNB_check("설정", setting_menu)
        result_count += gnb_check_result
        gnb_check_result = self.GNB_check("로그아웃", logout_menu)
        result_count += gnb_check_result

        driver.find_element(By.XPATH, '/html/body/div[4]/div/div[1]').click() # 설정 페이지 이동
        time.sleep(3)
        try:
            WebDriverWait(driver, 10).until(
             EC.visibility_of_element_located((By.XPATH,'/html/body/div[1]/div/div[2]/div'))
            )
            result_count += 1
            print("설정 페이지 이동 >> pass")
            # 스크린샷 저장
            #pre_setting.create_file(self,save_folder, '개인정보 동의 모달 확인', '/html/body')
        except TimeoutError:
            print("Timeout")
            print("설정 페이지 이동 >> fail")
            pass

        driver.find_element(By.XPATH, '/html/body/div[1]/nav/div[1]/a[1]').click()  #Screening 페이지 이동
        time.sleep(3)
        try:
            WebDriverWait(driver, 10).until(
                EC.visibility_of_element_located((By.XPATH, '/html/body/div[1]/div/div/div/div'))
            )
            result_count += 1
            print("Screening 페이지 이동 >> pass")
            # 스크린샷 저장
            # pre_setting.create_file(self,save_folder, '개인정보 동의 모달 확인', '/html/body')
        except TimeoutError:
            print("Timeout")
            print("Screening 페이지 이동 >> fail")
            pass

        if result_count == 16:
            result = True
            print("[HOME GNB 매뉴 확인 PASS]")
        else:
            result = False
            print("[HOME GNB 매뉴 확인 FAIL  (" + str(result_count) + "/16)]")


    def tearDown(self): #테스트 종료
        #cur = conn.cursor() # 다음 테스트를 위한 오류 횟수 초기화
        #cur.execute("UPDATE vitalcare.accounts_user SET incorrect_password_tries =0, role='ROLE_TYPE_MEMBER' WHERE username='uitest01'")
        #conn.commit()
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()