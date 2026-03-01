"""
Seed Script
Inserts sample article data into the 'posts' table.
"""
import mysql.connector
import os

DB_CONFIG = {
    "host":     os.getenv("DB_HOST", "localhost"),
    "port":     int(os.getenv("DB_PORT", 3306)),
    "user":     os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "article"),
}

SEED_DATA = [
    (
        "Pengenalan Python untuk Pemula",
        "Python adalah bahasa pemrograman tingkat tinggi yang mudah dipelajari dan digunakan oleh pemula maupun profesional. "
        "Python memiliki sintaks yang bersih dan mudah dibaca, sehingga cocok untuk berbagai keperluan seperti web development, "
        "data science, machine learning, dan otomatisasi. Dalam artikel ini kita akan membahas dasar-dasar Python mulai dari "
        "instalasi hingga menulis program pertama Anda. Python juga memiliki ekosistem library yang sangat kaya seperti NumPy, "
        "Pandas, Flask, Django, dan masih banyak lagi yang dapat mempercepat proses pengembangan aplikasi Anda.",
        "Teknologi",
        "publish",
    ),
    (
        "Cara Membuat REST API dengan Flask",
        "Flask adalah micro web framework untuk Python yang ringan namun sangat powerful. Dengan Flask, Anda dapat membuat "
        "REST API dengan cepat dan mudah. Artikel ini akan memandu Anda langkah demi langkah dalam membangun REST API yang "
        "mencakup operasi CRUD (Create, Read, Update, Delete). Kita akan membahas routing, request handling, response formatting "
        "menggunakan JSON, serta cara menghubungkan Flask dengan database MySQL menggunakan mysql-connector-python. Di akhir "
        "artikel, Anda akan memiliki API yang siap digunakan untuk proyek nyata.",
        "Pemrograman",
        "publish",
    ),
    (
        "Memahami Konsep Database Relasional",
        "Database relasional adalah sistem manajemen database yang menyimpan data dalam bentuk tabel yang saling berhubungan. "
        "Konsep utama dalam database relasional meliputi tabel, baris, kolom, primary key, foreign key, dan relasi antar tabel. "
        "SQL (Structured Query Language) digunakan untuk berinteraksi dengan database relasional. Dalam artikel ini kita akan "
        "membahas perintah-perintah SQL dasar seperti SELECT, INSERT, UPDATE, DELETE, JOIN, serta bagaimana merancang skema "
        "database yang baik menggunakan normalisasi. Pemahaman yang kuat tentang database relasional sangat penting bagi "
        "setiap developer backend.",
        "Database",
        "publish",
    ),
    (
        "Panduan Lengkap Docker untuk Developer",
        "Docker adalah platform containerization yang memungkinkan Anda mengemas aplikasi beserta seluruh dependensinya ke "
        "dalam sebuah container yang dapat dijalankan di mana saja secara konsisten. Dengan Docker, masalah 'works on my machine' "
        "dapat dihilangkan karena environment aplikasi selalu sama di development, staging, maupun production. Artikel ini "
        "membahas instalasi Docker, konsep image dan container, menulis Dockerfile, menggunakan Docker Compose untuk multi-service "
        "applications, serta best practices dalam menggunakan Docker untuk proyek nyata.",
        "DevOps",
        "publish",
    ),
    (
        "Tips Optimasi Query MySQL yang Efisien",
        "Query yang lambat dapat menjadi bottleneck utama dalam performa aplikasi. Artikel ini membahas berbagai teknik optimasi "
        "query MySQL yang dapat Anda terapkan langsung. Mulai dari penggunaan INDEX yang tepat, menghindari SELECT *, menggunakan "
        "EXPLAIN untuk menganalisis query plan, hingga teknik caching dengan Redis. Kita juga akan membahas kapan harus menggunakan "
        "JOIN vs subquery, cara menangani N+1 query problem, serta monitoring performa database menggunakan slow query log. "
        "Dengan menerapkan teknik-teknik ini, performa aplikasi Anda akan meningkat secara signifikan.",
        "Database",
        "publish",
    ),
    (
        "Microservice Architecture: Keuntungan dan Tantangan",
        "Arsitektur microservice membagi aplikasi menjadi layanan-layanan kecil yang independen dan dapat di-deploy secara "
        "terpisah. Setiap service memiliki tanggung jawab yang spesifik dan berkomunikasi melalui API atau message broker. "
        "Keuntungan utama microservice meliputi skalabilitas yang lebih baik, kemudahan deployment, dan fleksibilitas dalam "
        "memilih teknologi untuk setiap service. Namun ada juga tantangan seperti kompleksitas jaringan, distributed tracing, "
        "dan manajemen data yang lebih rumit. Artikel ini membahas kapan sebaiknya menggunakan microservice dan bagaimana "
        "memulai migrasi dari monolith ke microservice secara bertahap.",
        "Arsitektur",
        "draft",
    ),
    (
        "Belajar Git dan Version Control untuk Tim",
        "Git adalah sistem version control terdistribusi yang wajib dikuasai oleh setiap developer modern. Dengan Git, tim "
        "dapat berkolaborasi dalam satu codebase tanpa saling mengganggu pekerjaan satu sama lain. Artikel ini membahas "
        "perintah-perintah Git dasar seperti init, clone, add, commit, push, pull, dan merge. Kita juga akan membahas Git "
        "branching strategy seperti Git Flow dan GitHub Flow, cara menyelesaikan merge conflict, code review menggunakan pull "
        "request, serta penggunaan Git hooks untuk otomatisasi. Dengan workflow Git yang baik, produktivitas tim Anda akan "
        "meningkat drastis.",
        "Tools",
        "publish",
    ),
    (
        "Keamanan API: Autentikasi dan Otorisasi",
        "Keamanan adalah aspek yang tidak boleh diabaikan dalam pengembangan API. Artikel ini membahas berbagai mekanisme "
        "autentikasi seperti API Key, Basic Auth, JWT (JSON Web Token), dan OAuth 2.0. Kita akan membahas perbedaan antara "
        "autentikasi (siapa Anda) dan otorisasi (apa yang boleh Anda lakukan), cara mengimplementasikan JWT di Flask, "
        "refresh token strategy, serta best practices keamanan API seperti rate limiting, input validation, HTTPS enforcement, "
        "dan CORS configuration. Memahami keamanan API sangat penting untuk melindungi data pengguna dan sistem Anda.",
        "Keamanan",
        "thrash",
    ),
]


def run_seed():
    conn   = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()

    sql = """
        INSERT INTO posts (title, content, category, status)
        VALUES (%s, %s, %s, %s)
    """

    cursor.executemany(sql, SEED_DATA)
    conn.commit()

    print(f"✅ Seeded {cursor.rowcount} articles into the 'posts' table.")
    cursor.close()
    conn.close()


if __name__ == "__main__":
    run_seed()
