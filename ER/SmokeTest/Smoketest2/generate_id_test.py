import random
import json
import os

def generate_random_data():
# 랜덤한 세 자리 숫자 생성 (0부터 999 사이)
    random_number = random.randint(0, 999)
# 숫자를 세 자리 문자열로 변환하고, 앞에 0을 채워서 총 세 자리로 만듭니다.
    random_number_str = f"{random_number:03}"
# ID를 생성하여 반환합니다.
    return f"test{random_number_str}"

random_regi_id = generate_random_data()
random_regi_id1 = generate_random_data()
random_adduser_id = f"add{random_regi_id}"
print(f"[Data 생성] Registration ID 생성 : {random_regi_id}, {random_regi_id1}")
print(f"[Data 생성] Add user ID 생성: {random_adduser_id}")

#json 파일로 저장
base_dir = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(base_dir, "generated_id.json")
with open(file_path, "w") as f:

    json.dump({"random_regi_id": random_regi_id}, f)

print(f"[생성 완료] 등록 ID: {random_regi_id}")