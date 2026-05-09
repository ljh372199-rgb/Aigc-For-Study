from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from uuid import UUID

class AIServiceProtocol(ABC):
    @abstractmethod
    async def generate_learning_plan(
        self,
        career_goal: str,
        skills_required: List[str]
    ) -> Dict[str, Any]:
        """生成学习方案"""
        pass
    
    @abstractmethod
    async def generate_exercises(
        self,
        topic: str,
        count: int,
        difficulty: str
    ) -> List[Dict[str, Any]]:
        """生成练习题"""
        pass
    
    @abstractmethod
    async def grade_exercise(
        self,
        content: str,
        answer: str
    ) -> Dict[str, Any]:
        """批改练习题"""
        pass
    
    @abstractmethod
    async def grade_assignment(
        self,
        title: str,
        description: str,
        content: str
    ) -> Dict[str, Any]:
        """批改作业"""
        pass
    
    @abstractmethod
    async def analyze_learning_progress(
        self,
        student_id: str
    ) -> Dict[str, Any]:
        """分析学习进度"""
        pass

def get_ai_service() -> AIServiceProtocol:
    """获取AI服务实例"""
    from app.core.config import settings
    
    provider = getattr(settings, 'AI_PROVIDER', 'deepseek')
    
    if provider == 'deepseek':
        from app.services.ai.deepseek_service import DeepSeekService
        return DeepSeekService()
    elif provider == 'openai':
        from app.services.ai.openai_service import OpenAIService
        return OpenAIService()
    elif provider == 'anthropic':
        from app.services.ai.anthropic_service import AnthropicService
        return AnthropicService()
    else:
        from app.services.ai.mock_service import MockAIService
        return MockAIService()
