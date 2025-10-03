---
layout: default
title: "AI Insights Blog"
description: "Thoughts on AI-human collaboration, automation trends, and the future of intelligent work from the Abba Baba team."
---

<div class="blog-header">
    <div class="container">
        <h1 class="blog-title">AI Insights</h1>
        <p class="blog-subtitle">Exploring the future of AI-human collaboration</p>

        <div class="blog-search">
            <input type="text" id="search-input" placeholder="Search articles..." class="search-input">
            <button id="search-button" class="search-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
            </button>
        </div>
    </div>
</div>

<div class="blog-content">
    <div class="container">
        <div class="blog-grid">
            <main class="blog-posts">
                {% if site.posts.size > 0 %}
                    {% for post in site.posts %}
                    <article class="blog-post-card">
                        <div class="post-meta">
                            <time datetime="{{ post.date | date_to_xmlschema }}" class="post-date">
                                {{ post.date | date: "%B %d, %Y" }}
                            </time>
                            {% if post.categories %}
                            <div class="post-categories">
                                {% for category in post.categories %}
                                <span class="category">{{ category }}</span>
                                {% endfor %}
                            </div>
                            {% endif %}
                        </div>

                        <h2 class="post-title">
                            <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
                        </h2>

                        <div class="post-excerpt">
                            {{ post.excerpt | strip_html | truncatewords: 30 }}
                        </div>

                        <div class="post-footer">
                            <span class="read-time">{{ post.content | number_of_words | divided_by: 200 | plus: 1 }} min read</span>
                            <a href="{{ post.url | relative_url }}" class="read-more">Read More →</a>
                        </div>
                    </article>
                    {% endfor %}
                {% else %}
                    <div class="no-posts">
                        <h2>Coming Soon!</h2>
                        <p>We're preparing exciting content about AI-human collaboration, automation insights, and the future of intelligent work.</p>
                        <p>Check back soon for our latest thoughts on:</p>
                        <ul>
                            <li>AI automation trends and best practices</li>
                            <li>Real-world automation case studies</li>
                            <li>The philosophy of human-centric AI</li>
                            <li>Riddlen platform development updates</li>
                            <li>Industry insights and predictions</li>
                        </ul>
                        <p><strong>Want to be notified when we publish?</strong> <a href="{{ '/contact' | relative_url }}">Get in touch</a> and we'll let you know!</p>
                    </div>
                {% endif %}
            </main>

            <aside class="blog-sidebar">
                <div class="sidebar-widget">
                    <h3>Categories</h3>
                    <ul class="category-list">
                        <li><a href="#ai-trends">AI Trends</a></li>
                        <li><a href="#automation">Automation</a></li>
                        <li><a href="#case-studies">Case Studies</a></li>
                        <li><a href="#riddlen">Riddlen Updates</a></li>
                        <li><a href="#thought-leadership">Thought Leadership</a></li>
                    </ul>
                </div>

                <div class="sidebar-widget">
                    <h3>Subscribe</h3>
                    <p>Stay updated with our latest insights on AI-human collaboration.</p>
                    <a href="{{ site.url }}/feed.xml" class="btn btn-secondary">RSS Feed</a>
                </div>

                <div class="sidebar-widget">
                    <h3>Popular Topics</h3>
                    <div class="tag-cloud">
                        <span class="tag">AI Automation</span>
                        <span class="tag">Workflow Optimization</span>
                        <span class="tag">Human-AI Collaboration</span>
                        <span class="tag">Marketing Automation</span>
                        <span class="tag">Web3</span>
                        <span class="tag">Oracle Networks</span>
                        <span class="tag">Future of Work</span>
                        <span class="tag">Business Intelligence</span>
                    </div>
                </div>
            </aside>
        </div>
    </div>
</div>

<script>
// Simple client-side search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const blogPosts = document.querySelectorAll('.blog-post-card');

    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();

        blogPosts.forEach(post => {
            const title = post.querySelector('.post-title a').textContent.toLowerCase();
            const excerpt = post.querySelector('.post-excerpt').textContent.toLowerCase();
            const categories = Array.from(post.querySelectorAll('.category')).map(cat => cat.textContent.toLowerCase()).join(' ');

            const searchableText = title + ' ' + excerpt + ' ' + categories;

            if (searchTerm === '' || searchableText.includes(searchTerm)) {
                post.style.display = 'block';
            } else {
                post.style.display = 'none';
            }
        });

        // Show "no results" message if no posts are visible
        const visiblePosts = Array.from(blogPosts).filter(post => post.style.display !== 'none');
        let noResultsMsg = document.querySelector('.no-search-results');

        if (searchTerm !== '' && visiblePosts.length === 0) {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('div');
                noResultsMsg.className = 'no-search-results';
                noResultsMsg.innerHTML = `
                    <h3>No articles found</h3>
                    <p>No articles match your search for "<strong>${searchTerm}</strong>"</p>
                    <p>Try different keywords or browse all articles.</p>
                `;
                document.querySelector('.blog-posts').appendChild(noResultsMsg);
            }
        } else if (noResultsMsg) {
            noResultsMsg.remove();
        }
    }

    searchInput.addEventListener('input', performSearch);
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
});
</script>