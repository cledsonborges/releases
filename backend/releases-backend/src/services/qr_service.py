import qrcode
import io
import base64
from PIL import Image
from datetime import datetime

class QRCodeService:
    """Serviço para geração de QR codes"""
    
    def __init__(self):
        pass
    
    def generate_qr_code(self, data, size=(10, 10)):
        """Gera um QR code e retorna como base64"""
        try:
            # Criar QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(data)
            qr.make(fit=True)
            
            # Criar imagem
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Converter para base64
            buffer = io.BytesIO()
            img.save(buffer, format='PNG')
            img_str = base64.b64encode(buffer.getvalue()).decode()
            
            return f"data:image/png;base64,{img_str}"
            
        except Exception as e:
            print(f"Erro ao gerar QR code: {e}")
            return None
    
    def generate_environment_qr(self, environment_url, environment_name):
        """Gera QR code específico para ambientes (Homolog/Alpha)"""
        try:
            qr_data = {
                'url': environment_url,
                'environment': environment_name,
                'generated_at': str(datetime.now())
            }
            
            # Para QR codes simples, usar apenas a URL
            return self.generate_qr_code(environment_url)
            
        except Exception as e:
            print(f"Erro ao gerar QR code do ambiente: {e}")
            return None

