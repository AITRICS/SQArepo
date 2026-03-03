import mysql.connector

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

#def execute_query(conn, query):
#    cursor = conn.cursor()
#    cursor.execute(query)
#    result = cursor.fetchall()
#    cursor.close()
#    return result