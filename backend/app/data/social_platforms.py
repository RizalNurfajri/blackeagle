# Social media platforms configuration for OSINT checks

SOCIAL_PLATFORMS = [
    # Major platforms
    {
        "name": "GitHub",
        "category": "development",
        "check_type": "email_api",
        "url_template": "https://api.github.com/search/users?q={email}+in:email",
        "profile_url": "https://github.com/{username}",
        "icon": "github"
    },
    {
        "name": "Gravatar",
        "category": "identity",
        "check_type": "hash",
        "url_template": "https://www.gravatar.com/avatar/{hash}?d=404",
        "profile_url": "https://gravatar.com/{hash}",
        "icon": "user-circle"
    },
    {
        "name": "Twitter/X",
        "category": "social",
        "check_type": "username_derived",
        "url_template": "https://twitter.com/{username}",
        "icon": "twitter"
    },
    {
        "name": "Instagram",
        "category": "social",
        "check_type": "username_derived",
        "url_template": "https://www.instagram.com/{username}/",
        "icon": "instagram"
    },
    {
        "name": "LinkedIn",
        "category": "professional",
        "check_type": "email_search",
        "url_template": "https://www.linkedin.com/in/{username}",
        "icon": "linkedin"
    },
    {
        "name": "Facebook",
        "category": "social",
        "check_type": "email_search",
        "url_template": "https://www.facebook.com/{username}",
        "icon": "facebook"
    },
    # Tech platforms
    {
        "name": "GitLab",
        "category": "development",
        "check_type": "api",
        "url_template": "https://gitlab.com/api/v4/users?search={email}",
        "profile_url": "https://gitlab.com/{username}",
        "icon": "gitlab"
    },
    {
        "name": "Bitbucket",
        "category": "development",
        "check_type": "username_derived",
        "url_template": "https://bitbucket.org/{username}/",
        "icon": "bitbucket"
    },
    {
        "name": "Stack Overflow",
        "category": "development",
        "check_type": "email_hash",
        "url_template": "https://stackoverflow.com/users/{id}",
        "icon": "stack-overflow"
    },
    {
        "name": "Dev.to",
        "category": "development",
        "check_type": "username_derived",
        "url_template": "https://dev.to/{username}",
        "icon": "dev"
    },
    {
        "name": "Medium",
        "category": "content",
        "check_type": "username_derived",
        "url_template": "https://medium.com/@{username}",
        "icon": "medium"
    },
    # Entertainment
    {
        "name": "Spotify",
        "category": "entertainment",
        "check_type": "username_derived",
        "url_template": "https://open.spotify.com/user/{username}",
        "icon": "spotify"
    },
    {
        "name": "SoundCloud",
        "category": "entertainment",
        "check_type": "username_derived",
        "url_template": "https://soundcloud.com/{username}",
        "icon": "soundcloud"
    },
    {
        "name": "Twitch",
        "category": "entertainment",
        "check_type": "username_derived",
        "url_template": "https://www.twitch.tv/{username}",
        "icon": "twitch"
    },
    {
        "name": "YouTube",
        "category": "entertainment",
        "check_type": "username_derived",
        "url_template": "https://www.youtube.com/@{username}",
        "icon": "youtube"
    },
    # Gaming
    {
        "name": "Steam",
        "category": "gaming",
        "check_type": "username_derived",
        "url_template": "https://steamcommunity.com/id/{username}",
        "icon": "steam"
    },
    {
        "name": "Discord",
        "category": "communication",
        "check_type": "email_check",
        "url_template": "https://discord.com/api/v9/auth/register",
        "icon": "discord"
    },
    {
        "name": "Reddit",
        "category": "social",
        "check_type": "username_derived",
        "url_template": "https://www.reddit.com/user/{username}",
        "icon": "reddit"
    },
    {
        "name": "TikTok",
        "category": "social",
        "check_type": "username_derived",
        "url_template": "https://www.tiktok.com/@{username}",
        "icon": "tiktok"
    },
    {
        "name": "Pinterest",
        "category": "social",
        "check_type": "username_derived",
        "url_template": "https://www.pinterest.com/{username}/",
        "icon": "pinterest"
    },
    # Messaging
    {
        "name": "Telegram",
        "category": "communication",
        "check_type": "username_derived",
        "url_template": "https://t.me/{username}",
        "icon": "telegram"
    },
    {
        "name": "Skype",
        "category": "communication",
        "check_type": "email_search",
        "url_template": "https://web.skype.com/",
        "icon": "skype"
    },
    # Other
    {
        "name": "Flickr",
        "category": "photography",
        "check_type": "username_derived",
        "url_template": "https://www.flickr.com/photos/{username}",
        "icon": "flickr"
    },
    {
        "name": "Dribbble",
        "category": "design",
        "check_type": "username_derived",
        "url_template": "https://dribbble.com/{username}",
        "icon": "dribbble"
    },
    {
        "name": "Behance",
        "category": "design",
        "check_type": "username_derived",
        "url_template": "https://www.behance.net/{username}",
        "icon": "behance"
    },
]


def get_platforms_by_category(category: str) -> list:
    """Get all platforms in a specific category."""
    return [p for p in SOCIAL_PLATFORMS if p["category"] == category]


def get_all_platforms() -> list:
    """Get all configured platforms."""
    return SOCIAL_PLATFORMS
