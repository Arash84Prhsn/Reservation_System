from flask import session, redirect, url_for, request, flash
from flask_admin import AdminIndexView, expose, BaseView
from flask_admin.contrib.sqla import ModelView
from database import get_db_connection
from backend.models import User, Seat, Reservation, Event
from sqlalchemy.orm import joinedload
from sqlalchemy import func
from backend.services.seat_services import SeatServices
from backend.services.reservation_services import ReservationServices
from datetime import timedelta, date
from backend.models.enums import DOTIN_ASSOCIATIONS

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
        total_dotin_users = conn.query(User).where(User.association.in_(DOTIN_ASSOCIATIONS)).count()
        total_reservable_seats = conn.query(Seat).where(Seat.is_reservable == True).count()
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
            total_dotin_users=total_dotin_users,
            total_reservable_seats = total_reservable_seats,
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
    column_exclude_list = ["password_hash"]
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
    """Event-specific view with custom create form"""
    
    column_searchable_list = ['status', 'date']
    column_filters = ['date', 'status', 'user_id']
    
    # Hide these columns from list view (keep them, just hide from list)
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
    
    # Exclude fields from the edit/create form
    form_excluded_columns = ['created_at', 'cancelled_at']
    
    # Override the default query to eager load user
    def get_query(self):
        return self.session.query(self.model).options(joinedload(Event.user))
    
    def get_count_query(self):
        return self.session.query(func.count('*')).select_from(self.model)
    
    # ============ CUSTOM CREATE VIEW ============
    
    @expose('/new/', methods=('GET', 'POST'))
    def create_view(self):
        """Custom create view with Persian date picker and auto-filled admin ID"""
        from backend.services.user_services import UserServices
        from backend.models.events import Event
        from datetime import datetime, time, date as date_type
        from flask import session
        import jdatetime
        import re
        
        # Redirect if not logged in as admin
        if not session.get("is_admin", False):
            return redirect(url_for('admin_auth.login', next=request.url))
        
        if request.method == 'POST':
            # Get form data
            persian_date = request.form.get('date')
            start_hour = int(request.form.get('start_hour'))
            start_minute = int(request.form.get('start_minute'))
            end_hour = int(request.form.get('end_hour'))
            end_minute = int(request.form.get('end_minute'))
            
            # Convert Persian digits to English digits
            persian_digits = '۰۱۲۳۴۵۶۷۸۹'
            english_digits = '0123456789'
            translation_table = str.maketrans(persian_digits, english_digits)
            persian_date_english = persian_date.translate(translation_table)
            
            # Parse Persian date (format: YYYY/MM/DD or YYYY-MM-DD)
            parts = re.split(r'[/\-]', persian_date_english)
            if len(parts) != 3:
                return self.render('admin/event_create.html', 
                                error='فرمت تاریخ نامعتبر است')
            
            persian_year = int(parts[0])
            persian_month = int(parts[1])
            persian_day = int(parts[2])
            
            # Convert Persian (Jalali) to Gregorian
            try:
                persian_date_obj = jdatetime.date(persian_year, persian_month, persian_day)
                gregorian_date = persian_date_obj.togregorian()
            except Exception as e:
                return self.render('admin/event_create.html', 
                                error=f'تاریخ نامعتبر است: {str(e)}')
            
            # Validate time
            start_min_total = start_hour * 60 + start_minute
            end_min_total = end_hour * 60 + end_minute
            
            if start_min_total >= end_min_total:
                return self.render('admin/event_create.html', 
                                error='زمان شروع باید قبل از زمان پایان باشد')
            
            # Validate time range (8:00 - 14:00)
            if start_hour < 8 or end_hour > 14 or (end_hour == 14 and end_minute > 0):
                return self.render('admin/event_create.html', 
                                error='زمان رویداد باید بین 08:00 تا 14:00 باشد')
            
            # Create time objects
            start_time = time(start_hour, start_minute, 0)
            end_time = time(end_hour, end_minute, 0)
            
            # Get current admin user ID from session
            admin_id = session.get('admin_id')
            if not admin_id:
                return self.render('admin/event_create.html', 
                                error='لطفاً دوباره وارد شوید')
            
            # Create event
            new_event = Event(
                user_id=admin_id,
                date=gregorian_date,
                start_time=start_time,
                end_time=end_time,
                status='active'
            )
            
            # Save to database
            try:
                conn = get_db_connection()
                conn.add(new_event)
                conn.commit()
                conn.close()
                
                flash('رویداد با موفقیت ایجاد شد', 'success')
                return redirect(url_for('admin_event_view.index_view'))
            except Exception as e:
                return self.render('admin/event_create.html', 
                                error=f'خطا در ایجاد رویداد: {str(e)}')
        
        # GET request - show the form
        return self.render('admin/event_create.html')
    

class CreateEventRedirectView(BaseView):
    """A simple view that redirects to the event creation page"""
    
    @expose('/')
    def index(self):
        return redirect(url_for('admin_event_view.create_view'))