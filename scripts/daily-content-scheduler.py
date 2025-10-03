#!/usr/bin/env python3
"""
Daily Content Scheduler for Abba Baba
Runs automated content generation at scheduled intervals throughout the day
"""

import schedule
import time
import datetime
import os
import sys

# Import the content research agent from current directory
import importlib.util
spec = importlib.util.spec_from_file_location("content_research_agent", "content-research-agent.py")
content_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(content_module)
ContentResearchAgent = content_module.ContentResearchAgent

class DailyContentScheduler:
    def __init__(self):
        self.agent = ContentResearchAgent()
        self.posts_generated_today = 0
        self.max_daily_posts = 3

        # Content type rotation schedule
        self.content_rotation = [
            "trend_analysis",
            "tool_spotlight",
            "innovation_deep_dive"
        ]

    def generate_scheduled_content(self, content_type=None):
        """Generate content and handle file management"""
        try:
            print(f"\n🕐 {datetime.datetime.now().strftime('%H:%M:%S')} - Starting scheduled content generation...")

            # Check daily limit
            if self.posts_generated_today >= self.max_daily_posts:
                print(f"⏹️  Daily limit reached ({self.max_daily_posts} posts). Skipping generation.")
                return

            # Auto-select content type if not specified
            if not content_type:
                content_type = self.content_rotation[self.posts_generated_today % len(self.content_rotation)]

            print(f"📝 Generating: {content_type}")

            # Run research cycle
            articles = self.agent.fetch_rss_feeds()
            insights = self.agent.analyze_trends(articles)

            if insights:
                blog_post = self.agent.generate_blog_post(insights[:3], content_type)

                if blog_post:
                    # Create descriptive filename
                    timestamp = datetime.datetime.now().strftime("%Y-%m-%d")
                    content_type_short = content_type.replace("_", "-")
                    filename = f"../_posts/{timestamp}-{content_type_short}-{self.posts_generated_today + 1:02d}.md"

                    with open(filename, 'w') as f:
                        f.write(blog_post)

                    self.posts_generated_today += 1

                    print(f"✅ Generated post {self.posts_generated_today}/{self.max_daily_posts}: {filename}")
                    print(f"📊 Content length: {len(blog_post)} characters")
                    print(f"💡 Insights used: {len(insights[:3])}")

                    # Auto-commit and push to GitHub
                    self.git_commit_and_push(filename, content_type)
                else:
                    print("❌ Failed to generate blog content")
            else:
                print("⚠️  No relevant insights found in this cycle")

        except Exception as e:
            print(f"❌ Error in scheduled generation: {e}")

    def git_commit_and_push(self, filename, content_type):
        """Automatically commit and push new blog posts to GitHub"""
        try:
            import subprocess

            # Change to the main project directory
            project_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

            print(f"📡 Auto-committing and pushing to GitHub...")

            # Add the new file (use relative path from project root)
            relative_filename = os.path.relpath(filename, project_dir)
            subprocess.run(["git", "add", relative_filename], cwd=project_dir, check=True)

            # Create commit message
            timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
            commit_msg = f"""Add automated {content_type.replace('_', ' ')} post - {timestamp}

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"""

            # Commit the changes
            subprocess.run(["git", "commit", "-m", commit_msg], cwd=project_dir, check=True)

            # Push to GitHub
            subprocess.run(["git", "push"], cwd=project_dir, check=True)

            print(f"🚀 Successfully pushed to GitHub!")
            print(f"📝 Post will be live on GitHub Pages shortly")

        except subprocess.CalledProcessError as e:
            print(f"⚠️  Git operation failed: {e}")
            print(f"📁 File saved locally: {filename}")
        except Exception as e:
            print(f"❌ Git error: {e}")
            print(f"📁 File saved locally: {filename}")

    def morning_content(self):
        """Generate morning trend analysis"""
        print("\n🌅 MORNING CONTENT GENERATION")
        self.generate_scheduled_content("trend_analysis")

    def afternoon_content(self):
        """Generate afternoon tool spotlight"""
        print("\n☀️ AFTERNOON CONTENT GENERATION")
        self.generate_scheduled_content("tool_spotlight")

    def evening_content(self):
        """Generate evening deep dive"""
        print("\n🌙 EVENING CONTENT GENERATION")
        self.generate_scheduled_content("innovation_deep_dive")

    def reset_daily_counter(self):
        """Reset daily post counter at midnight"""
        self.posts_generated_today = 0
        print(f"\n🔄 {datetime.datetime.now().strftime('%Y-%m-%d')} - Daily counter reset")

    def start_scheduler(self):
        """Start the automated scheduling system"""
        print("🤖 Abba Baba Daily Content Scheduler Starting...")
        print("📅 Schedule:")
        print("   • 08:00 - Morning trend analysis")
        print("   • 14:00 - Afternoon tool spotlight")
        print("   • 19:00 - Evening innovation deep dive")
        print("   • 00:01 - Daily counter reset")
        print("-" * 60)

        # Schedule daily content generation
        schedule.every().day.at("08:00").do(self.morning_content)
        schedule.every().day.at("14:00").do(self.afternoon_content)
        schedule.every().day.at("19:00").do(self.evening_content)
        schedule.every().day.at("00:01").do(self.reset_daily_counter)

        print(f"⏰ Scheduler active. Next run: {schedule.next_run()}")

        # Keep the scheduler running
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute

def manual_generation(content_type="trend_analysis"):
    """Manual content generation for testing"""
    scheduler = DailyContentScheduler()
    print(f"🧪 Manual generation: {content_type}")
    scheduler.generate_scheduled_content(content_type)

def main():
    """Main execution function"""
    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == "schedule":
            # Start automated scheduler
            scheduler = DailyContentScheduler()
            scheduler.start_scheduler()

        elif command == "generate":
            # Manual generation
            content_type = sys.argv[2] if len(sys.argv) > 2 else "trend_analysis"
            manual_generation(content_type)

        elif command == "test":
            # Test single generation
            print("🧪 Testing content generation...")
            manual_generation("trend_analysis")

        else:
            print("❌ Unknown command. Use: schedule, generate [type], or test")
    else:
        print("🤖 Abba Baba Daily Content Scheduler")
        print("")
        print("Usage:")
        print("  python daily-content-scheduler.py schedule        # Start automated scheduler")
        print("  python daily-content-scheduler.py generate        # Generate one post now")
        print("  python daily-content-scheduler.py generate trend_analysis")
        print("  python daily-content-scheduler.py generate tool_spotlight")
        print("  python daily-content-scheduler.py generate innovation_deep_dive")
        print("  python daily-content-scheduler.py test           # Test generation")
        print("")
        print("Automated Schedule:")
        print("  • 08:00 - Morning trend analysis")
        print("  • 14:00 - Afternoon tool spotlight")
        print("  • 19:00 - Evening innovation deep dive")
        print("  • Max 3 posts per day")

if __name__ == "__main__":
    main()