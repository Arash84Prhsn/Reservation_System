from flask import session, redirect, url_for, request
from flask_admin import AdminIndexView, expose
from flask_admin.contrib.sqla import ModelView
from database import get_db_connection
from backend.models import User, Seat, Reservation, Event
from sqlalchemy.orm import joinedload
from sqlalchemy import func

class CustomAdminIndexView(AdminIndexView):
    """Custom admin homepage with authentication"""
    
    def is_accessible(self):
        """Check if user is logged in as admin"""
        return session.get("is_admin", False)
    
    def inaccessible_callback(self, name, **kwargs):
        """Redirect to login page if not authenticated"""
        return redirect(url_for('admin_auth.login', next=request.url))
    
    @expose('/')
    def index(self):
        conn = get_db_connection()
        
        total_users = conn.query(User).count()
        total_seats = conn.query(Seat).count()
        total_reservations = conn.query(Reservation).count()
        total_events = conn.query(Event).count()
        total_active_reservations = conn.query(Reservation).where(Reservation.status=="active").count()
        total_active_events = conn.query(Event).where(Event.status=="active").count()

        
        # Eagerly load both 'user' and 'user.role' to avoid detached instance error
        recent_reservations = conn.query(Reservation).options(
            joinedload(Reservation.user).joinedload(User.role)
        ).order_by(Reservation.created_at.desc()).limit(10).all()
        
        conn.close()
        
        return self.render(
            'admin/index.html',
            total_users=total_users,
            total_seats=total_seats,
            total_reservations=total_reservations,
            total_events=total_events,
            total_active_reservations = total_active_reservations,
            total_active_events = total_active_events,
            recent_reservations=recent_reservations
        )


class CustomModelView(ModelView):
    """Base ModelView with authentication and search capabilities"""
    
    # Default sort
    column_default_sort = ('id', False)

    # Display the ID column
    column_display_pk = True
    
    # Number of items per page
    page_size = 25
    
    def is_accessible(self):
        return session.get("is_admin", False)
    
    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('admin_auth.login', next=request.url))


class UserModelView(CustomModelView):
    """User-specific view with custom searchable fields"""
    
    column_searchable_list = ['username', 'email', 'phone']
    column_filters = ['association', 'role_id', 'created_at', 'last_login']
    column_labels = {
        'username': 'Username',
        'email': 'Email',
        'phone': 'Phone',
        'association': 'Association',
        'role': 'Role',
        'created_at': 'Created At',
        'last_login': 'Last Login'
    }
    
    # Override the default query to eager load role and avoid detached instance error
    def get_query(self):
        return self.session.query(self.model).options(joinedload(User.role))
    
    def get_count_query(self):
        return self.session.query(func.count('*')).select_from(self.model)


class ReservationModelView(CustomModelView):
    """Reservation-specific view"""
    
    column_searchable_list = ['reservation_type', 'status']
    column_filters = ['reservation_date', 'status', 'seat_id', 'reservation_type']
    column_labels = {
        'id': 'ID',
        'user': 'User',
        'seat': 'Seat',
        'reservation_date': 'Date',
        'start_time': 'Start',
        'end_time': 'End',
        'reservation_type': 'Purpose',
        'status': 'Status'
    }
    
    # Override the default query to eager load user and seat
    def get_query(self):
        return self.session.query(self.model).options(
            joinedload(Reservation.user),
            joinedload(Reservation.seat)
        )
    
    def get_count_query(self):
        return self.session.query(func.count('*')).select_from(self.model)


class SeatModelView(CustomModelView):
    """Seat-specific view"""
    
    column_searchable_list = ['seat_type', 'seat_number']
    column_filters = ['seat_type', 'is_reservable']
    column_labels = {
        'id': 'ID',
        'seat_type': 'Seat Type',
        'seat_number': 'Seat Number',
        'is_reservable': 'Is Reservable'
    }
    
    # Make boolean values show as Yes/No instead of True/False
    column_formatters = {
        'is_reservable': lambda v, c, m, p: 'Yes' if m.is_reservable else 'No'
    }


class EventModelView(CustomModelView):
    """Event-specific view"""
    
    column_searchable_list = ['status', 'date']
    column_filters = ['date', 'status', 'user_id']
    
    # Hide these columns from list view if they're too verbose
    column_exclude_list = ['created_at', 'cancelled_at']
    
    column_labels = {
        'id': 'ID',
        'user': 'Created By',
        'date': 'Date',
        'start_time': 'Start',
        'end_time': 'End',
        'status': 'Status',
    }
    
    column_formatters = {
        'date': lambda v, c, m, p: m.date.strftime('%Y-%m-%d') if m.date else '-',
        'start_time': lambda v, c, m, p: m.start_time.strftime('%H:%M') if m.start_time else '-',
        'end_time': lambda v, c, m, p: m.end_time.strftime('%H:%M') if m.end_time else '-',
    }
    
    # Override the default query to eager load user
    def get_query(self):
        return self.session.query(self.model).options(joinedload(Event.user))
    
    def get_count_query(self):
        return self.session.query(func.count('*')).select_from(self.model)