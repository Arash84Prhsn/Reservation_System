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
                /* Make navbar full width */
                .navbar {
                    width: 100% !important;
                    position: relative !important;
                    left: 0 !important;
                    right: 0 !important;
                    margin-left: 0 !important;
                    margin-right: 0 !important;
                    border-radius: 0 !important;
                }
                body > .container {
                    width: 75% !important;
                    max-width: 75% !important;
                    padding-left: 10px !important;
                    padding-right: 10px !important;
                }
                .row {
                    margin-left: 0 !important;
                    margin-right: 0 !important;
                }
                .table-responsive {
                    overflow-x: auto !important;
                }
                td, th {
                    white-space: normal !important;
                    word-wrap: break-word !important;
                }
                .card {
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    margin-bottom: 20px;
                }
                .card-header {
                    background-color: #f8f9fa;
                    font-weight: bold;
                }
                .card h3 {
                    color: #007bff;
                    margin: 0;
                }
            </style>
            """
            response.set_data(response.get_data().replace(b'</head>', f'{css}</head>'.encode()))
        return response
    
    return admin