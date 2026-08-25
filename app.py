import os
import sqlite3
import json
from datetime import datetime, timezone
from flask import Flask, render_template, request, g, jsonify

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_DB_PATH = os.path.join(BASE_DIR, "tribu.sqlite")
DB_PATH = os.environ.get("DATABASE_PATH", DEFAULT_DB_PATH)

app = Flask(__name__)


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(exception):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    with sqlite3.connect(DB_PATH) as db:
        db.execute("""
            CREATE TABLE IF NOT EXISTS app_data (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                json TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)
        db.execute("""
            CREATE TABLE IF NOT EXISTS sync_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                action TEXT NOT NULL,
                happened_at TEXT NOT NULL
            )
        """)
        db.execute("""
            CREATE TABLE IF NOT EXISTS deploy_config (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                pa_db_path TEXT,
                pa_project_dir TEXT,
                pa_username TEXT,
                pa_domain TEXT,
                pa_dns TEXT,
                pa_wsgi_path TEXT,
                pa_python_version TEXT,
                notes TEXT,
                updated_at TEXT NOT NULL
            )
        """)
        db.execute("""
            CREATE TABLE IF NOT EXISTS github_config (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                repo_name TEXT,
                repo_url TEXT,
                remote_origin TEXT,
                branch TEXT,
                username TEXT,
                token TEXT,
                instructions TEXT,
                updated_at TEXT NOT NULL
            )
        """)


def ensure_db():
    init_db()


@app.route("/")
def index():
    ensure_db()
    return render_template("base.html")


@app.route("/api/data", methods=["GET"])
def get_data():
    ensure_db()
    db = get_db()
    row = db.execute("SELECT json FROM app_data WHERE id = 1").fetchone()
    if row is None:
        return jsonify({})
    return jsonify(json.loads(row["json"]))


@app.route("/api/data", methods=["POST"])
def post_data():
    ensure_db()
    payload = request.get_json(force=True, silent=True) or {}
    db = get_db()
    db.execute(
        "INSERT OR REPLACE INTO app_data (id, json, updated_at) VALUES (1, ?, ?)",
        (json.dumps(payload), datetime.now(timezone.utc).isoformat()),
    )
    db.commit()
    return jsonify({"ok": True, "saved_at": datetime.now(timezone.utc).isoformat()})


@app.route("/api/import", methods=["POST"])
def import_json():
    """Acepta un respaldo completo y lo guarda en SQLite."""
    ensure_db()
    payload = request.get_json(force=True, silent=True) or {}
    if not isinstance(payload.get("caminatas"), list):
        return jsonify({"ok": False, "error": "Formato invalido: falta caminatas"}), 400
    db = get_db()
    db.execute(
        "INSERT OR REPLACE INTO app_data (id, json, updated_at) VALUES (1, ?, ?)",
        (json.dumps(payload), datetime.now(timezone.utc).isoformat()),
    )
    db.execute(
        "INSERT INTO sync_log (action, happened_at) VALUES (?, ?)",
        ("import", datetime.now(timezone.utc).isoformat()),
    )
    db.commit()
    return jsonify({"ok": True, "records": len(payload.get("caminatas", []))})


@app.route("/api/dbinfo")
def db_info():
    ensure_db()
    db = get_db()

    tables = [r[0] for r in db.execute(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    )]

    size = 0
    try:
        size = os.path.getsize(DB_PATH)
    except OSError:
        pass

    counts = {}
    row = db.execute("SELECT json FROM app_data WHERE id = 1").fetchone()
    if row and row["json"]:
        data = json.loads(row["json"])
        counts = {
            "caminatas": len(data.get("caminatas", [])),
            "directorio": len(data.get("directorioPersonas", [])),
            "notas": len(data.get("notas", [])),
            "precios": len(data.get("preciosBuseta", [])),
            "cotizaciones": len(data.get("cotizacionesGuardadas", data.get("cotizaciones", []))),
            "retiros": len(data.get("historialRetiros", [])),
        }

    return jsonify({
        "db_name": os.path.basename(DB_PATH),
        "db_path": DB_PATH,
        "db_dir": os.path.dirname(DB_PATH),
        "size": f"{size / 1024:.1f} KB" if size else "0 KB",
        "tables": tables,
        "counts": counts,
    })


@app.route("/api/deploy-config", methods=["GET"])
def get_deploy_config():
    ensure_db()
    db = get_db()
    row = db.execute("SELECT * FROM deploy_config WHERE id = 1").fetchone()
    if row is None:
        return jsonify({})
    return jsonify({
        "pa_db_path": row["pa_db_path"],
        "pa_project_dir": row["pa_project_dir"],
        "pa_username": row["pa_username"],
        "pa_domain": row["pa_domain"],
        "pa_dns": row["pa_dns"],
        "pa_wsgi_path": row["pa_wsgi_path"],
        "pa_python_version": row["pa_python_version"],
        "notes": row["notes"],
        "updated_at": row["updated_at"],
    })


@app.route("/api/deploy-config", methods=["POST"])
def post_deploy_config():
    ensure_db()
    cfg = request.get_json(force=True, silent=True) or {}
    db = get_db()
    db.execute(
        """INSERT OR REPLACE INTO deploy_config
           (id, pa_db_path, pa_project_dir, pa_username, pa_domain, pa_dns,
            pa_wsgi_path, pa_python_version, notes, updated_at)
           VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            cfg.get("pa_db_path", ""),
            cfg.get("pa_project_dir", ""),
            cfg.get("pa_username", ""),
            cfg.get("pa_domain", ""),
            cfg.get("pa_dns", ""),
            cfg.get("pa_wsgi_path", ""),
            cfg.get("pa_python_version", ""),
            cfg.get("notes", ""),
            datetime.now(timezone.utc).isoformat(),
        ),
    )
    db.commit()
    return jsonify({"ok": True})


@app.route("/api/github-config", methods=["GET"])
def get_github_config():
    ensure_db()
    db = get_db()
    row = db.execute("SELECT * FROM github_config WHERE id = 1").fetchone()
    if row is None:
        return jsonify({})
    return jsonify({
        "repo_name": row["repo_name"],
        "repo_url": row["repo_url"],
        "remote_origin": row["remote_origin"],
        "branch": row["branch"],
        "username": row["username"],
        "token": row["token"],
        "instructions": row["instructions"],
        "updated_at": row["updated_at"],
    })


@app.route("/api/github-config", methods=["POST"])
def post_github_config():
    ensure_db()
    cfg = request.get_json(force=True, silent=True) or {}
    db = get_db()
    db.execute(
        """INSERT OR REPLACE INTO github_config
           (id, repo_name, repo_url, remote_origin, branch, username, token,
            instructions, updated_at)
           VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            cfg.get("repo_name", ""),
            cfg.get("repo_url", ""),
            cfg.get("remote_origin", ""),
            cfg.get("branch", ""),
            cfg.get("username", ""),
            cfg.get("token", ""),
            cfg.get("instructions", ""),
            datetime.now(timezone.utc).isoformat(),
        ),
    )
    db.commit()
    return jsonify({"ok": True})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
