FROM python:3.11.8-slim

# Install curl for healthchecks
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV PYTHONPATH=/app:$PYTHONPATH

COPY backend/cart-service/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/shared /app/shared 
COPY backend/cart-service/main.py /app/main.py
COPY backend/cart-service/tests/ /app/tests/


EXPOSE 8003

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8003"]
