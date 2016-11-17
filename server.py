import sys
import os
sys.path.append(os.path.dirname(__file__))
import web

# web.config.debug = False

# Manage routing from here. Regex matches URL and chooses class by name
urls = (
    '/', 'pages.home.Home',
    '/demo', 'pages.map.Map',
    '/about', 'pages.about.About',
    '/stats', 'pages.stats.Stats',
    '/nodes', 'pages.nodes.Nodes',
    '/links', 'pages.links.Links',
    '/details', 'pages.details.Details',
    '/details/(.+)', 'pages.details.Details',
    '/portinfo', 'pages.portinfo.Portinfo',
    '/nodeinfo', 'pages.nodeinfo.Nodeinfo',
    '/metadata', 'pages.metadata.Metadata',
    '/table', 'pages.table.Table',
)

if __name__ == "__main__":
    app = web.application(urls, globals())
    app.run()
