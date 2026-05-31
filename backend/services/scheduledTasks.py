from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime, date, time
from database import get_db_connection
from backend.models.reservations import Reservation
from backend.models.events import Event
from backend.services.reservation_services import ReservationServices
from sqlalchemy import update
import atexit

def check_and_update_expired_items():
    """
    Check for active reservations and events that have ended and update their status to 'over'.
    Runs every 15 minutes during operating hours.
    """
    reservations_count, events_count = ReservationServices.update_expired_reservations_and_events()
    if reservations_count > 0 or events_count > 0:
        print(f"[{datetime.now()}] Updated {reservations_count} reservations, {events_count} events")

def init_scheduler(app):
    """Initialize and start the background scheduler"""
    scheduler = BackgroundScheduler()
    
    # Run every 15 minutes from 8AM to 2PM on Saturday to Wednesday
    scheduler.add_job(
        func=check_and_update_expired_items,
        trigger=CronTrigger(
            minute='*/15',
            hour='8-14',
            day_of_week='sat,sun,mon,tue,wed'
        ),
        id='expired_items_checker',
        replace_existing=True
    )
    
    # Also run a cleanup job daily at 3 AM (outside operating hours)
    scheduler.add_job(
        func=check_and_update_expired_items,
        trigger=CronTrigger(hour=3, minute=0),
        id='nightly_cleanup',
        replace_existing=True
    )
    
    scheduler.start()
    
    # Ensure scheduler shuts down when app exits
    atexit.register(lambda: scheduler.shutdown())
    
    print("Scheduler initialized - checking for expired reservations/events every 15 minutes")
    
    return scheduler