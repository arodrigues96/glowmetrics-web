# pdf.py - Geração de PDF profissional
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from datetime import datetime

# Importar paleta do compare.py original
class ClinicPalette:
    BG_MAIN = colors.HexColor('#FDF8F6')
    BG_CARD = colors.HexColor('#FFFFFF')
    BG_ACCENT = colors.HexColor('#FFF5F3')
    ROSE = colors.HexColor('#D4A5A5')
    ROSE_DARK = colors.HexColor('#C48B8B')
    ROSE_LIGHT = colors.HexColor('#F5E1DE')
    GOLD = colors.HexColor('#C9A962')
    BEIGE = colors.HexColor('#E8DCD5')
    TAUPE = colors.HexColor('#9D8B7A')
    MINT = colors.HexColor('#7FB685')
    CORAL = colors.HexColor('#E07A5F')
    TEXT_DARK = colors.HexColor('#3D3D3D')
    TEXT_MEDIUM = colors.HexColor('#6B6B6B')
    TEXT_LIGHT = colors.HexColor('#9A9A9A')
    SUCCESS = colors.HexColor('#7FB685')
    WARNING = colors.HexColor('#E0A458')
    BORDER = colors.HexColor('#E8E0DC')
    BORDER_ACCENT = colors.HexColor('#D4A5A5')

def draw_clinic_background(c, w, h):
    """Desenha fundo elegante de clínica estética"""
    P = ClinicPalette
    c.setFillColor(P.BG_MAIN)
    c.rect(0, 0, w, h, fill=1, stroke=0)
    c.setFillColor(P.ROSE_LIGHT)
    c.setFillAlpha(0.3)
    c.circle(w + 50, h - 100, 200, fill=1, stroke=0)
    c.circle(-80, 150, 180, fill=1, stroke=0)
    c.setFillAlpha(1)

def draw_clinic_header(c, w, h):
    """Desenha header elegante com logo GlowMetrics"""
    P = ClinicPalette
    c.setFillColor(colors.white)
    c.rect(0, h - 90, w, 90, fill=1, stroke=0)
    c.setStrokeColor(P.GOLD)
    c.setLineWidth(2)
    c.line(30, h - 90, w - 30, h - 90)
    c.setFillColor(P.TEXT_DARK)
    c.setFont("Helvetica-Bold", 24)
    c.drawString(30, h - 45, "Análise Facial")
    c.setFillColor(P.ROSE_DARK)
    c.setFont("Helvetica", 11)
    c.drawString(30, h - 65, "Relatório de Resultados Estéticos")
    logo_x = w - 145
    c.setFillColor(P.GOLD)
    c.setFillAlpha(0.15)
    c.circle(logo_x + 12, h - 45, 20, fill=1, stroke=0)
    c.setFillAlpha(1)
    c.setStrokeColor(P.ROSE)
    c.setLineWidth(2)
    c.circle(logo_x + 12, h - 45, 12, fill=0, stroke=1)
    c.setFillColor(P.ROSE)
    c.circle(logo_x + 12, h - 45, 5, fill=1, stroke=0)
    c.setFillColor(P.ROSE_DARK)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(logo_x + 32, h - 40, "Glow")
    c.setFillColor(P.TEXT_DARK)
    c.drawString(logo_x + 68, h - 40, "Metrics")
    c.setFillColor(P.TEXT_LIGHT)
    c.setFont("Helvetica", 7)
    c.drawString(logo_x + 32, h - 52, "Análise de Beleza Inteligente")
    c.setFillColor(P.TEXT_LIGHT)
    c.setFont("Helvetica", 8)
    date_str = datetime.now().strftime('%d/%m/%Y às %H:%M')
    c.drawRightString(w - 30, h - 78, date_str)

def draw_metric_card_clinic(c, x, y, w_card, h_card, title, value, suffix="", improvement=None, color=None, P=None):
    """Desenha um card de métrica estilo clínica"""
    if P is None:
        P = ClinicPalette
    if color is None:
        color = P.ROSE
    c.setFillColor(colors.white)
    c.setStrokeColor(P.BORDER)
    c.setLineWidth(1)
    c.roundRect(x, y, w_card, h_card, 12, fill=1, stroke=1)
    c.setFillColor(color)
    c.roundRect(x + 10, y + h_card - 6, w_card - 20, 4, 2, fill=1, stroke=0)
    c.setFillColor(P.TEXT_LIGHT)
    c.setFont("Helvetica", 9)
    c.drawString(x + 15, y + h_card - 25, title)
    c.setFillColor(P.TEXT_DARK)
    c.setFont("Helvetica-Bold", 28)
    c.drawString(x + 15, y + 18, str(value))
    if suffix:
        c.setFillColor(P.TEXT_MEDIUM)
        c.setFont("Helvetica", 11)
        value_width = c.stringWidth(str(value), "Helvetica-Bold", 28)
        c.drawString(x + 18 + value_width, y + 22, suffix)
    if improvement is not None and improvement != 0:
        if improvement > 0:
            c.setFillColor(P.SUCCESS)
            prefix = "+"
        else:
            c.setFillColor(P.WARNING)
            prefix = ""
        c.setFont("Helvetica-Bold", 10)
        c.drawRightString(x + w_card - 15, y + 18, f"{prefix}{improvement:.0f}%")

def get_score_color(score, P):
    """Retorna a cor baseada no score"""
    colors_map = {
        "A": P.SUCCESS,
        "B": P.SUCCESS,
        "C": P.GOLD,
        "D": P.TEXT_LIGHT,
        "E": P.CORAL,
        "F": P.CORAL
    }
    return colors_map.get(score, P.TEXT_MEDIUM)

def wrap_text(c, text, max_width, font_name, font_size):
    """Quebra texto em múltiplas linhas baseado na largura máxima"""
    if not text:
        return []
    c.setFont(font_name, font_size)
    words = text.split()
    lines = []
    current_line = []
    for word in words:
        test_line = ' '.join(current_line + [word])
        width = c.stringWidth(test_line, font_name, font_size)
        if width <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(' '.join(current_line))
                current_line = [word]
            else:
                lines.append(word)
    if current_line:
        lines.append(' '.join(current_line))
    return lines if lines else [text]

def draw_region_card_clinic(c, x, y, w_card, title, subtitle, metrics, data, color, P, description="", score=""):
    """Desenha card de análise por região - estilo clínica com score A-E"""
    text_start_x = x + 60
    # Score fica no canto direito, então texto deve terminar antes dele (deixar ~50px de margem)
    text_end_x = x + w_card - 50
    text_width = text_end_x - text_start_x
    title_lines = wrap_text(c, title, text_width, "Helvetica-Bold", 11)
    desc_lines = wrap_text(c, description, text_width, "Helvetica-Oblique", 9)
    subtitle_lines = wrap_text(c, subtitle, text_width, "Helvetica", 7)
    title_height = len(title_lines) * 13
    desc_height = len(desc_lines) * 11
    subtitle_height = len(subtitle_lines) * 9
    text_total_height = title_height + desc_height + subtitle_height + 12
    h_card = max(68, text_total_height + 20)
    c.setFillColor(colors.white)
    c.setStrokeColor(P.BORDER)
    c.setLineWidth(1)
    c.roundRect(x, y - h_card, w_card, h_card, 12, fill=1, stroke=1)
    c.setFillColor(color)
    c.roundRect(x, y - h_card + 8, 4, h_card - 16, 2, fill=1, stroke=0)
    
    # Score como texto pequeno no canto superior direito, alinhado com o título
    score_color = get_score_color(score, P)
    score_label = {"A": "Excelente", "B": "Muito Bom", "C": "Bom", "D": "Estável", "E": "Atenção", "F": "Verificar"}.get(score, "")
    c.setFillColor(score_color)
    c.setFont("Helvetica-Bold", 8)
    c.drawRightString(x + w_card - 18, y - 18, score_label)
    
    c.setFillColor(P.TEXT_DARK)
    c.setFont("Helvetica-Bold", 11)
    title_text = c.beginText(text_start_x, y - 18)
    title_text.setFont("Helvetica-Bold", 11)
    title_text.setFillColor(P.TEXT_DARK)
    for line in title_lines:
        title_text.textLine(line)
    c.drawText(title_text)
    title_height = len(title_lines) * 13
    desc_y = y - 18 - title_height - 4
    c.setFillColor(P.TEXT_MEDIUM)
    c.setFont("Helvetica-Oblique", 9)
    desc_text = c.beginText(text_start_x, desc_y)
    desc_text.setFont("Helvetica-Oblique", 9)
    desc_text.setFillColor(P.TEXT_MEDIUM)
    for line in desc_lines:
        desc_text.textLine(line)
    c.drawText(desc_text)
    desc_height = len(desc_lines) * 11
    subtitle_y = desc_y - desc_height - 4
    c.setFillColor(P.TEXT_LIGHT)
    c.setFont("Helvetica", 7)
    subtitle_text = c.beginText(text_start_x, subtitle_y)
    subtitle_text.setFont("Helvetica", 7)
    subtitle_text.setFillColor(P.TEXT_LIGHT)
    for line in subtitle_lines:
        subtitle_text.textLine(line)
    c.drawText(subtitle_text)
    return h_card

def make_clinic_pdf(before_path, after_path, analysis_results, out_pdf):
    """Gera PDF profissional com estética de Clínica Estética"""
    c = canvas.Canvas(out_pdf, pagesize=A4)
    w, h = A4
    P = ClinicPalette
    draw_clinic_background(c, w, h)
    draw_clinic_header(c, w, h)
    y_pos = h - 118
    c.setFillColor(P.ROSE_DARK)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(30, y_pos, "Sua Transformação")
    c.setStrokeColor(P.GOLD)
    c.setLineWidth(1)
    c.line(145, y_pos + 4, 200, y_pos + 4)
    y_pos -= 22
    img_w = 115
    img_h = 145
    card_w = 145
    card_h = img_h + 38
    card_x = 30
    card_y = y_pos - card_h
    c.setFillColor(colors.white)
    c.setStrokeColor(P.BORDER)
    c.setLineWidth(1)
    c.roundRect(card_x, card_y, card_w, card_h, 12, fill=1, stroke=1)
    c.setFillColor(P.TEXT_LIGHT)
    c.setFont("Helvetica", 9)
    c.drawCentredString(card_x + card_w/2, card_y + card_h - 18, "Antes")
    img_x = card_x + (card_w - img_w) / 2
    img_y = card_y + 10
    c.drawImage(before_path, img_x, img_y, width=img_w, height=img_h, preserveAspectRatio=True, mask='auto')
    arrow_x = card_x + card_w + 12
    arrow_y = card_y + card_h/2
    c.setStrokeColor(P.ROSE)
    c.setLineWidth(1.5)
    c.line(arrow_x, arrow_y, arrow_x + 28, arrow_y)
    c.line(arrow_x + 20, arrow_y - 5, arrow_x + 28, arrow_y)
    c.line(arrow_x + 20, arrow_y + 5, arrow_x + 28, arrow_y)
    card_x2 = card_x + card_w + 52
    c.setFillColor(colors.white)
    c.setStrokeColor(P.ROSE)
    c.setLineWidth(2)
    c.roundRect(card_x2, card_y, card_w, card_h, 12, fill=1, stroke=1)
    c.setFillColor(P.ROSE_DARK)
    c.setFont("Helvetica-Bold", 9)
    c.drawCentredString(card_x2 + card_w/2, card_y + card_h - 18, "Depois")
    img_x2 = card_x2 + (card_w - img_w) / 2
    c.drawImage(after_path, img_x2, img_y, width=img_w, height=img_h, preserveAspectRatio=True, mask='auto')
    y_pos = card_y - 28
    c.setFillColor(P.ROSE_DARK)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(30, y_pos, "Análise por Região")
    c.setStrokeColor(P.GOLD)
    c.setLineWidth(1)
    c.line(150, y_pos + 4, 205, y_pos + 4)
    y_pos -= 18
    area_config = {
        "forehead": {
            "name": "Região Frontal",
            "subtitle": "Toxina Botulínica",
            "color": P.ROSE,
            "metrics": [("wrinkle_reduction", "Linhas"), ("smoothness_improvement", "Suavização")],
            "phrases": {
                "A": "Linhas de expressão visivelmente mais suaves",
                "B": "Boa redução nas linhas de expressão",
                "C": "Melhoria moderada na região",
                "D": "Região em estabilização",
                "E": "Região em processo de adaptação"
            }
        },
        "nose": {
            "name": "Região Nasal",
            "subtitle": "Refinamento",
            "color": P.GOLD,
            "metrics": [("texture_improvement", "Textura")],
            "phrases": {
                "A": "Textura visivelmente mais refinada",
                "B": "Boa melhoria na textura da pele",
                "C": "Melhoria moderada na textura",
                "D": "Região em estabilização",
                "E": "Região em processo de adaptação"
            }
        },
        "under_eye": {
            "name": "Área Infraorbital",
            "subtitle": "Preenchimento",
            "color": P.TAUPE,
            "metrics": [("brightness_improvement", "Clareamento"), ("uniformity_improvement", "Uniformidade"), ("texture_improvement", "Textura")],
            "phrases": {
                "A": "Área visivelmente mais iluminada e uniforme",
                "B": "Boa melhoria na luminosidade e textura",
                "C": "Melhoria moderada na região",
                "D": "Região em estabilização",
                "E": "Verifique a ordem das imagens",
                "F": "Consulte seu profissional"
            }
        }
    }
    areas_data = analysis_results.get("areas", {})
    for area_key in ["forehead", "nose", "under_eye"]:
        if area_key not in areas_data:
            continue
        config = area_config[area_key]
        data = areas_data[area_key]
        score = data.get("score")
        description = data.get("description")
        if not score or not description:
            avg_metrics = data.get("overall_score", 0)
            if avg_metrics == 0:
                metric_values = []
                for metric_key, _ in config["metrics"]:
                    if metric_key in data:
                        metric_values.append(data[metric_key])
                avg_metrics = sum(metric_values) / len(metric_values) if metric_values else 0
            if avg_metrics >= 30:
                score = "A"
            elif avg_metrics >= 15:
                score = "B"
            elif avg_metrics >= 5:
                score = "C"
            elif avg_metrics >= 0:
                score = "D"
            elif avg_metrics >= -10:
                score = "E"
            else:
                score = "F"
            if not description:
                description = config["phrases"].get(score, "Região analisada")
        card_h = draw_region_card_clinic(
            c, 30, y_pos, w - 60,
            config["name"], config["subtitle"],
            config["metrics"], data,
            config["color"], P, description, score
        )
        y_pos -= card_h + 10
    c.setStrokeColor(P.GOLD)
    c.setLineWidth(0.8)
    c.line(30, 62, w - 30, 62)
    c.setFillColor(P.TEXT_LIGHT)
    c.setFont("Helvetica", 7)
    disclaimer = "*Análise realizada por Inteligência Artificial. Não substitui avaliação médica profissional."
    c.drawCentredString(w/2, 48, disclaimer)
    c.setFillColor(P.ROSE_DARK)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(30, 28, "GlowMetrics")
    c.setFillColor(P.TEXT_LIGHT)
    c.setFont("Helvetica", 8)
    c.drawString(92, 28, "• Análise de Beleza Inteligente")
    c.setFillColor(P.TEXT_LIGHT)
    c.setFont("Helvetica", 7)
    c.drawRightString(w - 30, 28, "v2.0 Clinic Edition")
    c.save()

