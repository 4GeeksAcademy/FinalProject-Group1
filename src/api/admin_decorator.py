from flask_jwt_extended import get_jwt, verify_jwt_in_request
from functools import wraps
from flask import jsonify

def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            try:
                verify_jwt_in_request()
            except Exception:
                return jsonify({"message": "Unauthorized access. Invalid or missing token."}), 401

            current_user_claims = get_jwt()
            
            if current_user_claims.get("rol") != "admin":
                return jsonify({"message": "Access prohibited. Administrator role required.."}), 403
        
            return fn(*args, **kwargs)
        return decorator
    return wrapper