import logging
from app.adapters.falkordb_adapter import db_adapter
from app.seed.finflow_data import (
    PEOPLE, SERVICES, CUSTOMER_TIERS, SLACK_MESSAGES,
    DECISIONS, JIRA_TICKETS, PULL_REQUESTS, DOCUMENTS, RELATIONSHIPS
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_graph():
    """
    Seeds the FinFlow enterprise graph into FalkorDB and the in-memory graph adapter.
    """
    logger.info("Starting enterprise graph seeding (FinFlow Inc.)...")
    db_adapter.clear()
    
    # If connected to FalkorDB, create schema and nodes via Cypher
    if db_adapter.is_connected and db_adapter.graph:
        try:
            logger.info("Connected to FalkorDB! Clearing previous graph data...")
            db_adapter.graph.query("MATCH (n) DETACH DELETE n")
        except Exception as e:
            logger.warning(f"Could not clear graph: {e}")

    # 1. Seed People
    for p in PEOPLE:
        db_adapter.register_node(
            node_id=p["id"],
            label="Person",
            title=p["name"],
            properties=p
        )
        if db_adapter.is_connected and db_adapter.graph:
            db_adapter.query(
                "MERGE (p:Person {id: $id}) SET p.name = $name, p.handle = $handle, p.role = $role, p.department = $department",
                p
            )

    # 2. Seed Services
    for s in SERVICES:
        db_adapter.register_node(
            node_id=s["id"],
            label="Service",
            title=s["name"],
            properties=s
        )
        if db_adapter.is_connected and db_adapter.graph:
            db_adapter.query(
                "MERGE (s:Service {id: $id}) SET s.name = $name, s.tier = $tier, s.description = $description",
                s
            )

    # 3. Seed Customer Tiers
    for c in CUSTOMER_TIERS:
        db_adapter.register_node(
            node_id=c["id"],
            label="CustomerTier",
            title=c["name"],
            properties=c
        )
        if db_adapter.is_connected and db_adapter.graph:
            db_adapter.query(
                "MERGE (c:CustomerTier {id: $id}) SET c.name = $name, c.sla_level = $sla_level, c.tier_name = $tier_name",
                c
            )

    # 4. Seed Slack Messages
    for msg in SLACK_MESSAGES:
        db_adapter.register_node(
            node_id=msg["id"],
            label="SlackMessage",
            title=f"{msg['channel']} ({msg['author_handle']})",
            properties=msg
        )
        if db_adapter.is_connected and db_adapter.graph:
            db_adapter.query(
                "MERGE (m:SlackMessage {id: $id}) SET m.channel = $channel, m.author_handle = $author_handle, m.text = $text, m.timestamp = $timestamp",
                msg
            )

    # 5. Seed Decisions
    for d in DECISIONS:
        db_adapter.register_node(
            node_id=d["id"],
            label="Decision",
            title=d["title"],
            properties=d
        )
        if db_adapter.is_connected and db_adapter.graph:
            db_adapter.query(
                "MERGE (d:Decision {id: $id}) SET d.title = $title, d.status = $status, d.rationale = $rationale, d.timestamp = $timestamp",
                d
            )

    # 6. Seed Jira Tickets
    for j in JIRA_TICKETS:
        db_adapter.register_node(
            node_id=j["id"],
            label="JiraTicket",
            title=f"{j['key']}: {j['summary']}",
            properties=j
        )
        if db_adapter.is_connected and db_adapter.graph:
            db_adapter.query(
                "MERGE (j:JiraTicket {id: $id}) SET j.key = $key, j.summary = $summary, j.priority = $priority, j.issue_type = $issue_type",
                j
            )

    # 7. Seed Pull Requests
    for pr in PULL_REQUESTS:
        db_adapter.register_node(
            node_id=pr["id"],
            label="PullRequest",
            title=f"PR #{pr['number']}: {pr['title']}",
            properties=pr
        )
        if db_adapter.is_connected and db_adapter.graph:
            db_adapter.query(
                "MERGE (pr:PullRequest {id: $id}) SET pr.number = $number, pr.title = $title, pr.author_handle = $author_handle, pr.diff_summary = $diff_summary",
                pr
            )

    # 8. Seed Documents
    for doc in DOCUMENTS:
        db_adapter.register_node(
            node_id=doc["id"],
            label="Document",
            title=doc["title"],
            properties=doc
        )
        if db_adapter.is_connected and db_adapter.graph:
            db_adapter.query(
                "MERGE (doc:Document {id: $id}) SET doc.title = $title, doc.doc_type = $doc_type, doc.is_stale = $is_stale, doc.content_summary = $content_summary",
                doc
            )

    # 9. Seed Relationships
    for src, tgt, rel, props in RELATIONSHIPS:
        db_adapter.register_edge(
            source_id=src,
            target_id=tgt,
            rel_type=rel,
            properties=props
        )
        if db_adapter.is_connected and db_adapter.graph:
            cypher = f"""
            MATCH (a {{id: $src}}), (b {{id: $tgt}})
            MERGE (a)-[r:{rel}]->(b)
            """
            try:
                db_adapter.query(cypher, {"src": src, "tgt": tgt})
            except Exception as e:
                logger.error(f"Failed to create edge ({src})-[{rel}]->({tgt}): {e}")

    logger.info(f"Seeding completed successfully! Total registered nodes: {len(db_adapter._node_data)}, edges: {len(db_adapter._edge_data)}")
    return True

if __name__ == "__main__":
    seed_graph()
