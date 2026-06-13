from database import get_db_connection
from backend.models import User, Reservation, Event, Seat
from backend.models.enums import DOTIN_ASSOCIATIONS
from datetime import date, timedelta
from sqlalchemy import func


class AnalyticsServices:

    @staticmethod
    def get_general_stats():

        with get_db_connection() as conn:

            total_users = conn.query(User).count()

            total_dotin_users = (
                conn.query(User)
                .filter(User.association.in_(DOTIN_ASSOCIATIONS))
                .count()
            )

            total_reservations = conn.query(Reservation).count()

            active_reservations = (
                conn.query(Reservation)
                .filter(Reservation.status == "active")
                .count()
            )

            cancelled_reservations = (
                conn.query(Reservation)
                .filter(Reservation.status == "cancelled")
                .count()
            )

            over_reservations = (
                conn.query(Reservation)
                .filter(Reservation.status == "over")
                .count()
            )

            total_events = conn.query(Event).count()

            active_events = (
                conn.query(Event)
                .filter(Event.status == "active")
                .count()
            )

            cancelled_events = (
                conn.query(Event)
                .filter(Event.status == "cancelled")
                .count()
            )

            over_events = (
                conn.query(Event)
                .filter(Event.status == "over")
                .count()
            )

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
                    func.count(Reservation.id).label("reservation_count")
                )
                .join(Reservation)
                .group_by(User.id)
                .order_by(func.count(Reservation.id).desc())
                .limit(10)
                .all()
            )

            top_users = [
                {
                    "username": row.username,
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
                "users": {
                    "total": total_users,
                    "dotin": total_dotin_users,
                    "non_dotin": total_users - total_dotin_users
                },

                "reservations": {
                    "total": total_reservations,
                    "active": active_reservations,
                    "cancelled": cancelled_reservations,
                    "over": over_reservations
                },

                "events": {
                    "total": total_events,
                    "active": active_events,
                    "cancelled": cancelled_events,
                    "over": over_events
                },

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
    def get_week_stats(week_start):
        pass



    @staticmethod
    def get_day_stats(target_date):
        pass