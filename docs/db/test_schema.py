"""Testa o esquema: cria o banco em memória, carrega o exemplo e verifica
desbloqueio, requisito OU, espelho, contador de branch, XP e ciclos."""
import sqlite3
from pathlib import Path

HERE = Path(__file__).parent


def fresh():
    db = sqlite3.connect(":memory:")
    db.executescript((HERE / "schema.sql").read_text())
    db.executescript((HERE / "seed_exemplo.sql").read_text())
    return db


def state(db, slug):
    return db.execute("SELECT state FROM v_node_state WHERE user_id=1 AND slug=?", (slug,)).fetchone()[0]


def set_level(db, node_id, level, xp=10):
    db.execute(
        "INSERT INTO user_node (user_id, node_id, level, started_at) VALUES (1, ?, ?, datetime('now')) "
        "ON CONFLICT(user_id, node_id) DO UPDATE SET level = excluded.level",
        (node_id, level),
    )
    db.execute("INSERT INTO progress_event (user_id, node_id, type, xp) VALUES (1, ?, 'criterio_marcado', ?)", (node_id, xp))


def validation_errors(db):
    errors = []
    for stmt in (HERE / "validate.sql").read_text().split(";"):
        if "SELECT" in stmt:
            errors += db.execute(stmt).fetchall()
    return errors


def test():
    db = fresh()
    assert validation_errors(db) == [], validation_errors(db)

    # Início: só nós sem requisito estão disponíveis.
    assert state(db, "arrays") == "disponivel"
    assert state(db, "big-o") == "disponivel"
    assert state(db, "hashing") == "bloqueado"
    assert state(db, "two-pointers") == "bloqueado"

    # Arrays feito: Two Pointers ainda exige (Ordenação OU Hashing).
    set_level(db, 2, 1)
    assert state(db, "hashing") == "disponivel"
    assert state(db, "two-pointers") == "bloqueado"

    # Hashing nível 1 satisfaz o grupo OU. Big-O é só recomendado: não bloqueia.
    set_level(db, 3, 1)
    assert state(db, "two-pointers") == "disponivel"
    # Requisito entre áreas: Consistent hashing (Eng. Software) libera com Hashing 1...
    assert state(db, "consistent-hashing") == "disponivel"
    # ...mas Índice hash (Dados) exige Hashing nível 2.
    assert state(db, "indice-hash") == "bloqueado"
    set_level(db, 3, 2)
    assert state(db, "indice-hash") == "disponivel"

    # Nível mínimo: Sliding Window exige Two Pointers nível 2.
    set_level(db, 5, 1)
    assert state(db, "two-pointers") == "em_progresso"
    assert state(db, "sliding-window") == "bloqueado"
    set_level(db, 5, 3)
    assert state(db, "two-pointers") == "dominado"
    assert state(db, "sliding-window") == "disponivel"

    # Espelho: Hashing conta na carta de Indexação e de System Design.
    row = db.execute(
        "SELECT nodes_done, nodes_total FROM v_branch_progress WHERE user_id=1 AND slug='indexacao'"
    ).fetchone()
    assert row == (1, 2), row

    # XP vai só para a área-casa (Fundamentos), nunca duplicado pelo espelho.
    xp = dict(db.execute("SELECT slug, xp FROM v_area_xp WHERE user_id=1").fetchall())
    assert xp == {"fundamentos": 50}, xp

    # Ciclo é detectado pela validação.
    db.execute("INSERT INTO requirement (node_id, req_node_id) VALUES (2, 6)")  # Arrays exige Sliding Window
    errs = validation_errors(db)
    assert any(e[0] == "ciclo" for e in errs), errs

    # Requisito de branch inteira: exige todo o tronco de Complexidade.
    db2 = fresh()
    db2.execute("INSERT INTO requirement (node_id, req_branch_id) VALUES (6, 11)")
    for nid in (2, 3, 5):
        set_level(db2, nid, 3)
    assert state(db2, "sliding-window") == "bloqueado"
    set_level(db2, 1, 1)  # Big-O é o tronco de Complexidade
    assert state(db2, "sliding-window") == "disponivel"

    print("ok: todos os cenários passaram")


if __name__ == "__main__":
    test()
