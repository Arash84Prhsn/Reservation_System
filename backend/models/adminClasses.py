# from flask_admin import AdminIndexView, expose

# class MyAdminIndexView(AdminIndexView):
#     @expose('/')
#     def index(self):
#         return super().index()
    
#     def render(self, template, **kwargs):
#         # Add custom CSS to all admin pages
#         kwargs['admin_css'] = '/static/admin_custom.css'
#         return super().render(template, **kwargs)