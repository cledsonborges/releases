import google.generativeai as genai
from src.config import Config

class GeminiService:
    """Serviço para integração com Gemini AI"""
    
    def __init__(self):
        genai.configure(api_key=Config.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-pro')
    
    def generate_release_notes(self, release_data):
        """Gera release notes baseado nos dados da release"""
        try:
            # Preparar dados das entregas para o prompt
            entregas_text = ""
            if 'entregas' in release_data and release_data['entregas']:
                entregas_text = "\n".join([
                    f"- {entrega.get('titulo', 'Sem título')}: {entrega.get('descricao', 'Sem descrição')}"
                    for entrega in release_data['entregas']
                ])
            else:
                entregas_text = "Nenhuma entrega específica informada."
            
            # Preparar dados das squads
            squads_text = ""
            if 'squads_participantes' in release_data and release_data['squads_participantes']:
                squads_text = ", ".join(release_data['squads_participantes'])
            else:
                squads_text = "Squads não especificadas."
            
            # Criar prompt para o Gemini
            prompt = f"""
            Você é um especialista em documentação técnica e release notes. 
            Crie um release notes profissional e bem estruturado baseado nas seguintes informações:

            **Release:** {release_data.get('release_name', 'Release sem nome')}
            **Ambiente:** {release_data.get('ambiente', 'Não especificado')}
            **Versão Homolog:** {release_data.get('versao_homolog', 'Não especificada')}
            **Versão Alpha:** {release_data.get('versao_alpha', 'Não especificada')}
            **Versão Firebase:** {release_data.get('versao_firebase', 'Não especificada')}
            **Squads Participantes:** {squads_text}
            **Release Exclusiva:** {'Sim' if release_data.get('release_exclusiva', False) else 'Não'}

            **Entregas/Funcionalidades:**
            {entregas_text}

            Por favor, crie um release notes que inclua:
            1. Um título atrativo
            2. Resumo executivo das principais mudanças
            3. Lista detalhada das funcionalidades/melhorias
            4. Informações técnicas relevantes
            5. Instruções de teste (se aplicável)
            6. Notas importantes para os usuários

            Use um tom profissional mas acessível, e organize o conteúdo de forma clara e estruturada.
            """
            
            response = self.model.generate_content(prompt)
            return response.text
            
        except Exception as e:
            print(f"Erro ao gerar release notes: {e}")
            return f"Erro ao gerar release notes automaticamente. Erro: {str(e)}"
    
    def generate_test_summary(self, release_data, test_results):
        """Gera um resumo dos testes realizados"""
        try:
            prompt = f"""
            Crie um resumo executivo dos testes realizados para a release {release_data.get('release_name', 'Release')}.
            
            Dados da Release:
            - Ambiente: {release_data.get('ambiente', 'Não especificado')}
            - SLA: {release_data.get('sla_duration_hours', 24)} horas
            - Status: {release_data.get('status', 'Não especificado')}
            
            Resultados dos Testes:
            {test_results}
            
            Crie um resumo profissional que inclua:
            1. Status geral dos testes
            2. Principais achados
            3. Recomendações
            4. Próximos passos
            """
            
            response = self.model.generate_content(prompt)
            return response.text
            
        except Exception as e:
            print(f"Erro ao gerar resumo de testes: {e}")
            return f"Erro ao gerar resumo de testes. Erro: {str(e)}"

