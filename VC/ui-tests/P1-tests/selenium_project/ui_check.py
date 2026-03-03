"""
로그인 페이지 구성 확인
https://aitrics.atlassian.net/browse/VQ-328
"""

import unittest
from selenium.common import NoSuchElementException
from setup import setUp, setUp_folder,setUp_subfolder
from selenium.webdriver.common.by import By
from datetime import datetime, timezone, timedelta
# from influxdb_client import Point, WritePrecision
# from setup import setUp_influxdb,
import time
import pre_setting
import os


class UICheckTest(unittest.TestCase):
    def setUp(self):
        print("2. 로그인 화면 UI 테스트===========================================>")
        self.driver=setUp(pre_setting.url)
        # _, self.write_api = setUp_influxdb()

    # def create_file(self, sf, filename, elements):
    #     driver = self.driver
    #     now = datetime.now()
    #     timestamp = now.strftime("%Y-%m-%d_%H%M%S")
    #     filename = os.path.join(sf, f'{filename}_{timestamp}.png')
    #     driver.find_element(By.XPATH, elements).screenshot(filename)

    def ui_text_check(self,url,text,att):
        driver=self.driver
        if att=='alt'or att=='placeholder':
            placeholder = driver.find_element(By.XPATH, url)
            element = placeholder.get_attribute(att)
        elif att=='version':
            ver_path=driver.find_element(By.XPATH,url)
            element = driver.execute_script(
                            "return document.evaluate('text()[3]', arguments[0], null, XPathResult.STRING_TYPE, null).stringValue;",
                            ver_path)
        else:
            element = driver.find_element(By.XPATH, url).text

        if element == text:
            print(text+" 확인 >> pass")
            result = 1
        else:
            print(text+" 확인 >> fail")
            result = 0
        return result

    def ui_find_check(self,url,name):
        driver = self.driver
        try:
            driver.find_element(By.XPATH, url)
            print(name+" 확인 >> pass")
            result = 1
        except NoSuchElementException:
            print(name + " 확인 >> fail")
            result = 0
        return result

    def test_ui_elements(self):
        # 테스트 결과 저장할 폴더 경로
        #exe_path = setUp_folder()
        # 스크린샷 저장 폴더 경로 지정
        main_path = setUp_folder(pre_setting.result_folder)
        save_folder = setUp_subfolder(main_path, '02. [TC_002_001] 로그인 페이지 UI 확인')
        # save_folder = os.path.join(exe_path, '02. [TC_002_001] 로그인 페이지 UI 확인')
        # # 폴더 존재 확인 및 생성
        # if not os.path.exists(save_folder):
        #     os.makedirs(save_folder)
        result_count = 0
        start_time = time.time()

        time.sleep(3)


        #제품로고
        # 스크린샷 저장
        result=self.ui_text_check("/html/body/div[2]/div/div[1]/img","logo_large","alt")
        pre_setting.create_file(self,save_folder, '제품 로고 확인', '/html/body/div[2]/div/div[1]')
        result_count += result
        #ID
        result = self.ui_text_check("/html/body/div[2]/div/form/fieldset/div[1]/div/input", "ID", "placeholder")
        # 스크린샷 저장
        pre_setting.create_file(self,save_folder, 'ID input 필드 확인', '/html/body/div[2]/div/form/fieldset/div[1]/div/input')
        result_count += result
        #PW
        result = self.ui_text_check("/html/body/div[2]/div/form/fieldset/div[2]/div/input", "비밀번호", "placeholder")
        # 스크린샷 저장
        pre_setting.create_file(self,save_folder, 'PW input 필드 확인', '/html/body/div[2]/div/form/fieldset/div[2]/div/input')
        result_count += result
        #비밀번호 표시
        result=self.ui_find_check("/html/body/div[2]/div/form/fieldset/div[3]/div/button","비밀번호 표시 체크박스")
        # 스크린샷 저장
        pre_setting.create_file(self,save_folder, ' 비밀번호 표시 체크박스 확인', '/html/body/div[2]/div/form/fieldset/div[3]/div/button')
        result_count += result
        #로그인 버튼
        result = self.ui_find_check("/html/body/div[2]/div/form/fieldset/button","로그인 버튼")
        # 스크린샷 저장
        pre_setting.create_file(self,save_folder, '로그인 버튼 확인', '/html/body/div[2]/div/form/fieldset/button')
        result_count += result
        #계정 생성 버튼
        result = self.ui_find_check("/html/body/div[2]/div/button","계정 생성 버튼")
        # 스크린샷 저장
        pre_setting.create_file(self,save_folder, '계정 생성 버튼 확인', '/html/body/div[2]/div/button')
        result_count += result
        #시스템 알림 메시지
        result = self.ui_find_check("/html/body/div[2]/div/div[2]", "시스템 사용 알림 메시지")
        # 스크린샷 저장
        pre_setting.create_file(self, save_folder, '시스템 사용 알림 메시지', '/html/body/div[2]/div/div[2]')
        result_count += result

        # #제품명
        # result=self.ui_text_check("/html/body/div[1]/div[2]/div/div[1]/span[1]","AITRICS-VC",None)
        # # 스크린샷 저장
        # pre_setting.create_file(self,save_folder, '제품명 확인', '/html/body/div[1]/div[2]/div/div[1]/span[1]')
        # result_count += result
        # #버전
        # result = self.ui_text_check("/html/body/div[1]/div[2]/div/div[1]/span[2]", "v2.1.0-alpha2",'version')
        # # 스크린샷 저장
        # pre_setting.create_file(self,save_folder, '버전 확인', '/html/body/div[1]/div[2]/div/div[1]/span[2]')
        # result_count += result
        # #허가번호
        # result = self.ui_text_check("/html/body/div[1]/div[2]/div/div[2]/span[1]", "제허 22-723호",None)
        # # 스크린샷 저장
        # pre_setting.create_file(self,save_folder, '허가번호 확인', '/html/body/div[1]/div[2]/div/div[2]/span[1]')
        # result_count += result
        # #규제메세지
        # result = self.ui_text_check("/html/body/div[1]/div[2]/div/div[2]/span[2]", "본 제품은 의료기기 임",None)
        # # 스크린샷 저장
        # pre_setting.create_file(self,save_folder, '규제메세지 확인', '/html/body/div[1]/div[2]/div/div[2]/span[2]')
        # result_count += result
        #UI 테스트 시간
        end_time = time.time()
        run_time = end_time - start_time

        if result_count == 7:
            result = True
            print("[로그인 UI PASS]")
        else:
            result = False
            print("[로그인 UI FAIL  (" +str(result_count)+"/7)]")

        # pre_setting.record_result(result, run_time, 'Login UI check')

    # def record_result(self, test_method,run_time,test_name):#결과 DB 저장
    #     test_status = 'pass' if test_method else 'fail' #테스트 결과가 True->pass, False->fail
    #
    #     utc_now = datetime.now(timezone.utc)
    #     kst_now = utc_now + timedelta(hours=9)
    #
    #     test_result = (Point("unittest_results")#테이블명
    #                    .field("test_name", test_name)#테스트이름
    #                    .field("status", test_status)#테스트결과
    #                     .field("run_time",run_time)#테스트 경과 시간
    #                    .time(kst_now, WritePrecision.NS))
    #     self.write_api.write(bucket="AUTO_UI_TEST", record=test_result)

    def tearDown(self): #테스트 종료
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()