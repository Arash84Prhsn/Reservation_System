from datetime import datetime
from zoneinfo import ZoneInfo
import jdatetime

Tehran_TimezoneInfo = ZoneInfo("Asia/Tehran")

def persianCalendar_currentTime():
    return jdatetime.datetime.now(tz=Tehran_TimezoneInfo);

def gregorianCalendar_currentTime():
    return datetime.now(Tehran_TimezoneInfo);
