import common


class Support:
    pageTitle = "Support Plans"

    def GET(self):
        return str(common.render._head(self.pageTitle,
                                       stylesheets=["/static/css/home.css"],
                                       scripts=[])) \
             + str(common.render._header(common.navbar, self.pageTitle)) \
             + str(common.render.support()) \
             + str(common.render._footer()) \
             + str(common.render._tail())