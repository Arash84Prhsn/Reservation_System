from flask import session, redirect, url_for, request
from flask_admin import AdminIndexView, expose
from flask_admin.contrib.sqla import ModelView
from database import get_db_connection
from backend.models import User, Seat, Reservation, Event
from sqlalchemy.orm import joinedload

class CustomAdminIndexView(AdminIndexView):
    """Custom admin homepage"""
    
    @expose('/')
    def index(self):
        conn = get_db_connection()
        
        total_users = conn.query(User).count()
        total_seats = conn.query(Seat).count()
        total_reservations = conn.query(Reservation).count()
        total_events = conn.query(Event).count()
        
        # Eagerly load the 'user' relationship to avoid detached instance error
        recent_reservations = conn.query(Reservation).options(
            joinedload(Reservation.user)
        ).order_by(Reservation.created_at.desc()).limit(15).all()
        
        conn.close()
        
        return self.render(
            'admin/index.html',
            total_users=total_users,
            total_seats=total_seats,
            total_reservations=total_reservations,
            total_events=total_events,
            recent_reservations=recent_reservations
        )

class CustomModelView(ModelView):
    """Base ModelView with authentication"""
    
    def is_accessible(self):
        return session.get('is_admin', False)
    
    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('admin_auth.login', next=request.url))