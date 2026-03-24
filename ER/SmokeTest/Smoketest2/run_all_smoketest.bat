@echo off
cd /d Z:\SmokeTest\ER\SmokeTest2\script
python -m pytest run_all_smoketest.py -v --html=report.html --self-contained-html
pause