import common


class Home:
    pageTitle = "System Architecture Mapper"

    # handle HTTP GET requests here.  Name gets value from routing rules above.
    def GET(self):
             # + str(common.render._header(common.navbar, self.pageTitle)) \
        return str(common.render._head(self.pageTitle,
                                       stylesheets=["/static/css/home.css"])) \
             + str(common.render.about(self.pageTitle)) \
             + str(common.render._footer()) \
             + str(common.render._tail())