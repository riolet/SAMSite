import sys, os
sys.path.append(os.path.dirname(__file__))
import web
import pages.home

# Manage routing from here. Regex matches URL and chooses class by name
urls = (
    '/', 'pages.home.Home',
    '/demo', 'pages.map.Map',
    '/about', 'pages.about.About',
    '/stats', 'pages.stats.Stats',
    '/query', 'pages.query.Query',
    '/details', 'pages.details.Details'
)


# For development testing, uncomment these 3 lines
if __name__ == "__main__":
    app = web.application(urls, globals())
    app.run()

# For apache2 mod_wsgi deployment, uncomment these two lines
# app = web.application(urls, globals(), autoreload=False)
# application = app.wsgifunc()
