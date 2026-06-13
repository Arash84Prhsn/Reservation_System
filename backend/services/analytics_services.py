from database import get_db_connection
from backend.models import User, Reservation, Event, Seat
from backend.models.enums import DOTIN_ASSOCIATIONS
from datetime import datetime, date, timedelta
from sqlalchemy import func
from collections import defaultdict


class AnalyticsServices:

    @staticmethod
    def get_general_stats():

        with get_db_connection() as conn:

            reservation_types = (
                conn.query(
                    Reservation.reservation_type,
                    func.count(Reservation.id)
                )
                .group_by(Reservation.reservation_type)
                .all()
            )

            reservation_type_stats = {
                row[0]: row[1]
                for row in reservation_types
            }

            user_associations = (
                conn.query(
                    User.association,
                    func.count(User.id)
                )
                .group_by(User.association)
                .all()
            )

            association_stats = {
                row[0]: row[1]
                for row in user_associations
            }

            top_users = (
                conn.query(
                    User.username,
                    User.association,
                    func.count(Reservation.id).label("reservation_count")
                )
                .join(Reservation)
                .group_by(User.id)
                .order_by(func.count(Reservation.id).desc())
                .limit(13)
                .all()
            )

            top_users = [
                {
                    "username": row.username,
                    "association": row.association,
                    "reservation_count": row.reservation_count
                }
                for row in top_users
            ]

            seat_usage = (
                conn.query(
                    Seat.seat_type,
                    Seat.seat_number,
                    func.count(Reservation.id).label("reservation_count")
                )
                .outerjoin(Reservation, Reservation.seat_id == Seat.id)
                .group_by(Seat.id)
                .order_by(func.count(Reservation.id).desc())
                .all()
            )

            seat_usage = [
                {
                    "name": f"{row.seat_type} {row.seat_number}",
                    "seat_type": row.seat_type,
                    "seat_number": row.seat_number,
                    "count": row.reservation_count
                }
                for row in seat_usage
            ]

            return {
                "reservation_types": reservation_type_stats,
                "top_users": top_users,
                "user_associations": association_stats,
                "seat_usage": seat_usage,
            }


    @staticmethod
    def get_seat_usage():
        with get_db_connection() as conn:

            seat_usage = (
                conn.query(
                    Seat.seat_type,
                    func.count(Reservation.id).label("count")
                )
                .join(Reservation, Reservation.seat_id == Seat.id)
                .group_by(Seat.id)
                .order_by(func.count(Reservation.id).desc())
                .limit(15)
                .all()
            )

            return [
                {
                    "seat": row.seat_type,
                    "count": row.count
                }
                for row in seat_usage
            ]
        
    @staticmethod
    def get_seat_usage_by_type():

        with get_db_connection() as conn:

            data = (
                conn.query(
                    Seat.seat_type,
                    func.count(Reservation.id).label("count")
                )
                .join(Reservation, Reservation.seat_id == Seat.id)
                .group_by(Seat.seat_type)
                .order_by(func.count(Reservation.id).desc())
                .all()
            )

            return [
                {
                    "type": row.seat_type,
                    "count": row.count
                }
                for row in data
            ]
        
    
    @staticmethod
    def get_seat_usage_by_seat():

        with get_db_connection() as conn:

            data = (
                conn.query(
                    Seat.seat_type,
                    Seat.seat_number,
                    func.count(Reservation.id).label("count")
                )
                .join(Reservation, Reservation.seat_id == Seat.id)
                .group_by(Seat.id)
                .order_by(func.count(Reservation.id).desc())
                .limit(15)
                .all()
            )

            return [
                {
                    "seat": f"{row.seat_type} {row.seat_number}",
                    "count": row.count
                }
                for row in data
            ]
        

    @staticmethod
    def get_busiest_hours():

        hour_counts = defaultdict(int)

        with get_db_connection() as conn:

            reservations = conn.query(Reservation).all()

            for r in reservations:

                if not r.start_time or not r.end_time:
                    continue

                start_hour = r.start_time.hour
                end_hour = r.end_time.hour

                # IMPORTANT:
                # include all hours touched by reservation
                for hour in range(start_hour, end_hour + 1):
                    hour_counts[hour] += 1

        # we only want 8 → 13
        hours = list(range(8, 14))
        values = [hour_counts[h] for h in hours]

        return {
            "hours": hours,
            "counts": values
        }
    
    @staticmethod
    def get_weekly_reservation_trend():
        with get_db_connection() as conn:

            today = datetime.utcnow().date()

            # find start of current week (Monday-based)
            current_week_start = today - timedelta(days=today.weekday())

            labels = []
            values = []

            for i in range(-4, 1):  # 4 past weeks + current
                week_start = current_week_start + timedelta(weeks=i)
                week_end = week_start + timedelta(days=7)

                count = (
                    conn.query(Reservation)
                    .filter(
                        Reservation.created_at >= week_start,
                        Reservation.created_at < week_end
                    )
                    .count()
                )

                if i == 0:
                    labels.append("This week")
                elif i == -1:
                    labels.append("Last week")
                else:
                    labels.append(f"{i} weeks")

                values.append(count)

            return {
                "labels": labels,
                "values": values
            }

    @staticmethod
    def get_week_stats(week_start):
        pass



    @staticmethod
    def get_day_stats(target_date):
        pass