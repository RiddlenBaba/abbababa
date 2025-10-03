#!/usr/bin/env python3
"""
Test Content Generator - Creates sample blog post to demonstrate the system
"""

import datetime
from content_research_agent import ContentResearchAgent, TrendInsight

def generate_sample_content():
    """Generate sample content to test the system"""
    agent = ContentResearchAgent()

    # Create sample insights
    sample_insights = [
        TrendInsight(
            title="OpenAI Launches GPT-5 with Advanced Reasoning Capabilities",
            description="OpenAI has announced GPT-5, featuring enhanced reasoning abilities and improved accuracy for complex business tasks. The new model shows significant improvements in logical reasoning, mathematical problem-solving, and strategic analysis capabilities.",
            source="OpenAI Blog",
            business_application="Streamline customer service operations with AI-powered response systems that can handle complex queries requiring multi-step reasoning.",
            abba_baba_connection="Our AI integration consulting services can help you evaluate and implement these advanced capabilities strategically for maximum business impact.",
            urgency="immediate",
            category="ai-innovation",
            date=datetime.datetime.now()
        ),
        TrendInsight(
            title="Microsoft Copilot Studio Enables Custom Business Automations",
            description="Microsoft has expanded Copilot Studio to allow businesses to create custom AI agents for specific workflow automation tasks, connecting directly with existing business systems.",
            source="Microsoft AI Blog",
            business_application="Automate repetitive data processing tasks to free up strategic time while maintaining integration with existing Microsoft 365 workflows.",
            abba_baba_connection="This innovation aligns perfectly with our workflow automation expertise - we can help integrate these capabilities into your existing business processes.",
            urgency="short-term",
            category="business-tech",
            date=datetime.datetime.now()
        ),
        TrendInsight(
            title="Anthropic Claude 3.5 Sonnet Shows Breakthrough in Code Generation",
            description="Anthropic's latest Claude model demonstrates significant improvements in understanding business requirements and generating automation scripts for workflow optimization.",
            source="Anthropic",
            business_application="Enhance marketing personalization through intelligent automation that adapts to customer behavior patterns in real-time.",
            abba_baba_connection="As demonstrated by our Riddlen platform, we specialize in human-AI collaboration that preserves agency while amplifying capabilities.",
            urgency="immediate",
            category="ai-innovation",
            date=datetime.datetime.now()
        )
    ]

    print("🎯 Generating sample blog post with test insights...")

    # Generate blog post using the sample insights
    blog_post = agent.generate_blog_post(sample_insights, "trend_analysis")

    if blog_post:
        # Save to file
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d")
        filename = f"../_posts/{timestamp}-sample-ai-trends-for-business.md"

        with open(filename, 'w') as f:
            f.write(blog_post)

        print(f"✅ Sample blog post generated: {filename}")
        print(f"📄 Content length: {len(blog_post)} characters")
        print("\n📝 Blog post preview:")
        print("-" * 60)
        print(blog_post[:800] + "...")
        print("-" * 60)
        print("\n🚀 Check your _posts directory for the full content!")

        return filename
    else:
        print("❌ Failed to generate sample content")
        return None

if __name__ == "__main__":
    print("🧪 Abba Baba Content Research Agent - Test Mode")
    print("=" * 60)
    generate_sample_content()