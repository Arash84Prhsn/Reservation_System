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

        if username:
            username = username.lower().strip()
        
        # Get user from database
        user = UserServices.get_user_byUsername(username)
        
        if user and UserServices.verify_password(password, user.password_hash):
            # Check if user has admin or event_manager role
            if user.is_admin_role() or user.is_event_manager_role():
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
    session.pop('is_admin', None)
    session.pop('admin_id', None)
    session.pop('admin_username', None)
    return redirect(url_for('admin_auth.login'))