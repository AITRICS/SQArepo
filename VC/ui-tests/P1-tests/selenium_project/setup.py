from selenium import webdriver
# from influxdb_client import InfluxDBClient
# from influxdb_client.client.write_api import SYNCHRONOUS
import os
import sys
import mysql.connector

def setUp(url):
    #url = input("테스트할 ip주소 입력 >> ")
    options = webdriver.ChromeOptions()
    options.add_experimental_option("detach", True)
    driver = webdriver.Chrome(options=options)
    driver.maximize_window()
    driver.get(url)
    return driver

# def setUp_influxdb():
#     client = InfluxDBClient(url="http://192.168.1.211:8086",
#                             token="",
#                             org="-")
#     write_api = client.write_api(write_options=SYNCHRONOUS)
#     return client, write_api

def setUp_folder(save_path=None):
    # BASE_DIR =  r"Z:\AITRICS-VC_UI_AUTO_TEST\v2.1.4\alpha1'"
    version= r"v2.2.1\test1"
    # 실행 파일 경로 찾기
    if getattr(sys, 'frozen', False):  # exe로 실행
        exe_path = os.path.dirname(sys.executable)
    else:  # 스크립트로 실행
        exe_path = os.path.dirname(os.path.abspath(__file__))
    #save_folder = os.path.join(save_path, 'v2.1.0-alpha1')
    #테스트 결과 저장 폴더 경로 지정
    if save_path:
        save_folder=os.path.join(save_path, version) #지정 경로에 저장
    else:
        save_folder= os.path.join(exe_path, version) #기본 경로에 저장
    #폴더 존재 확인 및 생성
    if not os.path.exists(save_folder):
        os.makedirs(save_folder)
    return save_folder

def setUp_subfolder(parent_folder, subfolder_name):
    subfolder_path = os.path.join(parent_folder,subfolder_name)
    if not os.path.exists(subfolder_path):
        os.makedirs(subfolder_path)
    return subfolder_path

def connect_to_mysql(host, port, username, password):
    try:
        conn = mysql.connector.connect(
            host=host,
            port=port,
            user=username,
            password=password
        )
        if conn.is_connected():
            print('DB Connected')
            return conn
    except mysql.connector.Error as err:
        print(f'MySQL 데이터베이스 연결 오류: {err}')
        return None

conn = connect_to_mysql('192.168.1.211', '3306', 'root', 'cV72Buj3[m:7hl=@!')

def execute_query(conn, query):
    cursor = conn.cursor()
    cursor.execute(query)
    result = cursor.fetchall()
    cursor.close()
    return result