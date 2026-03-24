from datetime import datetime
import threading

LOG_PATH = "error_log.txt"
_log_lock = threading.Lock()

def log_to_file(message: str, script_name: str = None):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    prefix = f"[{script_name}] " if script_name else ""
    with _log_lock:
        with open(LOG_PATH, "a", encoding="utf-8") as f:
            f.write(f"[{timestamp}] {prefix}{message}\n")