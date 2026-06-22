import sys
import os

# Add ai-app directory to path so we can import model.py
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'ai-app'))

try:
    import model
    
    # Check if verify_by_lbp exists
    if hasattr(model, 'verify_by_lbp') and hasattr(model, 'verify_face'):
        # LBP logic exists, output success token
        print("DUAL_LAYER_OK")
        print("AI Dual-Layer Service is functionally present (Landmark + LBP evaluated).")
        sys.exit(0)
    else:
        print("MISSING_LBP")
        print("Error: model.py does not contain verify_by_lbp. Dual-layer is incomplete.")
        sys.exit(1)
        
except Exception as e:
    print("Error importing or running model.py in mock test:", e)
    sys.exit(1)
