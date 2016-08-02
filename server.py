import web
import pages.home

# Manage routing from here. Regex matches URL and chooses class by name
urls = (
    '/', 'pages.home.Home',
    '/map', 'pages.home.Home',
)


if __name__ == "__main__":
    app = web.application(urls, globals())
    app.run()
