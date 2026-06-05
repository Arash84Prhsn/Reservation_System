from flask import Blueprint, render_template, request, redirect, url_for, session
from backend.services.user_services import UserServices

# Create the blueprint
admin_auth_bp = Blueprint('admin_auth', __name__, url_prefix='/admin')

@admin_auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """Admin login page"""
    # If already logged in as admin, redirect to admin panel
    if session.get('is_admin'):
        return redirect(url_for('admin.index'))
    
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        # Lowercase the username
        if username:
            username = username.lower().strip()
        
        # Get user from database
        user = UserServices.get_user_byUsername(username)
        
        if user and UserServices.verify_password(password, user.password_hash):
            # Check if user has admin or event_manager role
            if user.is_admin_role() or user.is_event_manager_role():
                session['logged_in'] = True
                session['user_id'] = user.id
                session['username'] = user.username
                session['email'] = user.email
                session['phone'] = user.phone
                session['association'] = user.association
                session['is_admin'] = True
                session['admin_id'] = user.id
                session['admin_username'] = user.username
                return redirect(url_for('admin.index'))
            else:
                return render_template('admin/login.html', error="شما دسترسی ادمین ندارید")
        else:
            return render_template('admin/login.html', error="نام کاربری یا رمز عبور اشتباه است")
    
    return render_template('admin/login.html')

@admin_auth_bp.route('/logout')
def logout():
    """Admin logout"""
    session.clear()
    return redirect(url_for('admin_auth.login'))


# from flask import Blueprint, render_template, session, redirect, url_for
# from database import get_db_connection
# from backend.models.seats import Seat
# from backend.services.reservation_services import ReservationServices
# from datetime import date, timedelta
# import jdatetime

# @admin_auth_bp.route('/seat-schedule/')
# def seat_schedule_index():
#     if not session.get('is_admin'):
#         return redirect(url_for('admin_auth.login'))
    
#     conn = get_db_connection()
#     seats = conn.query(Seat).all()
#     conn.close()
    
#     return render_template('admin/seat_schedule.html', seats=seats)

# @admin_auth_bp.route('/seat-schedule/schedule/<int:seat_id>')
# def seat_schedule_detail(seat_id):
#     if not session.get('is_admin'):
#         return redirect(url_for('admin_auth.login'))
    
#     conn = get_db_connection()
#     seat = conn.query(Seat).filter_by(id=seat_id).first()
#     conn.close()
    
#     if not seat:
#         return redirect(url_for('admin_auth.seat_schedule_index'))
    
#     today = date.today()
#     week_start = ReservationServices.get_week_start_date(today)
    
#     week_dates = []
#     persian_days = {5: 'شنبه', 6: 'یکشنبه', 0: 'دوشنبه', 1: 'سه‌شنبه', 2: 'چهارشنبه'}
    
#     for i in range(5):
#         current_date = week_start + timedelta(days=i)
#         persian = jdatetime.date.fromgregorian(date=current_date)
#         week_dates.append({
#             'date': current_date,
#             'persian_date': f"{persian.year}/{persian.month:02d}/{persian.day:02d}",
#             'day_name': persian_days.get(current_date.weekday(), '')
#         })
    
#     schedule = ReservationServices.get_weekly_schedule_timeslots_in_dates(
#         today, seat.seat_type, seat.seat_number
#     )
    
#     return render_template('admin/seat_schedule_detail.html',
#                           seat=seat, week_dates=week_dates, schedule=schedule)