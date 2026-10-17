import pytest
from unittest.mock import patch, MagicMock
from app.services.llm_service import GeminiService
from app.adapters.falkordb_adapter import db_adapter

def test_gemini_service_availability():
    service = GeminiService()
    service.api_key = ""
    with patch("app.config.settings.GEMINI_API_KEY", ""):
        assert not service.is_available()

    service.api_key = "AIzaSyFakeKey1234567890"
    assert service.is_available()

def test_gemini_build_graph_context():
    service = GeminiService()
    db_adapter.clear()
    
    # Empty context
    empty_ctx = service.build_graph_context()
    assert "0 nodes" in empty_ctx

    # Seed one node and one edge
    db_adapter.add_custom_node("proj_alpha", "Project", "Alpha Cloud", {"priority": "P0"})
    db_adapter.add_custom_node("team_alpha", "Team", "Team Alpha", {})
    db_adapter.add_custom_edge("team_alpha", "proj_alpha", "DELIVERS")

    ctx = service.build_graph_context()
    assert "Alpha Cloud" in ctx
    assert "Team Alpha" in ctx
    assert "DELIVERS" in ctx
    
    db_adapter.clear()

def test_gemini_query_graph_mocked_success():
    service = GeminiService()
    db_adapter.clear()
    db_adapter.add_custom_node("proj_test", "Project", "Test Project", {"status": "Active"})

    mock_gemini_response = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {
                            "text": (
                                "Test Project is currently active and marked as high priority.\n\n"
                                "```json\n"
                                "{\"relevant_node_ids\": [\"proj_test\"]}\n"
                                "```"
                            )
                        }
                    ]
                }
            }
        ]
    }

    mock_http_response = MagicMock()
    mock_http_response.status_code = 200
    mock_http_response.json.return_value = mock_gemini_response

    with patch("app.config.settings.GEMINI_API_KEY", "AIzaSyFakeKey1234567890"):
        service.api_key = "AIzaSyFakeKey1234567890"
        with patch("httpx.Client.post", return_value=mock_http_response):
            result = service.query_graph("What is the status of Test Project?")

    assert result is not None
    assert "Test Project is currently active" in result["answer"]
    assert "proj_test" in [n["id"] for n in result["graph"]["nodes"]]
    assert result["tool_called"].startswith("gemini_")

    db_adapter.clear()
