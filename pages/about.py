import common


class About:
    pageTitle = "About"

    def GET(self):
        return str(common.render._head(self.pageTitle,
                                       stylesheets=["/static/css/home.css"],
                                       scripts=["/static/js/about.js"])) \
             + str(common.render._header(common.navbar, self.pageTitle)) \
             + str(common.render.about()) \
             + str(common.render._footer()) \
             + str(common.render._tail())