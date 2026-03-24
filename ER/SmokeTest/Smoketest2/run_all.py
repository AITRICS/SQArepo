import subprocess
import sys
import os
import pytest
from log_failure import log_to_file
from influxdb import InfluxDBClient

import uuid 
import datetime

import time
# ANSI 컬러코드
RED = "\033[91m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RESET = "\033[0m"


# 실행할 Python 스크립트 목록 (순서대로)
scripts = [
    "generate_id_test.py",
    "1-1-1_create_user_test.py",
    "1-1-2_admin_login_test.py",
    "1-1-3_approve_user_test.py",
    "1-2-4_delete_user_test.py",
    "1-2-5_delete_user_login_test.py",
    "1-3-6_approve_user_login_test.py",
    "1-4-7_change_user_phonenum_test.py",
    "1-4-8_change_user_pw_test.py",
    "1-5-9_admin_temp_pw_test.py",
    "1-5-10_temp_pw_login_test.py",
    "1-5-11_pw_reset_test.py",
    "2-1-1_area_select_test.py",
    "2-1-2_AI_Score_filter_select_test.py",
    "2-1-3_KTAS_filter_select_test.py",
    "2-1-4_Mental_Status_filter_select_test.py",
    "2-1-5_Vital_sign_filter_test.py",
    "2-1-6_observe_filter_test.py",
    "2-1-7_sorting_test.py",
    "2-1-8_pid_copy_test.py",
    "2-2-1_patient_search_test.py",
    "2-3-1_alarm_test.py",
    "3-1-1_patient_detail_dnr_test.py",
    "3-2-1_patient_detail_alarm_test.py",
    "3-3-1_patient_detail_observe_test.py",
    "3-4-1_patient_detail_action_test.py",
    "3-5-1_patient_detail_inital_assessment_test.py",
    "3-6-1_patient_detail_select_history_test.py",
    "4-1-1_report_test.py",
    "5-1-1_setting_alarm_test.py",
    "5-2-1_setting_dashboard_test.py",
    "5-3-1_setting_notice_test.py",
    "5-4-1_setting_information_test.py",
    "5-5-1_setting_member_setting_test.py",
    "5-6-1_setting_alarm_range_test.py",
    "5-7-1_setting_log_test.py",
    "5-9-1_hospital_setting_test.py",
    "6-1-1_data_setting_test.py",
    "6-1-2_score_setting_test.py",
    "6-2-1_log_test.py"

]


# @pytest.mark.parametrize("script", scripts)
# def test_script_runs_successfully(script):
#     assert os.path.exists(script), f"{RED}❌ Script not found: {script}{RESET}"

#     print(f"{YELLOW}▶ 실행 중: {script}{RESET}")

#     try:
#         result = subprocess.run(
#             [sys.executable, script],
#             stdout=sys.stdout,  # ✅ Pytest 터미널에 직접 전달
#             stderr=sys.stderr,
#             check=True,
#         )
#         print(f"{GREEN}✅ {script} 통과{RESET}")
#     except subprocess.CalledProcessError as e:
#         print(f"{RED}❌ {script} 실패 (Exit Code: {e.returncode}){RESET}")
#         assert False, f"{RED}스크립트 실패: {script}{RESET}"


# client = InfluxDBClient(
#     host='192.168.1.210',
#     port=8086,
#     username='',  # auth 없으면 빈 문자열
#     password='',  # auth 없으면 빈 문자열
#     database='SQA3_SmokeTest' # DB 선택
# )


# # DB 목록 확인
# databases = client.get_list_database()
# print(databases)

# # DB가 없으면 생성
# if not any(db['name'] == 'AA' for db in databases):
#     client.create_database('AA')



# execution_id = str(uuid.uuid4())
# execution_start = datetime.datetime.utcnow()

# for script in scripts:
#     start_time = datetime.datetime.utcnow()
#     result = subprocess.run(["python", script], capture_output=True, text=True)
#     end_time = datetime.datetime.utcnow()
#     status = "pass" if result.returncode == 0 else "fail"
#     status_value = 1 if status == "pass" else 0

#     json_body = [
#         {
#             "measurement": "sqa3_er_smoketest2",
#             "tags": {
                
#                 "script": script,
#                 "status": status
               
#             },

#             "fields": {
#                 "execution_id": execution_id,
#                 "status_value": status_value, 
#                 "start_time_ms": int(start_time.timestamp() * 1000),
#                 "end_time_ms": int(end_time.timestamp() * 1000),
#                 # 필요하면 duration 도 추가
#                 "duration_s": (end_time - start_time).total_seconds()
#             }
#         }
#     ]
#     client.write_points(json_body)
#     print(f"Finished {script} with status {status}")

# execution_end = datetime.datetime.utcnow()

# # 연결 종료
# client.close()

# client = InfluxDBClient(
#     host='192.168.1.210',
#     port=8086,
#     username='',  # auth 없으면 빈 문자열
#     password='',  # auth 없으면 빈 문자열
#     database='SQA3_SmokeTest' # DB 선택
# )

client = InfluxDBClient(
    host='192.168.1.210',
    port=8086,
    username='',
    password='',
    database='SQA3_SmokeTest'
)




execution_id = str(uuid.uuid4())

@pytest.mark.parametrize("script", scripts)
def test_script_runs_successfully(script):
    assert os.path.exists(script), f"❌ Script not found: {script}"
    print(f"▶ 실행 중: {script}")

    start_time = datetime.datetime.utcnow()
    # pytest 캡처 충돌 피하려면 capture_output=True 권장
    result = subprocess.run(
        [sys.executable, script],
        capture_output=True, text=True, check=False
    )
    # 서브프로세스 출력 보기 원하면 터미널로 다시 출력
    if result.stdout:
        print(result.stdout, end="")
    if result.stderr:
        print(result.stderr, end="", file=sys.stderr)

    end_time = datetime.datetime.utcnow()
    status = "pass" if result.returncode == 0 else "fail"
    status_value = 1 if status == "pass" else 0

    json_body = [{
        "measurement": "sqa3_er_smoketest2",
        "tags": {
            "script": script,
            "status": status
        },
        "fields": {
            "execution_id": execution_id,
            "status_value": status_value,
            "start_time_ms": int(start_time.timestamp() * 1000),
            "end_time_ms": int(end_time.timestamp() * 1000),
            "duration_s": (end_time - start_time).total_seconds()
        }
    }]
    client.write_points(json_body)

    print(f"Finished {script} with status {status}")
    assert result.returncode == 0, f"스크립트 실패: {script}"

def teardown_module(module):
    # ✅ pytest가 끝날 때 한 번만 닫기
    client.close()