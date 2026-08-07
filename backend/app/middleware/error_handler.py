import uuid
import logging
from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.exceptions import DomainException

logger = logging.getLogger("devfolio.middleware")

class ExceptionAndCorrelationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        # Correlate / track request ID across HTTP requests and Celery context
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.state.request_id = request_id

        try:
            response = await call_next(request)
            response.headers["X-Request-ID"] = request_id
            return response
        except DomainException as exc:
            logger.warning(f"[{request_id}] DomainException ({exc.code}): {exc.message}")
            return JSONResponse(
                status_code=exc.status_code,
                content={
                    "error": {
                        "code": exc.code,
                        "message": exc.message,
                        "details": exc.details,
                        "request_id": request_id
                    }
                },
                headers={"X-Request-ID": request_id}
            )
        except Exception as exc:
            logger.error(f"[{request_id}] Unhandled Exception: {str(exc)}", exc_info=True)
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "error": {
                        "code": "INTERNAL_SERVER_ERROR",
                        "message": "An unexpected error occurred on the server.",
                        "details": {},
                        "request_id": request_id
                    }
                },
                headers={"X-Request-ID": request_id}
            )
