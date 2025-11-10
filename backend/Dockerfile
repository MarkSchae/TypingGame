# /backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Set Python unbuffered
ENV PYTHONUNBUFFERED=1

# Run Daphne (ASGI server) on port 8080
CMD ["daphne", "-b", "0.0.0.0", "-p", "8080", "typgame.asgi:application"]
