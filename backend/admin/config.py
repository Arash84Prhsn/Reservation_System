from flask import request
from flask_admin import Admin
from flask_admin.theme import Bootstrap4Theme
from backend.admin.views import CustomAdminIndexView
from flask_admin.menu import MenuLink
from database.connection import get_db_connection, get_db_scoped_session
from backend.admin.views import UserModelView, ReservationModelView, EventModelView, SeatModelView
from backend.admin.views import CreateEventRedirectView, SeatScheduleView, CancelEventsView
from backend.models import User, Reservation, Seat, Event

admin = None

def init_admin(app):
    global admin
    
    # Create admin instance with custom index view
    admin = Admin(
        app,
        name="ادمین پنل سیستم رزرو",
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

    # Add the logout button
    admin.add_link(MenuLink(
        name='Logout',
        url='/admin/logout',
        category='',
        icon_type='fa',
        icon_value='fa-sign-out-alt',
        class_name='logout-btn'
    ))

    # Connect the admin page to the models
    db_session = get_db_scoped_session()

    # Add views for the tables
    admin.add_view(UserModelView(User, db_session, endpoint='admin_user_view', name='Users'))
    admin.add_view(SeatModelView(Seat, db_session, endpoint='admin_seat_view', name='Seats'))
    admin.add_view(ReservationModelView(Reservation, db_session, endpoint='admin_reservation_view', name='Reservations'))
    admin.add_view(EventModelView(Event, db_session, endpoint='admin_event_view', name='Events'))

    # Add the redirect view to the menu (appears in the left navbar)
    admin.add_view(CreateEventRedirectView(
        name='➕ Create Event',
        category="Event Actions",
        endpoint='create_event'
    ))

    admin.add_view(
        CancelEventsView(
            name='🚫 Cancel Events',
            endpoint='cancelevents',
            category="Event Actions"
        )
    )

    admin.add_view(SeatScheduleView(
    name='📅 Seat Schedules',
    endpoint='seatschedule'
    ))

    
    return admin