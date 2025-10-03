#!/usr/bin/env python3
"""
Abba Baba Content Scheduler
Automated content generation and publishing workflow
"""

import schedule
import time
import datetime
import os
import shutil
from content_research_agent import ContentResearchAgent
import yaml

class ContentScheduler:
    def __init__(self, posts_dir="../_posts"):
        self.posts_dir = posts_dir
        self.agent = ContentResearchAgent()
        self.content_calendar = self._load_content_calendar()

    def _load_content_calendar(self):
        """Load content calendar configuration"""
        return {
            "monday": {
                "type": "trend_analysis",
                "focus": "weekly_ai_updates",
                "priority": "high"
            },
            "wednesday": {
                "type": "tool_spotlight",
                "focus": "new_ai_tools",
                "priority": "medium"
            },
            "friday": {
                "type": "innovation_deep_dive",
                "focus": "business_strategy",
                "priority": "high"
            }
        }

    def generate_scheduled_content(self, content_type="trend_analysis"):
        """Generate content based on schedule"""
        print(f"🤖 Generating {content_type} content...")

        # Run research cycle
        blog_content = self.agent.run_research_cycle()

        if blog_content:
            # Create filename with current date
            today = datetime.datetime.now()
            filename = f"{today.strftime('%Y-%m-%d')}-{content_type.replace('_', '-')}.md"
            filepath = os.path.join(self.posts_dir, filename)

            # Ensure posts directory exists
            os.makedirs(self.posts_dir, exist_ok=True)

            # Write content to file
            with open(filepath, 'w') as f:
                f.write(blog_content)

            print(f"✅ Content generated: {filename}")
            return filepath
        else:
            print("❌ No content generated")
            return None

    def monday_content(self):
        """Monday: Trend Analysis & Weekly Updates"""
        return self.generate_scheduled_content("trend_analysis")

    def wednesday_content(self):
        """Wednesday: Tool Spotlight"""
        return self.generate_scheduled_content("tool_spotlight")

    def friday_content(self):
        """Friday: Innovation Deep Dive"""
        return self.generate_scheduled_content("innovation_deep_dive")

    def setup_schedule(self):
        """Set up automated content generation schedule"""
        # Schedule content generation
        schedule.every().monday.at("09:00").do(self.monday_content)
        schedule.every().wednesday.at("09:00").do(self.wednesday_content)
        schedule.every().friday.at("09:00").do(self.friday_content)

        print("📅 Content generation schedule configured:")
        print("   Monday 9:00 AM    - AI Trend Analysis")
        print("   Wednesday 9:00 AM - Tool Spotlight")
        print("   Friday 9:00 AM    - Innovation Deep Dive")

    def run_scheduler(self):
        """Run the content scheduler"""
        self.setup_schedule()

        print("🚀 Content scheduler running...")
        print("Press Ctrl+C to stop")

        try:
            while True:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
        except KeyboardInterrupt:
            print("\n🛑 Content scheduler stopped")

def main():
    scheduler = ContentScheduler()

    import sys
    if len(sys.argv) > 1:
        if sys.argv[1] == "generate":
            # Manual content generation
            content_type = sys.argv[2] if len(sys.argv) > 2 else "trend_analysis"
            scheduler.generate_scheduled_content(content_type)
        elif sys.argv[1] == "schedule":
            # Run automated scheduler
            scheduler.run_scheduler()
    else:
        print("Usage:")
        print("  python content-scheduler.py generate [type]  # Generate content now")
        print("  python content-scheduler.py schedule         # Run automated scheduler")
        print("\nContent types: trend_analysis, tool_spotlight, innovation_deep_dive")

if __name__ == "__main__":
    main()