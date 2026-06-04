from flask import request
from flask_admin import Admin
from flask_admin.theme import Bootstrap4Theme
from backend.admin.views import CustomAdminIndexView

admin = None

def init_admin(app):
    global admin
    
    # Create admin instance with custom index view
    admin = Admin(
        app,
        name="Reservation System Admin",
        theme=Bootstrap4Theme(swatch="lumen"),
        index_view=CustomAdminIndexView()  # This is critical for authentication
    )
    
    # Inject custom CSS
    @app.after_request
    def inject_admin_css(response):
        if request.path.startswith('/admin') and response.content_type == 'text/html; charset=utf-8':
            css_link = '<link rel="stylesheet" href="/static/css/admin_theme.css">'
            response.set_data(response.get_data().replace(b'</head>', f'{css_link}</head>'.encode()))
        return response
    
    return admin