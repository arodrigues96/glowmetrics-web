# parse.py - Parser de resposta do ChatGPT
import json

def parse_chatgpt_response(response_text):
    """Converte resposta do ChatGPT para formato esperado pelo PDF"""
    if not response_text:
        return None
    
    try:
        text = response_text.strip()
        
        # Remover markdown code blocks se existir
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]
        
        # Tentar parse direto
        data = json.loads(text)
        
        # Converter para formato esperado
        result = {
            "areas": {},
            "global": {}
        }
        
        # Áreas
        areas_data = data.get("areas", {})
        
        # Validar scores (A-F)
        def validate_score(score):
            if isinstance(score, str) and score.upper() in ["A", "B", "C", "D", "E", "F"]:
                return score.upper()
            return "D"
        
        if "forehead" in areas_data:
            fh = areas_data["forehead"]
            metrics = fh.get("metrics", {})
            result["areas"]["forehead"] = {
                "wrinkle_reduction": metrics.get("wrinkle_reduction", 0),
                "smoothness_improvement": metrics.get("smoothness_improvement", 0),
                "overall_score": max(metrics.get("wrinkle_reduction", 0), metrics.get("smoothness_improvement", 0)),
                "score": validate_score(fh.get("score", "D")),
                "description": fh.get("description", "Região analisada")
            }
        
        if "nose" in areas_data:
            nose = areas_data["nose"]
            metrics = nose.get("metrics", {})
            result["areas"]["nose"] = {
                "texture_improvement": metrics.get("texture_improvement", 0),
                "overall_score": metrics.get("texture_improvement", 0),
                "score": validate_score(nose.get("score", "D")),
                "description": nose.get("description", "Região analisada")
            }
        
        if "under_eye" in areas_data:
            ue = areas_data["under_eye"]
            metrics = ue.get("metrics", {})
            improvements = [
                metrics.get("brightness_improvement", 0),
                metrics.get("uniformity_improvement", 0),
                metrics.get("texture_improvement", 0)
            ]
            avg = sum(improvements) / len(improvements) if improvements else 0
            result["areas"]["under_eye"] = {
                "brightness_improvement": metrics.get("brightness_improvement", 0),
                "uniformity_improvement": metrics.get("uniformity_improvement", 0),
                "texture_improvement": metrics.get("texture_improvement", 0),
                "overall_score": avg,
                "score": validate_score(ue.get("score", "D")),
                "description": ue.get("description", "Região analisada")
            }
        
        # Global
        global_data = data.get("global", {})
        age_data = global_data.get("apparent_age", {})
        
        result["global"]["apparent_age"] = {
            "after": age_data.get("after", 35),
            "reduction": age_data.get("reduction", 0)
        }
        
        result["global"]["symmetry"] = {
            "after": global_data.get("harmony", 85),
            "improvement": 0
        }
        
        return result
        
    except json.JSONDecodeError as e:
        raise Exception(f"Erro ao parsear JSON: {str(e)}")
    except Exception as e:
        raise Exception(f"Erro ao processar resposta: {str(e)}")

