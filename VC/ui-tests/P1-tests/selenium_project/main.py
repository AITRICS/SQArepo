import unittest
from create_account import CreateAccountTest
from ui_check import UICheckTest
from lock_account import LockAccountTest
from reset_account import UnlockAccountTest
from account_policy_agreement import AccountPolicyAgreementTest
from gnb_check import GNBCheckTest
from note_check import NoteTest
from dashboard_column_tooltip import Dashboard_Tooltip
import pre_setting
from set_database import conn
import sys,logging

log_file = open('script_output.log', 'w')
error_file = open('script_error.log', 'w')

sys.stdout = log_file
sys.stderr = error_file

if __name__ == "__main__":
    # TestSuite 생성
    suite = unittest.TestSuite()

    # 01.계정 생성 테스트
    tests = unittest.TestLoader().loadTestsFromTestCase(CreateAccountTest)
    suite.addTests(tests)
    # 02.로그인 페이지 ui 확인
    tests = unittest.TestLoader().loadTestsFromTestCase(UICheckTest)
    suite.addTests(tests)
    # 03.계정 잠금 확인
    tests = unittest.TestLoader().loadTestsFromTestCase(LockAccountTest)
    suite.addTests(tests)
    # 04.계정 잠금 초기화 확인
    tests = unittest.TestLoader().loadTestsFromTestCase(UnlockAccountTest)
    suite.addTests(tests)
    # 05.서비스 이용약관, 계정정보 수집/이용 동의 확인
    tests = unittest.TestLoader().loadTestsFromTestCase(AccountPolicyAgreementTest)
    suite.addTests(tests)
    # 06.HOME GNB 확인
    # tests = unittest.TestLoader().loadTestsFromTestCase(GNBCheckTest)
    # suite.addTests(tests)
    # 07.Note 확인
    tests = unittest.TestLoader().loadTestsFromTestCase(NoteTest)
    suite.addTests(tests)
    #08.대시보드 스코어 컬럼 툴팁 확인
    tests = unittest.TestLoader().loadTestsFromTestCase(Dashboard_Tooltip)
    suite.addTests(tests)

    # 테스트 실행
    runner = unittest.TextTestRunner()
    runner.run(suite)

############################################################################################
    # cur = conn.cursor()
    # cur.execute("DELETE FROM vitalcare.accounts_user WHERE username ='"+pre_setting.userid+"'") # api로 생성한 계정 삭제
    # conn.commit()
    # cur.close()

    sys.stdout=sys.__stdout__
    sys.stderr=sys.__stderr__
    log_file.close()
    error_file.close()

