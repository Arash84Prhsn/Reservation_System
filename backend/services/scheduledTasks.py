from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
import atexit


# TODO
def init_scheduler(app):
    scheduler = BackgroundScheduler()

    # Run every 15 minutes from 8AM to 2PM on weekdays
    # scheduler.add_job(
    #     func=,
    #     trigger=CronTrigger(
    #         minute='*/15',
    #         hour='8-14',
    #         day_of_week='sat,sun,mon,tue,wed'
    #     ),
    #     id='finished_reservation_checker',
    #     replace_existing=True
    # )

    atexit.register(lambda: scheduler.shutdown())
