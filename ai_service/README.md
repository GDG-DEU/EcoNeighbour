## EcoNeighbour AI Service (Quick Use)

### Prerequisites
- Python 3.12+
- Ollama running locally
- Model available: `qwen3.5:2b`

### 1) Install dependencies
```bash
uv sync
```

### 2) Start Ollama and pull the model
```bash
ollama serve
ollama pull qwen3.5:2b
```

### 3) Run the API
```bash
uv run python main.py
```

API docs:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 4) Parse an invoice image
```bash
curl -X POST \
	-F "file=@/path/to/invoice.jpg" \
	http://localhost:8000/api/v1/invoice/parse
```

### Response shape
```json
{
	"consumption_value": 123.45,
	"address_data": "123 Main St, City, 12345",
	"billing_period": "03/2025"
}
```

### Notes
- Config lives in `config.py` (Ollama URL, model, timeout).
- Max upload size is 10 MB.
