import logging
import sys
import re

LOG_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"

def redact_sensitive(text: str) -> str:
    """Mask potential API keys or tokens in log strings."""
    if not isinstance(text, str):
        return text
    # Mask common key patterns
    text = re.sub(r'(sk-[a-zA-Z0-9]{20,})', r'sk-***[REDACTED]***', text)
    text = re.sub(r'(AIza[a-zA-Z0-9_-]{35})', r'AIza***[REDACTED]***', text)
    text = re.sub(r'(Bearer\s+[a-zA-Z0-9_\-\.]{20,})', r'Bearer ***[REDACTED]***', text)
    return text

class RedactingFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        orig = super().format(record)
        return redact_sensitive(orig)

def setup_logging(level: str = "INFO") -> logging.Logger:
    logger = logging.getLogger("genquantaa_adlc")
    logger.setLevel(getattr(logging, level.upper(), logging.INFO))
    
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(RedactingFormatter(LOG_FORMAT))
        logger.addHandler(handler)
        
    return logger

logger = setup_logging()
