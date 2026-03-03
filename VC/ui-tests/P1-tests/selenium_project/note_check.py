import unittest
from setup import setUp,setUp_folder,setUp_subfolder
# from setup import setUp_influxdb
# from influxdb_client import Point, WritePrecision
from datetime import datetime, timezone, timedelta
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import pre_setting
import time,re, random
from selenium.webdriver.common.keys import Keys
import random

class NoteTest(unittest.TestCase):
    def setUp(self):
        print("6. 대시보드 노트 테스트=========================================>")
        self.driver = setUp(pre_setting.url)
        # _, self.write_api = setUp_influxdb()

    def get_note_count(self):
        note_count_xpath = "/html/body/div[5]/div/div[2]/span"
        driver= self.driver
        try:
            WebDriverWait(driver, 10).until(
                EC.visibility_of_element_located((By.XPATH, '/html/body/div[5]/div/div[2]/span'))
            )
        except:
            pass
        text = driver.find_element(By.XPATH, note_count_xpath).text

        note_count = int(text.split(" ")[1].strip())
        return note_count #note 개수 return
    def note_column_index(self):
        driver = self.driver

        headers = driver.find_elements(By.XPATH, "/html/body/div[2]/div/div/div/div/div/div[2]/div[1]/table/thead/tr/th")
        note_column_index = None
        for index, header in enumerate(headers, start=1):  # note 컬럼 찾기
            if header.text.strip() == "Note":
                note_column_index = index
                break
        return note_column_index

    def note_create(self,save_folder):
        driver=self.driver
        table_xpath = '/html/body/div[2]/div/div/div/div/div/div[2]/div[2]/div/table'
        note_column_index=self.note_column_index()
        note_xpath = f"{table_xpath}/tbody/tr[1]/td[{note_column_index}]/button"
        note_button = driver.find_element(By.XPATH, note_xpath)
        note_button.click() # Note 클릭
        try: # note 창 대기
            WebDriverWait(driver, 10).until(
                EC.visibility_of_element_located((By.XPATH, '/html/body/div[5]/div'))
            )
            time.sleep(0.5)
        except:
            pass

        while True:
            time.sleep(1)
            current_count = self.get_note_count()
            if current_count >= 100: #100개 이상이면 종료
                break

            note_inputbox = driver.find_element(By.XPATH,"/html/body/div[5]/div/div[3]/form/div/div[1]/textarea")
            note_inputbox.clear()
            note_inputbox.send_keys(f"{current_count+1}") # 노트 내용 입력

            save_button = driver.find_element(By.XPATH,"/html/body/div[5]/div/div[3]/form/button")
            save_button.click() # 저장 버튼 클릭
            try:
                WebDriverWait(driver, 10).until(
                    EC.visibility_of_element_located((By.XPATH, '/html/body/div[5]/div/div[3]/ul'))
                )
            except:
                print("Note 저장 실패")

    def test_1_note_max(self):
        driver = self.driver
        result_count = 0
        main_path = setUp_folder(pre_setting.result_folder)
        save_folder = setUp_subfolder(main_path, '06. [TC_002_003] 노트 저장')


        pre_setting.user_login(self, pre_setting.admin_id, pre_setting.admin_pw)  # admin 로그인

        driver.find_element(By.XPATH, f'//html/body/div[2]/div/div/ul/li[1]/a').click()  # screened 클릭
        time.sleep(3)
        tab_name = driver.find_element(By.XPATH, f'/html/body/div[2]/div/div/ul/li[1]/a').text

        self.note_create(save_folder)  # 노트 100개 생성

        current_count = self.get_note_count()
        driver.find_element(By.XPATH, '/html/body/div[5]/div/div[3]/form/div/div[1]/textarea').send_keys(f"{current_count+1}") #101번째 노트 입력
        driver.find_element(By.XPATH, '/html/body/div[5]/div/div[3]/form/button').click() #101번째 노트 저장 버튼 클릭
        try:
            WebDriverWait(driver, 10).until(
                EC.visibility_of_element_located((By.XPATH, '/html/body/div[5]/div/div[3]/form/div[2]/div'))
            )
            pre_setting.create_file(self, save_folder, f'{tab_name} 노트 용량 초과 얼럿', '/html/body/div[5]')
            result_count += 1
        except:
            print("저장 용량 초과 얼럿 미노출")
        driver.find_element(By.XPATH, '/html/body/div[5]/div/div[3]/form/div[2]/div/button[2]').click() #아니오 버튼 클릭

        driver.find_element(By.XPATH, '/html/body/div[5]/div/div[3]/form/button').click()  # 101번째 노트 저장 버튼 클릭
        time.sleep(1)

        driver.find_element(By.XPATH, '/html/body/div[5]/div/div[3]/form/div[2]/div/button[1]').click() #예 버튼 클릭
        time.sleep(1)
        pre_setting.create_file(self, save_folder, f'{tab_name} 101번째 노트 저장', '/html/body/div[5]')

        last_note = driver.find_element(By.XPATH,"/html/body/div[5]/div/div[3]/ul/li[1]/article/p").text
        note_count_xpath = driver.find_element(By.XPATH, '/html/body/div[5]/div/div[2]/span').text
        note_count = int(note_count_xpath.split(" ")[1].strip())

        if last_note == '101':
            if note_count == 100:
                result_count += 1
                print(f"{tab_name} 노트 용량 초과 저장 얼럿 확인 >> pass")

        driver.find_element(By.XPATH,'/html/body/div[5]/div/div[1]/button').click() # 노트 닫기 버튼 클릭

        if result_count == 2:
            result = True
            print("[노트 용량 초과 저장 PASS]")
        else:
            result = False
            print("[노트 용량 초과 저장 fail  ("+str(result_count)+"/2)]")

    def test_2_note_insert(self):
        driver = self.driver
        result_count = 0
        pre_setting.user_login(self, pre_setting.admin_id, pre_setting.admin_pw)  # admin 로그인
        main_path = setUp_folder(pre_setting.result_folder)
        save_folder = setUp_subfolder(main_path, '06. [TC_002_003] 노트 저장')
        table_xpath = '/html/body/div[2]/div/div/div/div/div/div[2]/div[2]/div/table'
        note_column_index = self.note_column_index() #노트 컬럼 인텍스 찾기

        driver.find_element(By.XPATH, f'/html/body/div[2]/div/div/ul/li[1]/a').click()  # screened 클릭
        time.sleep(3)
        tab_name = driver.find_element(By.XPATH, f'/html/body/div[2]/div/div/ul/li[1]/a').text

        note_xpath = f"{table_xpath}/tbody/tr[1]/td[{note_column_index}]/button"
        note_button = driver.find_element(By.XPATH, note_xpath)
        note_button.click()  # Note 클릭
        try:  # note 창 대기
            WebDriverWait(driver, 10).until(
                EC.visibility_of_element_located((By.XPATH, '/html/body/div[5]/div'))
            )
            time.sleep(0.5)
        except:
            pass

        current_count = self.get_note_count()
        if current_count >= 100: #노트가 100건 이상인 경우 1건 삭제하기
            driver.find_element(By.XPATH,
                                '/html/body/div[5]/div/div[3]/ul/li[1]/article/header/div[2]/button[2]').click()  # 삭제 버튼 클릭
            time.sleep(0.5)
            driver.find_element(By.XPATH,
                                '/html/body/div[5]/div/div[3]/ul/li[1]/article/header/div[2]/div/div/button[1]').click()  # 노트 삭제
            time.sleep(0.5)

        save_button = driver.find_element(By.XPATH,'/html/body/div[5]/div/div[3]/form/button')
        if not save_button.is_enabled():
            pre_setting.create_file(self, save_folder, '저장 버튼 비활성화', '/html/body/div[5]')
            result_count += 1
            print(f"{tab_name} 노트 입력 전 저장 버튼 비활성화 >> pass")
        else:
            print(f"{tab_name} 노트 입력 전 저장 버튼 비활성화 >> fail")
        time.sleep(1)

        insert_300_text = "123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890"
        note_textbox=driver.find_element(By.XPATH, '/html/body/div[5]/div/div[3]/form/div/div[1]/textarea')

        note_textbox.send_keys(insert_300_text) #노트 300자 입력
        if save_button.is_enabled():
            pre_setting.create_file(self, save_folder, '저장 버튼 활성화', '/html/body/div[5]')
            result_count += 1
            print(f"{tab_name} 노트 입력 후 저장 버튼 활성화 >> pass")
        else:
            print(f"{tab_name} 노트 입력 후 저장 버튼 활성화 >> fail")
        time.sleep(1)

        insert_301_text = insert_300_text + "1"
        note_textbox.send_keys(insert_301_text) #노트 301자 입력
        time.sleep(1)

        text_check=note_textbox.get_attribute("value")
        if text_check == insert_300_text:
            pre_setting.create_file(self, save_folder, '300자 초과 입력 불가', '/html/body/div[5]')
            result_count += 1
            print(f"{tab_name} 노트 300자 초과 입력 불가 >> pass")
        else:
            print(f"{tab_name} 노트 300자 초과 입력 불가 >> fail")
        time.sleep(1)

        note_textbox.clear()
        note_textbox.send_keys(" ")
        note_textbox.send_keys(Keys.BACKSPACE)

        if not save_button.is_enabled():
            pre_setting.create_file(self, save_folder, '입력 삭제 후 저장 버튼 비활성화', '/html/body/div[5]')
            result_count += 1
            print(f"{tab_name} 노트 입력 삭제 후 저장 버튼 비활성화 >> pass")
        else:
            print(f"{tab_name} 노트 입력 삭제 후 저장 버튼 비활성화 >> fail")

        note_textbox.send_keys("1") #노트에 1 입력
        save_button.click() #저장 버튼 클릭
        time.sleep(0.5)
        first_note=None
        if self.get_note_count() > 1:
            first_note=driver.find_element(By.XPATH,'/html/body/div[5]/div/div[3]/ul/li[1]/article/p').text
        elif self.get_note_count() == 1:
            first_note=driver.find_element(By.XPATH,'/html/body/div[5]/div/div[3]/ul/li/article/p').text

        if first_note == "1":
            pre_setting.create_file(self, save_folder, '저장 노트 최상단 표시', '/html/body/div[5]')
            result_count += 1
            print(f"{tab_name} 저장 노트 최상단 표시 >> pass")
        else:
            print(f"{tab_name} 저장 노트 최상단 표시 >> fail")

        driver.find_element(By.XPATH,'/html/body/div[5]/div/div[3]/ul/li/article/header/div[2]/button[1]').click() #수정 버튼 클릭
        time.sleep(0.5)
        edit_textbox = driver.find_element(By.XPATH,
                                           '/html/body/div[5]/div/div[3]/ul/li/article/form/div[1]/div/textarea')

        driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'start'});", edit_textbox)
        time.sleep(1)
        edit_save_button = driver.find_element(By.XPATH,
                                               '/html/body/div[5]/div/div[3]/ul/li/article/form/div[2]/button[2]')
        edit_textbox.clear() #text 지우기
        time.sleep(0.5)
        edit_textbox.send_keys(insert_300_text)  # 노트 300자 입력
        if edit_save_button.is_enabled():
            pre_setting.create_file(self, save_folder, '노트 수정 입력 후 저장 버튼 활성화', '/html/body/div[5]')
            result_count += 1
            print(f"{tab_name} 노트 수정 입력 후 저장 버튼 활성화 >> pass")
        else:
            print(f"{tab_name} 노트 수정 입력 후 저장 버튼 활성화 >> fail")
        time.sleep(1)

        edit_textbox.send_keys(insert_301_text)  # 노트 301자 입력
        time.sleep(1)

        text_check = edit_textbox.get_attribute("value")
        if text_check == insert_300_text:
            result_count += 1
            pre_setting.create_file(self, save_folder, '노트 수정 300자 초과 입력 불가', '/html/body/div[5]')
            print(f"{tab_name} 노트 수정 300자 초과 입력 불가 >> pass")
        else:
            print(f"{tab_name} 노트 수정 300자 초과 입력 불가 >> fail")
        time.sleep(1)

        driver.find_element(By.XPATH,'/html/body/div[5]/div/div[1]/button').click() #note 닫기 버튼 클릭

        if result_count == 7:
            result = True
            print("[노트 저장 PASS]")
        else:
            result = False
            print("[노트 저장 fail  ("+str(result_count)+"/7)]")


    def test_3_note_popup(self):
        driver=self.driver
        result_count = 0
        pre_setting.user_login(self, pre_setting.admin_id, pre_setting.admin_pw)  # admin 로그인
        main_path = setUp_folder(pre_setting.result_folder)
        save_folder = setUp_subfolder(main_path, '06. [TC_002_003] 노트 저장')

        table_xpath = '/html/body/div[2]/div/div/div/div/div/div[2]/div[2]/div/table'
        note_column_index = self.note_column_index()  # 노트 컬럼 인텍스 찾기
        # for i in range(1, 4):  # screening tab menu
        driver.find_element(By.XPATH, f'/html/body/div[2]/div/div/ul/li[1]/a').click()  # screened 클릭
        time.sleep(3)
        WebDriverWait(driver, 30).until(
            EC.visibility_of_element_located((By.XPATH, '/html/body/div[2]/div/div/div/div/div/div[2]/div[2]/div/table/tbody'))
        )
        tab_name = driver.find_element(By.XPATH, f'/html/body/div[2]/div/div/ul/li[1]/a').text


        note_xpath = f"{table_xpath}/tbody/tr[1]/td[{note_column_index}]/button"
        note_button = driver.find_element(By.XPATH, note_xpath)
        note_button.click()  # Note 클릭
        time.sleep(1)
        insert_text="test"
        note_textbox = driver.find_element(By.XPATH, '/html/body/div[5]/div/div[3]/form/div/div[1]/textarea')
        note_textbox.send_keys(insert_text)
        time.sleep(1)
        driver.find_element(By.XPATH, '/html/body/div[5]/div/div[1]/button').click()  # note 닫기 버튼 클릭
        time.sleep(1)
        close_text_h1 = driver.find_element(By.XPATH,'/html/body/div[5]/div/div[3]/form/div[2]/div/h1').text
        close_text_h2 = driver.find_element(By.XPATH,'/html/body/div[5]/div/div[3]/form/div[2]/div/h2').text

        if close_text_h1 == "노트를 저장하지 않았습니다.":
            if close_text_h2 == "작성한 노트를 저장하지 않겠습니까?":
                pre_setting.create_file(self, save_folder, f'{tab_name} 노트 입력 중 닫기 팝업', '/html/body/div[5]')
                result_count += 1
                print(f"{tab_name} 노트 입력 중 닫기 팝업 >> pass")
            else:
                print(f"{tab_name} 노트 입력 중 닫기 팝업 >> fail")
            time.sleep(1)

        driver.find_element(By.XPATH, '/html/body/div[5]/div/div[3]/form/div[2]/div/button[2]').click() #아니오 버튼 클릭
        if insert_text == note_textbox.get_attribute("value"):
            result_count += 1
            pre_setting.create_file(self, save_folder, f'{tab_name} 노트 입력 내용 유지', '/html/body/div[5]')
            print(f"{tab_name} 노트 입력 내용 유지 >> pass")
        else:
            print(f"{tab_name} 노트 입력 내용 유지 >> fail")
        time.sleep(1)

        before_count = self.get_note_count() # 노트 닫기 전 카운트
        driver.find_element(By.XPATH, '/html/body/div[5]/div/div[1]/button').click()  # note 닫기 버튼 클릭
        time.sleep(0.5)
        driver.find_element(By.XPATH, '/html/body/div[5]/div/div[3]/form/div[2]/div/button[1]').click()  # 예 버튼 클릭
        time.sleep(0.5)
        note_button.click()  # Note 클릭
        time.sleep(1)
        after_count = self.get_note_count() #노트 닫은 후 카운트

        if before_count == after_count:
            result_count += 1
            pre_setting.create_file(self, save_folder, f'{tab_name} 노트 저장하지 않고 닫기', '/html/body/div[5]')
            print(f"{tab_name} 노트 저장되지 않음 >> pass")
        else:
            print(f"{tab_name} 노트 저장되지 않음 >> fail")

        driver.find_element(By.XPATH, '/html/body/div[5]/div/div[1]/button').click()  # note 닫기 버튼 클릭

        if result_count == 3:
            result = True
            print("[노트 작성중 닫기 팝업 PASS]")
        else:
            result = False
            print("[노트 작성중 닫기 팝업 fail  ("+str(result_count)+"/3)]")

    def test_4_edit_popup(self):
        driver = self.driver
        result_count = 0
        pre_setting.user_login(self, pre_setting.admin_id, pre_setting.admin_pw)  # admin 로그인
        main_path = setUp_folder(pre_setting.result_folder)
        save_folder = setUp_subfolder(main_path, '06. [TC_002_003] 노트 저장')

        table_xpath = '/html/body/div[2]/div/div/div/div/div/div[2]/div[2]/div/table'
        note_column_index = self.note_column_index()  # 노트 컬럼 인텍스 찾기

        driver.find_element(By.XPATH, f'/html/body/div[2]/div/div/ul/li[1]/a').click()  # screened 클릭
        time.sleep(3)
        tab_name = driver.find_element(By.XPATH, f'/html/body/div[2]/div/div/ul/li[1]/a').text

        note_xpath = f"{table_xpath}/tbody/tr[1]/td[{note_column_index}]/button"
        note_button = driver.find_element(By.XPATH, note_xpath)
        # note_button.click()  # Note 클릭
        # time.sleep(1)

        i = 1
        while True:  # 노트가 100건이 아닌 환자 찾기
            # 다른 환자 노트 열기
            note_xpath = f"{table_xpath}/tbody/tr[{i}]/td[{note_column_index}]/button"
            driver.find_element(By.XPATH, note_xpath).click() #노트 클릭
            time.sleep(2)

            if self.get_note_count() == 100:
                # 노트 닫고 반복 종료
                driver.find_element(By.XPATH, '/html/body/div[5]/div/div[1]/button').click()
                i += 1
            else:
                break

        time.sleep(2)

        insert_text = "test"
        note_textbox = driver.find_element(By.XPATH, '/html/body/div[5]/div/div[3]/form/div/div[1]/textarea')
        note_textbox.send_keys(insert_text) # 신규 노트 입력
        time.sleep(1)
        save_button = driver.find_element(By.XPATH, "/html/body/div[5]/div/div[3]/form/button")
        save_button.click()  # 저장 버튼 클릭
        time.sleep(1)

        insert_text = "new" #신규 노트 입력
        note_textbox = driver.find_element(By.XPATH, '/html/body/div[5]/div/div[3]/form/div/div[1]/textarea')
        note_textbox.send_keys(insert_text)
        time.sleep(1)

        driver.find_element(By.XPATH,
                            '/html/body/div[5]/div/div[3]/ul/li[1]/article/header/div[2]/button[1]').click()  # 수정 버튼 클릭
        time.sleep(0.5)
        edit_textbox = driver.find_element(By.XPATH,
                                           '/html/body/div[5]/div/div[3]/ul/li/article/form/div[1]/div/textarea')
        edit_textbox.clear()
        insert_edittext = "edit" # 수정 텍스트 입력
        edit_textbox.send_keys(insert_edittext)
        time.sleep(1)

        driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'start'});", edit_textbox)
        time.sleep(1)
        edit_save_button = driver.find_element(By.XPATH,
                                               '/html/body/div[5]/div/div[3]/ul/li/article/form/div[2]/button[2]')
        edit_save_button.click() # 수정 저장 클릭
        time.sleep(1)

        first_note = driver.find_element(By.XPATH,'/html/body/div[5]/div/div[3]/ul/li/article/p').text
        if first_note == insert_edittext:
            pre_setting.create_file(self, save_folder, '노트 수정 저장', '/html/body/div[5]')
            result_count += 1
            print(f"{tab_name} 노트 수정 저장 >> pass")
        else:
            print(f"{tab_name} 노트 수정 저장 >> fail")

        driver.find_element(By.XPATH,
                            '/html/body/div[5]/div/div[3]/ul/li/article/header/div[2]/button[2]').click()  # 삭제 버튼 클릭
        time.sleep(0.5)

        driver.find_element(By.XPATH,
                            '/html/body/div[5]/div/div[3]/ul/li/article/header/div[2]/div/div/button[1]').click() #삭제 확인
        time.sleep(0.5)


        if note_textbox.get_attribute("value") == insert_text :
            pre_setting.create_file(self, save_folder, '노트 입력값 유지', '/html/body/div[5]')
            result_count += 1
            print(f"{tab_name} 노트 입력값 유지 >> pass")
        else:
            print(f"{tab_name} 노트 입력값 유지 >> fail")

        if self.get_note_count() == 0:
            no_note = driver.find_element(By.XPATH,'/html/body/div[5]/div/div[3]/div/div').text
            if no_note == "작성된 노트가 없습니다.":
                pre_setting.create_file(self, save_folder, '작성된 노트 없음', '/html/body/div[5]')
                result_count += 1
                print(f"{tab_name} 노트 삭제 >> pass")
            else:
                print(f"{tab_name} 노트 삭제 >> fail")
        else:
            first_note=driver.find_element(By.XPATH,'/html/body/div[5]/div/div[3]/ul/li/article/p').text
            if first_note != insert_edittext:
                pre_setting.create_file(self, save_folder, '작성된 노트 없음', '/html/body/div[5]')
                result_count += 1
                print(f"{tab_name} 노트 삭제 >> pass")
            else:
                print(f"{tab_name} 노트 삭제 >> fail")

        note_textbox.clear()
        driver.find_element(By.XPATH, '/html/body/div[5]/div/div[1]/button').click()  # note 닫기 버튼 클릭

        if result_count == 3:
            result = True
            print("[노트 작성중 닫기 팝업 PASS]")
        else:
            result = False
            print("[노트 작성중 닫기 팝업 fail  (" + str(result_count) + "/3)]")

    def test_5_edit_date(self):
        driver = self.driver
        result_count = 0
        pre_setting.user_login(self, pre_setting.admin_id, pre_setting.admin_pw)  # admin 로그인
        main_path = setUp_folder(pre_setting.result_folder)
        save_folder = setUp_subfolder(main_path, '06. [TC_002_003] 노트 저장')
        num = random.randint(100, 999)
        table_xpath = '/html/body/div[2]/div/div/div/div/div/div[2]/div[2]/div/table'
        note_column_index = self.note_column_index()  # 노트 컬럼 인텍스 찾기

        driver.find_element(By.XPATH, f'/html/body/div[2]/div/div/ul/li[1]/a').click()  # screened 클릭
        time.sleep(3)
        tab_name = driver.find_element(By.XPATH, f'/html/body/div[2]/div/div/ul/li[1]/a').text

        note_xpath = f"{table_xpath}/tbody/tr[1]/td[{note_column_index}]/button"
        note_button = driver.find_element(By.XPATH, note_xpath)
        # note_button.click()  # Note 클릭
        time.sleep(1)

        i = 1
        while True: #노트가 99건 이상이 아닌 환자 찾기
            # 다른 환자 노트 열기
            note_xpath = f"{table_xpath}/tbody/tr[{i}]/td[{note_column_index}]/button"
            driver.find_element(By.XPATH, note_xpath).click() #노트 클릭
            time.sleep(2)

            if self.get_note_count() > 98:
                # 노트 닫고 반복 종료
                driver.find_element(By.XPATH, '/html/body/div[5]/div/div[1]/button').click()
                i += 1
            else:
                break
        time.sleep(2)

        note_textbox = driver.find_element(By.XPATH, '/html/body/div[5]/div/div[3]/form/div/div[1]/textarea')
        note_textbox.send_keys("test"+str(num)) # 신규 노트1 저장
        driver.find_element(By.XPATH, "/html/body/div[5]/div/div[3]/form/button").click()
        time.sleep(1)

        note_textbox = driver.find_element(By.XPATH, '/html/body/div[5]/div/div[3]/form/div/div[1]/textarea')
        note_textbox.send_keys("test"+str(num+1))  # 신규 노트2 저장
        driver.find_element(By.XPATH, "/html/body/div[5]/div/div[3]/form/button").click()
        time.sleep(1)

        first_note = '/html/body/div[5]/div/div[3]/ul/li[2]/article'
        second_note = '/html/body/div[5]/div/div[3]/ul/li[1]/article'
        old_text = driver.find_element(By.XPATH,f'{first_note}/p').text

        driver.find_element(By.XPATH,
                            f'{first_note}/header/div[2]/button[1]').click()  # 수정 버튼 클릭
        time.sleep(0.5)
        old_note_info = driver.find_element(By.XPATH,
                                            f'{first_note}/header/div[1]/time').text

        edit_textbox = driver.find_element(By.XPATH,
                                           f'{first_note}/form/div[1]/div/textarea')
        edit_textbox.clear()
        insert_edittext = "edit"+str(num)  # 수정 텍스트 입력
        edit_textbox.send_keys(insert_edittext)
        time.sleep(1)

        driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'start'});", edit_textbox)
        time.sleep(1)

        edit_save_button = driver.find_element(By.XPATH,
                                               f'{first_note}/form/div[2]/button[2]')
        if edit_save_button.is_enabled(): #노트 수정
            pre_setting.create_file(self, save_folder, '노트 수정 저장 버튼 활성화', '/html/body/div[5]')
            result_count += 1
            print(f"{tab_name} 노트 수정 저장 버튼 활성화 >> pass")
        else:
            print(f"{tab_name} 노트 수정 저장 버튼 활성화 >> fail")

        edit_textbox.clear()
        edit_textbox.send_keys(old_text) #노트 수정 전 내용으로 변경
        time.sleep(1)
        if not edit_save_button.is_enabled():
            pre_setting.create_file(self, save_folder, '노트 수정전으로 변경 저장 버튼 비활성화', '/html/body/div[5]')
            result_count += 1
            print(f"{tab_name} 노트 수정 저장 버튼 비활성화 >> pass")
        else:
            print(f"{tab_name} 노트 수정 저장 버튼 비활성화 >> fail")

        edit_textbox.clear() # 노트 내용 모두 삭제
        time.sleep(1)
        if not edit_save_button.is_enabled():
            pre_setting.create_file(self, save_folder, '노트 수정 내용 삭제 저장 버튼 활성화', '/html/body/div[5]')
            result_count += 1
            print(f"{tab_name} 노트 수정 저장 버튼 비활성화 >> pass")
        else:
            print(f"{tab_name} 노트 수정 저장 버튼 비활성화 >> fail")

        edit_textbox.send_keys("edit test"+str(num))
        time.sleep(0.5)
        edit_save_button.click() # 수정 저장 클릭
        time.sleep(0.5)

        new_edit_info = driver.find_element(By.XPATH,f'{first_note}/header/div[1]/time').text
        datetime_part, edited_part = new_edit_info.rsplit(' ', 1)

        datetime_pattern = r"^\d{4}\.\d{2}\.\d{2} \d{2}:\d{2}"
        if re.match(datetime_pattern, new_edit_info) and "수정됨" in new_edit_info and datetime_part != old_note_info:
            pre_setting.create_file(self, save_folder, '노트 수정 날짜 확인', '/html/body/div[5]')
            result_count += 1
            print(f"{tab_name} 노트 수정 날짜 확인 >> pass")
        else:
            print(f"{tab_name} 노트 수정 날짜 확인 >> fail")
        time.sleep(0.5)

        first_text=driver.find_element(By.XPATH,f'{first_note}/p').text # 두번째 노트
        second_text=driver.find_element(By.XPATH,f'{second_note}/p').text # 첫번째 노트
        if second_text == "test"+str(num+1) and first_text == "edit test"+str(num):
            pre_setting.create_file(self, save_folder, '노트 수정 후 위치 확인', '/html/body/div[5]')
            result_count += 1
            print(f"{tab_name} 수정 노트 위치 유지 >> pass")
        else:
            # print(f"{second_text} == " + "test"+str(num)+f" / {first_text} == "+"edit test"+str(num))
            print(f"{tab_name} 수정 노트 위치 유지 >> fail")
        time.sleep(0.5)

        driver.find_element(By.XPATH, '/html/body/div[5]/div/div[1]/button').click()  # note 닫기 버튼 클릭
        time.sleep(0.5)

        if result_count == 5:
            result = True
            print("[노트 작성중 닫기 팝업 PASS]")
        else:
            result = False
            print("[노트 작성중 닫기 팝업 fail  (" + str(result_count) + "/5)]")

    def tearDown(self):  # 테스트 종료
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()
