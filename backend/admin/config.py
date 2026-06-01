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
        index_view=CustomAdminIndexView()  # This is the key!
    )
    
    # Inject custom CSS
    @app.after_request
    def inject_admin_css(response):
        if request.path.startswith('/admin') and response.content_type == 'text/html; charset=utf-8':
            css = """
                <style>
                    /* Change the background of the entire page (the "white sides") */
                    body {
                        background-color: #222 !important;
                    }
                    
                    /* Keep the content area white or your desired color */
                    body > .container {
                        width: 95% !important;
                        max-width: 95% !important;
                        background-color: white !important;
                        padding-left: 10px !important;
                        padding-right: 10px !important;
                        margin: 0 auto !important;
                    }
                    
                    /* If there's any other background */
                    .container-fluid {
                        background-color: #222 !important;
                    }
                    
                    /* Make sure the navbar itself is also #222 */
                    .navbar {
                        background-color: #222 !important;
                    }
                </style>
                """
            response.set_data(response.get_data().replace(b'</head>', f'{css}</head>'.encode()))
        return response
    
    return admin