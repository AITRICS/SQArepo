import subprocess
import sys
import os
import pytest
from log_failure import log_to_file
from collections import deque
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



# @pytest.mark.parametrize("script", scripts)
# def test_script_runs_successfully(script):
#     assert os.path.exists(script), f"{RED}❌ Script not found: {script}{RESET}"
#     print(f"▶ 실행 중: {script}{RESET}")

#     env = os.environ.copy()
#     env["PYTHONUTF8"] = "1"
#     env["PYTHONIOENCODING"] = "utf-8"

#     proc = subprocess.Popen(
#         [sys.executable, "-X", "utf8", script],
#         check=True,
#         stdout=subprocess.PIPE,
#         stderr=subprocess.STDOUT,
#         text=True,
#         encoding="utf-8",
#         errors="replace",
#         bufsize=1,  # line-buffered (text 모드에서 의미 있음)
#         env=env,
#     )

#     assert proc.stdout is not None
#     for line in proc.stdout:
#         print(line, end="")  # 콘솔 + report 둘 다 남음 (tee-sys이면 콘솔에도 보임)

#     proc.wait()

#     if proc.returncode == 0:
#         print(f"{GREEN}✅ {script} 통과{RESET}")
#     else:
#         print(f"{RED}❌ {script} 실패 (Exit Code: {proc.returncode}){RESET}")
#         assert False, f"{RED}스크립트 실패: {script}{RESET}"


@pytest.mark.parametrize("script", scripts)
def test_script_runs_successfully(script):
    assert os.path.exists(script), f"{RED}❌ Script not found: {script}{RESET}"

    print(f"▶ 실행 중: {script}{RESET}")

    env = os.environ.copy()
    env["PYTHONUTF8"] = "1"
    env["PYTHONIOENCODING"] = "utf-8"

    # 자식 프로세스에도 -u를 줘야 print가 실시간으로 나옵니다.
    cmd = [sys.executable, "-u", "-X", "utf8", script]

    tail = deque(maxlen=200)  # 실패 시 마지막 200줄만 보여주기

    with subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace",
        bufsize=1,   # text 모드에서 line-buffering 힌트
        env=env,
    ) as proc:
        assert proc.stdout is not None

        # 실시간 스트리밍 출력
        for line in proc.stdout:
            tail.append(line)
            # 원하면 각 줄에 스크립트명 prefix를 달 수도 있음:
            # print(f"[{script}] {line}", end="")
            print(line, end="")

        rc = proc.wait()

    if rc != 0:
        # 실패 시 마지막 로그를 같이 남기면 원인 파악이 빨라집니다.
        print("\n===== LAST LOG (tail) =====")
        print("".join(tail))
        print("===== END LAST LOG =====\n")
        pytest.fail(f"{RED}스크립트 실패: {script} (exit={rc}){RESET}")

    print(f"{GREEN}✅ {script} 통과{RESET}")