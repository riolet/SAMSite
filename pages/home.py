import common


class Home:
    pageTitle = "SAM - System Architecture Mapper"

    # handle HTTP GET requests here.  Name gets value from routing rules above.
    def GET(self):
        return str(common.render._head(self.pageTitle,
                                       stylesheets=["/static/css/home.css"],
                                       scripts=["/static/js/home.js"])) \
             + str(common.render._header(common.navbar, self.pageTitle)) \
             + str(common.render.home(self.pageTitle)) \
             + str(common.render._tail())