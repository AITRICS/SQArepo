"""
테스트 환경 설정
- URL
- 테스트 계정
"""
import requests

import unittest
# from setup import setUp, setUp_influxdb,setUp_folder
# from influxdb_client import Point, WritePrecision
from datetime import datetime, timezone, timedelta
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from set_database import conn
import time,re
import random
import os
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# import tkinter as tk
# import subprocess
# from multiprocessing import Process, Manager
# import threading
# import logging

# url=None
# create_account_api_url=None
# activate_account_api_url =None
# login_api_url=None

# class App:
#     def __init__(self,root):
#         self.root=root
#         self.setup_ui()
#         #self.root.protocol("WM_DELETE_WINDOW", self.on_close)
#
#     def setup_ui(self):
#         logging.debug("UI setup starting.")
#         tk.Label(self.root, text="IP :").grid(row=0, column=0)
#         tk.Label(self.root, text="PORT :").grid(row=1, column=0)
#         tk.Label(self.root, text="ID :").grid(row=0, column=2)
#         tk.Label(self.root, text="PASSWORD :").grid(row=1, column=2)
#         tk.Label(self.root, text="NAME :").grid(row=2, column=2)
#
#         self.entry_ip = tk.Entry(self.root)
#         self.entry_port = tk.Entry(self.root)
#         self.entry_userid=tk.Entry(self.root)
#         self.entry_userpw=tk.Entry(self.root,show="*")
#         self.entry_username=tk.Entry(self.root)
#
#         self.entry_ip.grid(row=0, column=1)
#         self.entry_port.grid(row=1, column=1)
#         self.entry_userid.grid(row=0, column=3)
#         self.entry_userpw.grid(row=1, column=3)
#         self.entry_username.grid(row=2, column=3)
#
#         button_start = tk.Button(self.root, text="START", command=self.process_apis)
#
#         button_start.grid(row=3, column=0, columnspan=4)
#
#
#
#     def post_api(self,api_url,data):
#         response = requests.post(api_url, json=data)
#         return response
#
#     # admin access_token 리턴
#     def get_access_token(self,login_url, admin_login_data):
#         response = self.post_api(login_url, admin_login_data)
#         response_data = response.json()
#         print(response_data)
#         return response_data['data'].get('access_token')
#
#     # 계정 활성화 api
#     def activate_account_api(self,api_url, token,user_info):
#         headers = {'Authorization': f'Bearer {token}'}
#         response = requests.post(api_url, headers=headers, json=user_info)
#         return response
#
#     def process_apis(self):
#         global url
#         global create_account_api_url
#         global activate_account_api_url
#         global login_api_url
#
#         ip=self.entry_ip.get()
#         port=self.entry_port.get()
#         userid=self.entry_userid.get()
#         password=self.entry_userpw.get()
#         name=self.entry_username.get()
#
#         url=f"http://{ip}:{port}"
#         create_account_api_url = f"http://{ip}:8080/api/v1/auth/register"
#         activate_account_api_url = f"http://{ip}:8080/api/v1/user/activate"
#         login_api_url = f"http://{ip}:8080/api/v1/auth/login"
#         print(url)
#         user_info = {
#             "username": userid,
#             "password": password,
#             "name": name,
#             "phone": ""
#         }
#         admin_login_data = {
#             "username": "admin",
#             "password": "aitrics1!"
#         }
#         # 계정 생성 api 실행
#         create_account_api_result = self.post_api(create_account_api_url, user_info)
#         print(create_account_api_result.json())
#
#         # admin 로그인하여 access_token 리턴
#         token = self.get_access_token(login_api_url, admin_login_data)
#
#         # 계정 활성화 api
#         activate_account_api_result = self.activate_account_api(activate_account_api_url, token, user_info)
#         print(activate_account_api_result.json())
#
#         with open("url.txt","w") as file:
#             file.write(url)
#
#         subprocess.Popen(["python", "create_account.py"])
#
#     def on_close(self):
#         # 종료 이벤트 핸들러: 여기서 추가 동작 없이 그냥 종료
#         logging.debug("Window is closing.")
#         print("Closing application without running tests again.")
#         self.root.destroy()
#
# root = tk.Tk()
# app = App(root)
# root.protocol("WM_DELETE_WINDOW", app.on_close)
# root.mainloop()
##########################################################

# ip = input("테스트할 ip주소 입력 >> ")
# port = input("테스트 포트 번호 입력 >> ")
# url = "http://"+ip+":"+port
# url = "http://192.168.132.5:3000"
url = "http://192.168.1.211:3000" #dev vc

# print("[테스트할 계정 생성]")
# userid=input("계정 ID >> ")
userid = "nora00"

# while True:
#     password = input("계정 PW >> ")
#     errors = []
#     if len(password) < 8:
#         errors.append("**최소 8자 이상 입력**")
#     if not re.search(r'[!@#$%^&*(),./\-_=+?":{}|<>]', password):
#         errors.append("**특수문자 입력 필요**")
#     if errors:
#         for error in errors:
#             print(error)
#     else:
#         break
password = "aitrics1!"
# name=input("계정 이름 >> ")
name = "nora00"

admin_id='adminora'
admin_pw='aitrics1!'

manager_id='manora'
manager_pw='aitrics1!'

result_folder= r"Z:\AITRICS-VC_UI_AUTO_TEST"

def user_login(browser,user_id, user_pw): #로그인
    driver=browser.driver
    wait = WebDriverWait(driver, 10)
    time.sleep(2)
    # --- ID 입력창 처리 ---
    id_input = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, '/html/body/div[2]/div/form/fieldset/div[1]/div/input')
        )
    )

    # 1) 먼저 클릭해서 포커스 줌 (이때 자동완성/자동채움이 동작할 수 있음)
    id_input.click()
    time.sleep(0.5)  # 자동채움/JS 동작 잠깐 기다리기

    # 2) 전체 선택 + 삭제로 확실히 비우기
    id_input.send_keys(Keys.CONTROL, 'a')
    id_input.send_keys(Keys.DELETE)

    # (optional) 그래도 찜찜하면 clear도 한 번 더
    id_input.clear()

    # 3) 이제 내가 원하는 값 입력
    id_input.send_keys(user_id)

    # --- PW 입력창 처리 ---
    pw_input = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, '/html/body/div[2]/div/form/fieldset/div[2]/div/input')
        )
    )

    pw_input.click()
    time.sleep(0.2)
    pw_input.send_keys(Keys.CONTROL, 'a')
    pw_input.send_keys(Keys.DELETE)
    pw_input.clear()
    pw_input.send_keys(user_pw)

    # --- 로그인 버튼 클릭 ---
    login_btn = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, '/html/body/div[2]/div/form/fieldset/button')
        )
    )
    login_btn.click()
    time.sleep(2)


    # driver.find_element(By.XPATH,'/html/body/div[1]/div/form/fieldset/div[1]/div/input').clear()
    # time.sleep(1)
    # driver.find_element(By.XPATH, "/html/body/div[1]/div/form/fieldset/div[1]/div/input").send_keys(user_id)  # id 일력
    # time.sleep(0.5)
    # driver.find_element(By.XPATH, '/html/body/div[1]/div/form/fieldset/div[2]/div/input').clear()
    # time.sleep(1)
    # driver.find_element(By.XPATH, "/html/body/div[1]/div/form/fieldset/div[2]/div/input").send_keys(user_pw)  # pw 입력
    # time.sleep(0.5)
    # driver.find_element(By.XPATH, "/html/body/div[1]/div/form/fieldset/button").click()  # 로그인
    # time.sleep(2)
    # user_id= ""

def user_logout(browser, user_id):
    driver = browser.driver
    time.sleep(1)
    driver.find_element(By.XPATH, f'//button[.//span[text()="{user_id}"]]').click()  # 이름 선택
    time.sleep(1)
    driver.find_element(By.XPATH, '//div[text()="로그아웃" or text()="Sign out"]').click()  # 로그아웃 선택
    time.sleep(2)

def create_user(browser): #user 계정 생성
    driver = browser.driver
    time.sleep(1)
    driver.find_element(By.XPATH, "/html/body/div[2]/div/button").click() #계정 생성 버튼 클릭
    time.sleep(2)
    driver.find_element(By.XPATH, '/html/body/div[6]/div[2]/div/form/div[1]/div[2]/input').send_keys(userid) #user id 입력
    time.sleep(1)
    driver.find_element(By.XPATH, '/html/body/div[6]/div[2]/div/form/div[2]/div[2]/input').send_keys(password) #user pw 입력
    time.sleep(1)
    driver.find_element(By.XPATH, '/html/body/div[6]/div[2]/div/form/div[3]/div[2]/input').send_keys(password) #pw 확인 입력
    time.sleep(1)
    driver.find_element(By.XPATH, '/html/body/div[6]/div[2]/div/form/div[5]/input').send_keys(name) #user name 입력
    time.sleep(1)
    target_element = driver.find_element(By.XPATH, '//div[text()="사용자 유형" or text()="User type"]')
    driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'start'});", target_element)  # 스크롤
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
    driver.find_element(By.XPATH, '//div[@role="option"]//span[text()="일반병동" or text()="GW"]').click()  # 사용자 소속 기타 선택
    time.sleep(1)
    dialog_button = driver.find_element(By.XPATH, '/html/body/div[6]/div[2]/div/form/div[9]/div[1]/button')
    driver.execute_script("arguments[0].scrollIntoView();", dialog_button)
    driver.find_element(By.XPATH,
                        '/html/body/div[6]/div[2]/div/form/div[8]/section[1]/label/input').click()  # 서비스 이용약관 동의
    driver.find_element(By.XPATH,
                        '/html/body/div[6]/div[2]/div/form/div[8]/section[2]/label/input').click()  # 개인정보 수집/이용 동의
    time.sleep(2)
    dialog_button.click()  # 계정생성 버튼 클릭
    time.sleep(2)


def delete_user(browser, user_id, login_id): #user 계정 삭제
    driver = browser.driver

    driver.find_element(By.XPATH, f'//button[.//span[text()="{login_id}"]]').click()  # 이름 선택
    time.sleep(1)
    driver.find_element(By.XPATH, '//div[text()="설정" or text()="Settings"]').click()  # 설정 선택
    time.sleep(2)
    driver.find_element(By.XPATH,'//div[@class="block"]//span[text()="멤버 관리" or text()="Manage account"]').click()  # 멤버관리 선택
    time.sleep(2)

    #마지막까지 스크롤 /html/body/div[1]/div/div[2]/div/table/tbody/tr[32]/td[6]/div/button
    last_row_xpath = '/html/body/div[2]/div/div[2]/div/div[3]/div/div[2]/div[last()]'
    last_row = driver.find_element(By.XPATH, last_row_xpath)
    driver.execute_script("arguments[0].scrollIntoView();", last_row)
    WebDriverWait(driver, 5).until(EC.element_to_be_clickable((By.XPATH, last_row_xpath)))

    rows = driver.find_elements(By.XPATH, '/html/body/div[2]/div/div[2]/div/div[3]/div/div[2]/div')
    for row in rows:#삭제할 계정 찾기
        first_cell=row.find_element(By.XPATH,'./div[1]')
        if user_id ==first_cell.text:
            row.find_element(By.XPATH, './div[9]/div/button').click() #삭제 버튼 클릭
            time.sleep(1)

    driver.find_element(By.XPATH,'/html/body/div[6]/div[2]/div[2]/button[1]').click()  # 삭제 모달 [삭제] 버튼 클릭
    time.sleep(1)

def user_active(browser,user_id,login_id): #계정 승인
    driver=browser.driver

    driver.find_element(By.XPATH, f'//button[.//span[text()="{login_id}"]]').click()  # 이름 선택
    time.sleep(1)
    driver.find_element(By.XPATH, '//div[text()="설정" or text()="Settings"]').click()  # 설정 선택
    time.sleep(2)
    driver.find_element(By.XPATH,
                        '//div[@class="block"]//span[text()="멤버 관리" or text()="Manage account"]').click()  # 멤버관리 선택
    time.sleep(2)

    # 마지막까지 스크롤
    last_row_xpath = '/html/body/div[2]/div/div[2]/div/div[3]/div/div[2]/div[last()]'
    last_row = driver.find_element(By.XPATH, last_row_xpath)
    driver.execute_script("arguments[0].scrollIntoView();", last_row)
    WebDriverWait(driver, 5).until(EC.element_to_be_clickable((By.XPATH, last_row_xpath)))

    rows = driver.find_elements(By.XPATH, '/html/body/div[2]/div/div[2]/div/div[3]/div/div[2]/div')
    for row in rows:  # 승인할 계정 찾기
        first_cell = row.find_element(By.XPATH, './div[1]')
        if user_id == first_cell.text:
            row.find_element(By.XPATH, './div[4]/div/button').click()  # [승인] 버튼 클릭
            time.sleep(1)

def user_pwReset(browser,user_id,login_id):
    driver=browser.driver
    #new_pw=None
    user_login(browser,admin_id,admin_pw) # admin 로그인

    driver.find_element(By.XPATH, f'//button[.//span[text()="{login_id}"]]').click()  # 이름 선택
    time.sleep(1)
    driver.find_element(By.XPATH, '//div[text()="설정" or text()="Settings"]').click()  # 설정 선택
    time.sleep(2)
    driver.find_element(By.XPATH,
                        '//div[@class="block"]//span[text()="멤버 관리" or text()="Manage account"]').click()  # 멤버관리 선택
    time.sleep(2)

    # 마지막까지 스크롤
    last_row_xpath = '/html/body/div[2]/div/div[2]/div/div[3]/div/div[2]/div[last()]'
    last_row = driver.find_element(By.XPATH, last_row_xpath)
    driver.execute_script("arguments[0].scrollIntoView();", last_row)
    WebDriverWait(driver, 5).until(EC.element_to_be_clickable((By.XPATH, last_row_xpath)))

    rows = driver.find_elements(By.XPATH, '/html/body/div[2]/div/div[2]/div/div[3]/div/div[2]/div')
    for row in rows:  # 비번 변경할 계정 찾기
        first_cell = row.find_element(By.XPATH, './div[1]')
        if user_id == first_cell.text:
            row.find_element(By.XPATH, './div[8]/div/button').click()  # 비밀번호 발급 버튼 클릭
            time.sleep(1)
            break
    driver.find_element(By.XPATH, '/html/body/div[6]/div[2]/div[2]/button[1]').click()  # 임시 비밀번호 발급
    time.sleep(1)
    new_pw = driver.find_element(By.XPATH, '/html/body/div[6]/div[2]/div[2]').text  # 임시 비밀번호 저장
    driver.find_element(By.XPATH, '/html/body/div[6]/div[2]/button').click() #닫기 버튼 선택
    return new_pw

def change_pw(browser,origin_pw):
    driver = browser.driver
    # driver.find_element(By.XPATH, '/html/body/div[5]/form/div[1]/div[2]/input').send_keys(origin_pw)  # 재발급된 비번 입력
    driver.find_element(By.XPATH, '/html/body/div[6]/form/div[1]/div[2]/input').send_keys(origin_pw)  # 재발급된 비번 입력
    time.sleep(1)
    # driver.find_element(By.XPATH, '/html/body/div[5]/form/div[2]/div[2]/input').send_keys(manager_pw) # 새로운 비번 입력 선택
    driver.find_element(By.XPATH, '/html/body/div[6]/form/div[2]/div[2]/input').send_keys(manager_pw)  # 새로운 비번 입력 선택
    time.sleep(1)
    # driver.find_element(By.XPATH, '/html/body/div[5]/form/div[3]/div[2]/input').send_keys(manager_pw) # 새로운 비번 확인 선택
    driver.find_element(By.XPATH, '/html/body/div[6]/form/div[3]/div[2]/input').send_keys(manager_pw)  # 새로운 비번 확인 선택
    time.sleep(1)
    # driver.find_element(By.XPATH, '/html/body/div[5]/div[2]/button').click()  # [저장] 선택
    driver.find_element(By.XPATH, '/html/body/div[6]/div[2]/button').click()  # [저장] 선택
    time.sleep(2)

def create_file(browser,sf,filename,elements):
    driver = browser.driver
    now = datetime.now()
    timestamp = now.strftime("%Y-%m-%d_%H%M%S")
    filename = os.path.join(sf, f'{filename}_{timestamp}.png')
    driver.find_element(By.XPATH, elements).screenshot(filename)

# def record_result(test_method,run_time, test_name):
#
#     client,write_api=setUp_influxdb()
#     test_status = 'pass' if test_method else 'fail'  # 테스트 결과가 True->pass, False->fail
#     utc_now = datetime.now(timezone.utc)
#     kst_now = utc_now + timedelta(hours=9)
#     test_result = (Point("unittest_results")  # 테이블명
#                    .field("test_name", test_name)  # 테스트이름
#                    .field("status", test_status)  # 테스트결과
#                    .field("run_time", run_time)
#                    .time(kst_now, WritePrecision.NS))
#     write_api.write(bucket="AUTO_UI_TEST", record=test_result)


# def clear_input(browser):
#     driver = browser.driver
#     driver.find_element(By.XPATH,'/html/body/div[1]/form/div[1]/div/input').clear()
#     time.sleep(1)
#     driver.find_element(By.XPATH, '/html/body/div[1]/form/div[2]/div/input').clear()
#     time.sleep(1)
#     driver.delete_all_cookies()








# create_account_api_url="http://"+ip+":8080/api/v1/auth/register"
# activate_account_api_url="http://"+ip+":8080/api/v1/user/activate"
# login_api_url="http://"+ip+":8080/api/v1/auth/login"
#
#
# user_info={
#      "username": userid,
#      "password": password,
#      "name": name,
#      "phone": ""
# }
# admin_login_data={
#     "username": "admin",
#     "password": "aitrics1!"
# }
# #post api
# def post_api(api_url,user_info):
#     response = requests.post(api_url, json=user_info)
#     return response
#
# #admin access_token 리턴
# def get_access_token(login_url,admin_login_data):
#     response = post_api(login_url,admin_login_data)
#     response_data=response.json()
#     return response_data['data'].get('access_token')
#
# #계정 활성화 api
# def activate_account_api(api_url,token):
#     headers={'Authorization':f'Bearer {token}'}
#     response=requests.post(api_url,headers=headers,json=user_info)
#     return response
#
# #계정 생성 api 실행
# create_account_api_result=post_api(create_account_api_url,user_info)
# print(create_account_api_result.json())
#
# #admin 로그인하여 access_token 리턴
# token=get_access_token(login_api_url,admin_login_data)
#
# #계정 활성화 api
# activate_account_api_result=activate_account_api(activate_account_api_url,token)
# print(activate_account_api_result.json())