from flask_admin import Admin, AdminIndexView, expose
from flask_admin.contrib.sqla import ModelView
from flask_admin.theme import Bootstrap4Theme

class MyAdminIndexView(AdminIndexView):
    @expose('/')
    def index(self):
        return super().index()
    
    def render(self, template, **kwargs):
        # Add custom CSS to all admin pages
        kwargs['admin_css'] = '/static/admin_custom.css'
        return super().render(template, **kwargs)